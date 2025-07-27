import http from 'http';
import app from './app';
import { WebSocketServer } from 'ws';
import { handleMediaConnection } from './connections';
import { synthesizeSpeech } from '@/features/eleven-labs';

const PORT = Number(process.env.PORT) || 3000;

// Create HTTP server from Express
const server = http.createServer(app);

// WebSocket server for Twilio Media Streams
const wss = new WebSocketServer({ server, path: '/media' });
wss.on('connection', handleMediaConnection);

synthesizeSpeech("Hello, thank you for calling Sentry Tax. How can I help you today?", "greeting.mp3")
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to synthesize greeting:", err);
    process.exit(1); // optional: exit if critical
  });