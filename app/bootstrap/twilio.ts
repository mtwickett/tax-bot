import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { twiml } from 'twilio';
import path from 'path';
import { synthesizeSpeech } from '../features/eleven-labs';

const app = express();
app.use(express.urlencoded({ extended: false }));
const PORT = Number(process.env.PORT) || 3000;

// Create HTTP server from Express
const server = http.createServer(app);

// WebSocket server for Twilio Media Streams
const wss = new WebSocketServer({ server, path: '/media' });

// Serve static MP3 files from the /public directory
app.use('/audio', express.static(path.join(__dirname, '..', '..', 'public')));

// 1️⃣ Route for initial greeting
app.post('/webhook/greeting', (req: Request, res: Response) => {
    console.log('📞 Greeting webhook hit');

    const response = new twiml.VoiceResponse();
    response.play(`https://${process.env.NGROK_DOMAIN}/audio/greeting.mp3`);
    response.redirect('/webhook/stream');

    res.type('text/xml').send(response.toString());
})

// 2️⃣ Route to start bidirectional streaming
app.post('/webhook/stream', (req: Request, res: Response) => {
  console.log('📞 Stream webhook hit');
  const response = new twiml.VoiceResponse();
  const connect = response.connect();
  connect.stream({ url: `wss://${process.env.NGROK_DOMAIN}/audiostream` });
  
  res.type('text/xml').send(response.toString());
});

synthesizeSpeech("Hello", "greeting.mp3")
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to synthesize greeting:", err);
    process.exit(1); // optional: exit if critical
  });