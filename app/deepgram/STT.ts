import { Deepgram } from '@deepgram/sdk';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

dotenv.config();
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY!);

export class DeepgramSTT extends EventEmitter {
  private connection: ReturnType<typeof deepgram.>;

  constructor() {
    super();
    this.connection = deepgram.transcription.live({
      encoding: 'mulaw',
      sample_rate: 8000,
      interim_results: true,
      punctuate: true,
      model: 'nova-2',
    });

    this.connection.on('open', () => this.emit('ready'));
    this.connection.on('transcriptReceived', (data) => {
      const alt = data.channel?.alternatives?.[0]?.transcript;
      if (alt) {
        const final = data.is_final || data.speech_final;
        this.emit(final ? 'final' : 'interim', alt);
      }
    });

    this.connection.on('error', err => this.emit('error', err));
    this.connection.on('close', () => this.emit('end'));
  }

  sendAudio(data: Buffer) {
    this.connection.send(data);
  }

  finish() {
    this.connection.finish();
  }
}
