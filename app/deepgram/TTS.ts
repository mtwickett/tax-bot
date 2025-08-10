import { createClient, LiveTTSEvents } from '@deepgram/sdk';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export const streamTTS = (text: string, twilioWs: WebSocket, streamSid: string): void => {
  if (!DEEPGRAM_API_KEY) throw new Error("Deepgram API key not set in environment.");

  const deepgram = createClient(DEEPGRAM_API_KEY);

  try {
    // Create a WebSocket connection to Deepgram TTS
    const deepgramConnection = deepgram.speak.live({
      model: 'aura-2-thalia-en',         // voice
      encoding: 'mulaw',                 // μ-law encoding for telephony
      sample_rate: 8000,                 // 8000 Hz sample rate to match Twilio requirements}
      container: 'none'                  // no container (raw audio) to avoid WAV headers/clicks
    });
    
    deepgramConnection.on(LiveTTSEvents.Open, () => {
      console.log('✅ Deepgram TTS connection opened');
      deepgramConnection.sendText(text);
      deepgramConnection.flush();
    });

    // Send audio chunks to Twilio
    deepgramConnection.on(LiveTTSEvents.Audio, (data: Buffer | Uint8Array) => {
      console.log('🔊 Got audio chunk, size:', data.length);
      const payload =  Buffer.from(data).toString('base64');

      twilioWs.send(JSON.stringify({
        event: 'media',
        streamSid,
        media: { payload },
      }));

      twilioWs.send(JSON.stringify({
        event: 'mark',
        streamSid,
        mark: { name: `dg-${Date.now()}` },
      }));
    });

    deepgramConnection.on(LiveTTSEvents.Close, () => {
      console.log('🔒 Deepgram TTS connection closed');
      });

    deepgramConnection.on(LiveTTSEvents.Error, (err) => {
      console.error('❌ Deepgram TTS error:', err);
    });
  } catch (err) {
    console.error('An error occurred:', err);
  }
}