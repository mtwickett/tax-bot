import express from 'express';
import http from 'http'; 
import path from 'path';
import { WebSocketServer } from 'ws';
import { twilioStream } from '@/twilio/twilio-ws';


const app = express();
app.use(express.urlencoded({ extended: false }));
app.use('/audio', express.static(path.join(__dirname, '..', '..', 'public')));
const PORT = Number(process.env.PORT) || 3000;

// Express server
const server = http.createServer(app);

// Express WebSocketServer for Twilio Media Streams Websocket
const wss = new WebSocketServer({ server, path: '/audiostream' });

twilioStream(wss);

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});

export { app, wss };
