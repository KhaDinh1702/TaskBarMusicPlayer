export type TrackSource = "soundcloud" | "youtube" | "spotify";

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  coverUrl: string;
  source: TrackSource;
  sourceUrl: string;
  streamUrl?: string;
  album?: string;
}

export interface PlaylistModel {
  id: string;
  name: string;
  tracks: TrackMetadata[];
  createdAt: number;
}

export interface WindowControlActions {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  toggleTaskbarWidget: () => void;
}

export interface PlaybackState {
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export interface ElectronAPIBridge {
  resolveUrl: (url: string) => Promise<TrackMetadata[]>;
  getAudioStreamUrl: (track: TrackMetadata) => Promise<string>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  toggleTaskbarWidget: () => void;
  syncPlaybackState: (state: PlaybackState) => void;
  onPlaybackAction: (callback: (action: string) => void) => () => void;
}
