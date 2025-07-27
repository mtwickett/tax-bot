import * as http from 'http';
import app from './app';
import { WebSocketServer } from 'ws';
import { handleMediaConnection } from './connections';

const PORT = Number(process.env.PORT) || 3000;

// Create HTTP server from Express
const server = http.createServer(app);

// WebSocket server for Twilio Media Streams
const wss = new WebSocketServer({ server, path: '/media' });
wss.on('connection', handleMediaConnection);

server.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});