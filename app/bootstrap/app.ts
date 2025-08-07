import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { twilioStream } from '../twilio/twilio-ws';
import { twiml } from 'twilio';
import { Request, Response } from 'express'; 
import dotenv from 'dotenv';

dotenv.config();


// Express app
const app = express();

// Register middleware
app.use(express.urlencoded({ extended: false }));
app.use('/audio', express.static(path.join(__dirname, '..', '..', 'public')));

// Test route
app.get('/', (_req, res) => {
  res.send('✅ Express server is up and running');
});

// Twilio route
app.post('/webhook/stream', (req: Request, res: Response) => {
  console.log('📞 Stream webhook hit');
  
  const response = new twiml.VoiceResponse();
  const connect = response.connect();
  connect.stream({ url: `wss://${process.env.NGROK_DOMAIN}/audiostream` });
  
  res.type('text/xml').send(response.toString());
});

// HTTP Express server
const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

// WebSocket server for Twilio Media Streams
const wss = new WebSocketServer({ server, path: '/audiostream' });
// Stream event handlers
twilioStream(wss); 

// Start the server
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
