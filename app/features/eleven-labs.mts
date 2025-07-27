import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";
import fs from "fs";
import { Readable } from "stream";

// Initialize the client with your API key
const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_LABS_API_KEY });

const synthesizeSpeech = async () => {
  const voiceId = "ThT5KcBeYPX3keUQqHPh"; // Dorothy
  const text = "Hello, thank you for calling Sentry Tax. How can I help you today?";
  const fileName = "response.mp3";
  try {
    const res = await client.textToSpeech.convert(voiceId, {
        text: text,
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
    const writer = fs.createWriteStream(fileName);
    nodeStream.pipe(writer);

    writer.on("finish", () => {
      console.log(`✅ MP3 saved as ${fileName}`);
    });

    writer.on("error", err => {
      console.error("❌ File write error:", err);
    });

  } catch (error) {
    console.error("❌ ElevenLabs error:", error);
  }
}

synthesizeSpeech();

