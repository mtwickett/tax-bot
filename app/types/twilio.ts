// Type definitions for Twilio Media Streams events
interface TwilioMedia {
  payload: string;
}

interface TwilioEvent {
  event: 'start' | 'media' | 'stop';
  media?: TwilioMedia;
}