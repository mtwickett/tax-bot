import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import fs from "fs";
import { Readable } from "stream";
import path from 'path';


const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_API_KEY });

export const synthesizeSpeech = async (text: string, fileName = "response.mp3") => {
  const voiceId = process.env.ELEVEN_LABS_VOICE_ID!; // Dorothy
  try {
    const audiostream = await client.textToSpeech.convert(voiceId, {
        text,
        modelId: "eleven_multilingual_v2"
    });


    // Convert Web ReadableStream to Node.js Readable
    const reader = audiostream.getReader();
    const nodeStream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
              this.push(Buffer.from(value));
          }
        },
    });

    // Save stream to file
    const outputPath = path.join(__dirname, '..', '..', 'public', fileName);
    const writer = fs.createWriteStream(outputPath);

    return new Promise<void>((resolve, reject) => {
      nodeStream.pipe(writer);
      writer.on("finish", () => {
        console.log(`✅ MP3 saved as ${fileName}`);
        resolve();
      });
      writer.on("error", (err) => {
        console.error("❌ File write error:", err);
        reject(err);
      });
    });

  } catch (error) {
    console.error("❌ ElevenLabs error:", error);
  }
}



