// Type definitions for Deepgram messages
interface DeepgramAlternative {
  transcript: string;
}

interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

interface DeepgramMessage {
  channel?: DeepgramChannel;
  is_final?: boolean;
}
