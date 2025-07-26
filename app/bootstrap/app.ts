import 'dotenv/config';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (_req: Request, res: Response) => {
  res.send('✅ Express server running');
});

app.post('/webhook/start', (req: Request, res: Response) => {
  console.log('📞 Twilio webhook hit:', req.body);
  res.type('text/xml').send('<Response></Response>');
});

export default app;
