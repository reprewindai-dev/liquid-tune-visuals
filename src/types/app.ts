export interface Scene {
  id: string;
  name: string;
  image: string;
  isCustom?: boolean;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  genre: string;
  duration: string;
  audioUrl?: string;
}

export interface AppState {
  step: 'upload' | 'avatar' | 'music' | 'scene' | 'preview';
  userPhoto: string | null;
  avatarImage: string | null;
  selectedTrack: Track | null;
  customAudio: File | null;
  selectedScene: Scene | null;
}

export type StepKey = AppState['step'];
