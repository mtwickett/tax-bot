import { createClient, LiveTTSEvents } from '@deepgram/sdk';


const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export const streamTTS = async (text: string): Promise<void> => {
  if (!DEEPGRAM_API_KEY) {
    throw new Error("Deepgram API key not set in environment.");
  }

  const deepgram = createClient(DEEPGRAM_API_KEY);

  let deepgramConnection: ReturnType<typeof deepgram.speak.live> | null = null;

    deepgramConnection = deepgram.speak.live({
        model: 'aura-2-thalia-en',         // voice
        encoding: 'mulaw',                 // μ-law encoding for telephony
        sample_rate: 8000,                 // 8000 Hz sample rate to match Twilio requirements}
        container: 'none'                  // no container (raw audio) to avoid WAV headers/clicks:contentReference[oaicite:3]{index=3}
    });

    // Set up Deepgram live TTS event handlers
    deepgramConnection.on(LiveTTSEvents.Open, () => {
        console.log('Deepgram TTS connection opened');

        // Send text to be converted to speech
        deepgramConnection.sendText(text);

        // Send flush message to the server after sending the text
        deepgramConnection.flush();
    });

    // Receive an audio chunk from Deepgram (μ-law 8kHz bytes)
    deepgramConnection.on(LiveTTSEvents.Audio, (data: Buffer) => {
        // Convert to Base64 for Twilio
        const b64Audio = data.toString('base64');
        
    deepgramConnection.on(LiveTTSEvents.Close, () => {
        console.log('Deepgram TTS connection closed');
    });

    deepgramConnection.on(LiveTTSEvents.Error, (err: any) => {
        console.log('Deepgram TTS error:', err);
    });
