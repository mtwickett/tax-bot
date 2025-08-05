import { WebSocketServer, WebSocket } from 'ws';
import { wss } from '@/bootstrap/app';


export const twilioStream = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 Twilio Media WebSocket connected');

    let twilioStreamSid: string | null = null;

    ws.on('message', (data) => {
      try {
        const msgStr = typeof data === 'string' ? data : data.toString('utf-8');
        const msg = JSON.parse(msgStr);

        switch (msg.event) {
          case 'connected':
            console.log('🟢 Twilio stream: connected');
            break;

          case 'start':
            twilioStreamSid = msg.streamSid;
            console.log(`▶️ Stream started (SID: ${twilioStreamSid})`);
            // You can now initiate Deepgram STT or call streamTTS if bot should talk first
            break;

          case 'media':
            // Incoming μ-law audio — forward to Deepgram STT or buffer as needed
            const audio = msg.media.payload; // base64 encoded
            // TODO: decode & forward to Deepgram STT if desired
            break;

          case 'stop':
            console.log('⛔️ Stream stopped');
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