import 'dotenv/config';
import express, { Request, Response } from 'express';
import { synthesizeSpeech } from '../features/eleven-labs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static MP3 files from the /public directory
app.use('/audio', express.static(path.join(__dirname, '..', '..', 'public')));
console.log(`path ------> ${path.join(__dirname, '..', '..')}`)

app.get('/', (_req: Request, res: Response) => {
  res.send('✅ Express server running');
});

app.post('/webhook/start', (req: Request, res: Response) => {
  console.log('📞 Twilio webhook hit:', req.body);
  const twiml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Start>
        <Stream url="wss://${process.env.NGROK_DOMAIN}/media" />
      </Start>
      <Play>https://${process.env.NGROK_DOMAIN}/greeting.mp3</Play>
      <Pause length="60"/>
    </Response>
  `;
  res.type('application/xml').send(twiml.trim());
});

app.post('/response', async (req: Request, res: Response) => {
  const { reply } = req.body;
  console.log('🤖 Received reply from n8n:', reply);

  try {
    await synthesizeSpeech(reply);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Error synthesizing speech:', err);
    res.status(500).send('Error');
  }
});

export default app;
