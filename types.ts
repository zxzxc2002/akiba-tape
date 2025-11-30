export interface StoryContent {
  id: number;
  title?: string; // Optional custom title
  text: string[]; // Array of strings for pagination
}

export enum PlayerState {
  STOPPED = 'STOPPED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LOADING = 'LOADING'
}

export interface AudioConfig {
  playbackRate: number;
  detune: number; // in cents
  distortionLevel: number;
  isNoise: boolean;
  // New effects
  filterType?: 'lowpass' | 'highpass' | 'none';
  filterFrequency?: number;
  hasReverb?: boolean;
  hasTremolo?: boolean;
  wobbleAmount?: number;
}
