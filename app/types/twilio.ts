// Type definitions for Twilio Media Streams events
export interface TwilioMedia {
  payload: string;
}

export interface TwilioEvent {
  event: 'start' | 'media' | 'stop';
  media?: TwilioMedia;
}