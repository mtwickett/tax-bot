import 'dotenv/config';
import express, { Request, Response } from 'express';
import { synthesizeSpeech } from '@/features/eleven-labs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static MP3 files from the /public directory
app.use('/audio', express.static(path.join(__dirname, 'public')));

app.get('/', (_req: Request, res: Response) => {
  res.send('✅ Express server running');
});

app.post('/webhook/tax-bot', (req: Request, res: Response) => {
  console.log('📞 Twilio webhook hit:', req.body);
  const twiml = `
    <Response>
      <Play>https://ed084b81fe09.ngrok-free.app/audio/greeting.mp3</Play>
      <Redirect>https://ed084b81fe09.ngrok-free.app/webhook/tax-bot</Redirect>
    </Response>
  `;
  res.type('text/xml').send(twiml);
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
