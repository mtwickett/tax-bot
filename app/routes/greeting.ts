import { app } from '@/bootstrap/app';
import { twiml } from 'twilio';
import { Request, Response } from 'express';


app.post('/webhook/greeting', (req: Request, res: Response) => {
    console.log('Greeting webhook hit');

    const response = new twiml.VoiceResponse();
    response.play(`https://${process.env.NGROK_DOMAIN}/audio/greeting.mp3`);
    response.redirect('/webhook/stream');

    res.type('text/xml').send(response.toString());
})