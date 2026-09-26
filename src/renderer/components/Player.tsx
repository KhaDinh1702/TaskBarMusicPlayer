import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  Repeat,
  Repeat1,
  Shuffle,
  ListOrdered
} from "lucide-preact";
import { TrackMetadata, PlaybackMode } from "../../shared/types";

interface PlayerProps {
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoadingStream: boolean;
  playbackMode: PlaybackMode;
  isLyricsExpanded?: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onTogglePlaybackMode: () => void;
  onToggleLyrics?: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (val: number) => void;
  onToggleMute: () => void;
}

const formatSeconds = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00";
  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.floor(sec % 60);
  return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
};

export const Player = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isLoadingStream,
  playbackMode,
  isLyricsExpanded,
  onTogglePlay,
  onPlayNext,
  onPlayPrevious,
  onTogglePlaybackMode,
  onToggleLyrics,
  onSeek,
  onChangeVolume,
  onToggleMute
}: PlayerProps) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-20 bg-palette-surface/90 border-t border-palette-border px-6 flex items-center justify-between z-40 backdrop-blur-md">
      {/* Current track meta */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[200px]">
        {currentTrack?.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`w-12 h-12 rounded-lg object-cover shadow-sm border border-palette-border ${
              isPlaying ? "animate-pulse-subtle" : ""
            }`}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-palette-base border border-palette-border" />
        )}
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-palette-charcoal truncate">
            {currentTrack?.title || "No track selected"}
          </p>
          <p className="text-[11px] text-palette-muted truncate">
            {currentTrack?.artist || "Paste a link or drop local files to begin"}
          </p>
        </div>
      </div>

      {/* Main playback controls & timeline */}
      <div className="flex flex-col items-center w-2/4 max-w-xl px-4">
        <div className="flex items-center space-x-4 mb-1.5">
          <button
            onClick={onTogglePlaybackMode}
            className={`p-1.5 transition-colors rounded-lg ${
              playbackMode !== "normal"
                ? "text-palette-charcoal bg-palette-base border border-palette-border shadow-sm"
                : "text-palette-muted hover:text-palette-charcoal"
            }`}
            title={`Mode: ${playbackMode.toUpperCase()} (Click to toggle)`}
          >
            {playbackMode === "shuffle" ? (
              <Shuffle className="w-3.5 h-3.5" />
            ) : playbackMode === "repeat-one" ? (
              <Repeat1 className="w-3.5 h-3.5" />
            ) : playbackMode === "repeat" ? (
              <Repeat className="w-3.5 h-3.5" />
            ) : (
              <ListOrdered className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={onPlayPrevious}
            className="p-1.5 text-palette-muted hover:text-palette-charcoal transition-colors"
            title="Previous (Ctrl+Left)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={isLoadingStream}
            className="w-9 h-9 rounded-full bg-palette-charcoal hover:opacity-90 disabled:opacity-50 text-palette-base flex items-center justify-center transition-all active:scale-95 shadow-md"
            title="Play/Pause (Space)"
          >
            {isLoadingStream ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onPlayNext}
            className="p-1.5 text-palette-muted hover:text-palette-charcoal transition-colors"
            title="Next (Ctrl+Right)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline seekbar */}
        <div className="w-full flex items-center space-x-2.5 text-[11px] text-palette-muted font-mono">
          <span>{formatSeconds(currentTime)}</span>
          <div
            className="relative flex-1 h-1.5 bg-palette-border/50 rounded-full overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-palette-charcoal rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>

      {/* Volume slider & Lyrics toggle */}
      <div className="flex items-center justify-end space-x-3 w-1/4">
        {onToggleLyrics && (
          <button
            onClick={onToggleLyrics}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all border ${
              isLyricsExpanded
                ? "bg-palette-charcoal text-palette-base border-palette-charcoal shadow-sm"
                : "bg-palette-base text-palette-muted border-palette-border hover:text-palette-charcoal hover:border-palette-charcoal"
            }`}
            title="Toggle Spotify-style Expanded Cinema Lyrics"
          >
            LYRICS
          </button>
        )}

        <button
          onClick={onToggleMute}
          className="p-1 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-red-500" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onInput={(e) => onChangeVolume(parseFloat((e.target as HTMLInputElement).value))}
          className="w-20 h-1 bg-palette-border accent-palette-charcoal cursor-pointer rounded-lg"
        />
      </div>
    </footer>
  );
};
