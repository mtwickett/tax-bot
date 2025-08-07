import { createClient, LiveTTSEvents } from '@deepgram/sdk';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';

dotenv.config();
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export const streamTTS = async (text: string, ws: WebSocket): Promise<void> => {

  if (!DEEPGRAM_API_KEY) {
      throw new Error("Deepgram API key not set in environment.");
  }

  const deepgram = createClient(DEEPGRAM_API_KEY);

  let deepgramConnection: ReturnType<typeof deepgram.speak.live> | null = null;

  try {
    // Create a WebSocket connection to Deepgram TTS
    deepgramConnection = deepgram.speak.live({
      model: 'aura-2-thalia-en',         // voice
      encoding: 'mulaw',                 // μ-law encoding for telephony
      sample_rate: 8000,                 // 8000 Hz sample rate to match Twilio requirements}
      container: 'none'                  // no container (raw audio) to avoid WAV headers/clicks
    });
    
    deepgramConnection.on(LiveTTSEvents.Open, () => {
      console.log('✅ Deepgram TTS connection opened');
    });

    // Send audio chunks to Twilio
    deepgramConnection.on(LiveTTSEvents.Audio, (data: Buffer) => {
      console.log('🔊 Got audio chunk, size:', data.length);
      const audioPayload = data.toString('base64');

      const message = {
        event: 'media',
        media: {
          payload: audioPayload,
        },
      };

      ws.send(JSON.stringify(message));
    });

    deepgramConnection.on(LiveTTSEvents.Close, () => {
      console.log('🔒 Deepgram TTS connection closed');
    });

    deepgramConnection.on(LiveTTSEvents.Error, (err) => {
      console.error('❌ Deepgram TTS error:', err);
    });

    // ✅ Trigger the connection immediately
    deepgramConnection.sendText(text);
    deepgramConnection.flush();
  } catch (err) {
    console.error('An error occurred:', err);
  }
}