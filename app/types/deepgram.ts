// Type definitions for Deepgram messages
export interface DeepgramAlternative {
  transcript: string;
}

export interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

export interface DeepgramMessage {
  channel?: DeepgramChannel;
  is_final?: boolean;
}


