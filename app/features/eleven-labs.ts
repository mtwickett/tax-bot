import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import fs from "fs";
import { Readable } from "stream";

// Initialize the client with your API key
const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_API_KEY });

export const synthesizeSpeech = async (text: string, fileName = "./public/response.mp3") => {
  const voiceId = "ThT5KcBeYPX3keUQqHPh"; // Dorothy
  try {
    const res = await client.textToSpeech.convert(voiceId, {
        text,
        modelId: "eleven_multilingual_v2"
    });


    // Convert Web ReadableStream to Node.js Readable
    const reader = res.getReader();
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
    const writer = fs.createWriteStream(`public/${fileName}`);
    nodeStream.pipe(writer);

    writer.on("finish", () => {
      console.log(`✅ MP3 saved as public/${fileName}`);
    });

    writer.on("error", err => {
      console.error("❌ File write error:", err);
    });

  } catch (error) {
    console.error("❌ ElevenLabs error:", error);
  }
}



