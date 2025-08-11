import { WebSocketServer, WebSocket } from 'ws';
import { streamTTS } from '../deepgram/TTS';


export const twilioStream = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 Twilio Media WebSocket connected');

    let twilioStreamSid: string | null = null;

    ws.on('message', async (message) => {
      try {
        const msgStr = typeof message === 'string' ? message : message.toString('utf-8');
        const msg = JSON.parse(msgStr);

        switch (msg.event) {
          case 'connected':
            console.log('🟢 Twilio stream: connected');
            break;

          case 'start':
            twilioStreamSid = msg?.start?.streamSid || msg.streamSid;
            console.log('▶️ Stream started');
            ws.send(JSON.stringify({ event: 'clear', streamSid: twilioStreamSid }));
            streamTTS('Hello', ws, twilioStreamSid!);
            break;

          case 'media':
            // Incoming μ-law audio — forward to Deepgram STT or buffer as needed
            const audio = msg.media.payload; // base64 encoded
            // TODO: decode & forward to Deepgram STT if desired
            break;

          case 'stop':
            console.log('⛔️ Stream stopped');
            twilioStreamSid = null;
            // Cleanup: close Deepgram connection, etc.
            break;

          default:
            console.log('📦 Unhandled event:', msg.event);
        }
      } catch (err) {
        console.error('❗️ Failed to process Twilio message:', err);
      }
    });

    ws.on('close', () => {
      console.log('❌ WebSocket connection closed');
      // Cleanup logic if needed
    });

    ws.on('error', (err) => {
      console.error('❗️ WebSocket error:', err);
    });
  });
};