import { app } from '@/bootstrap/app';
import { twiml } from 'twilio';
import { Request, Response } from 'express'; 


app.post('/webhook/stream', (req: Request, res: Response) => {
  console.log('📞 Stream webhook hit');
  
  const response = new twiml.VoiceResponse();
  const connect = response.connect();
  connect.stream({ url: `wss://${process.env.NGROK_DOMAIN}/audiostream` });
  
  res.type('text/xml').send(response.toString());
});