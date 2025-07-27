import WebSocket from 'ws';
import axios from 'axios';

import { DeepgramMessage } from '@/types/deepgram';
import { TwilioEvent } from '@/types/twilio';


export const handleMediaConnection = (ws: WebSocket) => {
  console.log('🔌 Twilio WebSocket connected');

  let deepgramReady = false;
  const audioBuffer: Buffer[] = [];

  const dgSocket = new WebSocket(
    `wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000`,
    { headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` } }
  );

  dgSocket.on('open', () => {
    console.log('🔗 Connected to Deepgram');
    deepgramReady = true;
    audioBuffer.forEach(chunk => dgSocket.send(chunk));
    audioBuffer.length = 0;
  });

  dgSocket.on('message', async raw => {
    const msg = JSON.parse(raw.toString()) as DeepgramMessage;
    const alt = msg.channel?.alternatives?.[0]?.transcript;
    if (!alt) return;

    console[ msg.is_final ? 'log' : 'log' ](
      msg.is_final ? '✅ Final:' : '⏳ Interim:', alt
    );

    if (msg.is_final) {
      try {
        await axios.post(
          'https://mtwickett.app.n8n.cloud/webhook/tax-bot',
          { transcript: alt, caller: 'someCallerId' }
        );
        console.log('📤 Sent transcript to n8n');
      } catch (e) {
        console.error('❌ Error sending to n8n:', (e as Error).message);
      }
    }
  });

  ws.on('message', raw => {
    const ev = JSON.parse(raw.toString()) as TwilioEvent;
    if (ev.event === 'start') {
      console.log('🟢 Stream started');
    } else if (ev.event === 'media' && ev.media) {
      const audio = Buffer.from(ev.media.payload, 'base64');
      deepgramReady ? dgSocket.send(audio) : audioBuffer.push(audio);
    } else if (ev.event === 'stop') {
      console.log('🔴 Stream stopped');
      dgSocket.close();
    }
  });

  ws.on('close', () => {
    console.log('❌ Twilio WebSocket closed');
    dgSocket.close();
  });
}
