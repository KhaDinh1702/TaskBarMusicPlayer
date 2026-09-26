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
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onTogglePlaybackMode: () => void;
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

const getModeLabel = (mode: PlaybackMode): string => {
  switch (mode) {
    case "repeat":
      return "REP";
    case "repeat-one":
      return "REP-1";
    case "shuffle":
      return "SHUF";
    case "normal":
    default:
      return "NORM";
  }
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
  onTogglePlay,
  onPlayNext,
  onPlayPrevious,
  onTogglePlaybackMode,
  onSeek,
  onChangeVolume,
  onToggleMute
}: PlayerProps) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-18 bg-palette-surface/90 border-t border-palette-border px-6 flex items-center justify-between z-40 backdrop-blur-md">
      {/* Current track meta */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[200px]">
        {currentTrack?.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-10 h-10 rounded object-cover shadow-sm border border-palette-border"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-palette-base border border-palette-border flex items-center justify-center text-palette-muted font-mono font-bold text-[10px]">
            T
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-palette-charcoal truncate">
            {currentTrack?.title || "No track selected"}
          </p>
          <p className="text-[10px] font-mono text-palette-muted truncate">
            {currentTrack?.artist || "Paste a link or drop local files to begin"}
          </p>
        </div>
      </div>

      {/* Main playback controls & timeline */}
      <div className="flex flex-col items-center w-2/4 max-w-xl px-4">
        <div className="flex items-center space-x-3 mb-1.5 font-mono text-xs">
          <button
            onClick={onTogglePlaybackMode}
            className="px-2 py-1 rounded border border-palette-border bg-palette-base text-palette-charcoal hover:border-palette-charcoal font-semibold text-[10px] transition-colors"
            title={`Mode: ${playbackMode.toUpperCase()} (Click to change)`}
          >
            {getModeLabel(playbackMode)}
          </button>

          <button
            onClick={onPlayPrevious}
            className="px-2 py-1 text-palette-muted hover:text-palette-charcoal transition-colors font-medium text-[11px]"
            title="Previous (Ctrl+Left)"
          >
            PREV
          </button>

          <button
            onClick={onTogglePlay}
            disabled={isLoadingStream}
            className="px-4 py-1 rounded bg-palette-charcoal hover:opacity-90 disabled:opacity-50 text-palette-base font-bold text-xs tracking-wider transition-all shadow-sm"
            title="Play/Pause (Space)"
          >
            {isLoadingStream ? "..." : isPlaying ? "PAUSE" : "PLAY"}
          </button>

          <button
            onClick={onPlayNext}
            className="px-2 py-1 text-palette-muted hover:text-palette-charcoal transition-colors font-medium text-[11px]"
            title="Next (Ctrl+Right)"
          >
            NEXT
          </button>
        </div>

        {/* Timeline seekbar */}
        <div className="w-full flex items-center space-x-2.5 text-[10px] text-palette-muted font-mono">
          <span>{formatSeconds(currentTime)}</span>
          <div
            className="relative flex-1 h-1.5 bg-palette-border/50 rounded-full overflow-hidden cursor-pointer"
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

      {/* Volume slider */}
      <div className="flex items-center justify-end space-x-2 w-1/4 font-mono text-[10px]">
        <button
          onClick={onToggleMute}
          className="px-1.5 py-0.5 border border-palette-border rounded text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          {isMuted || volume === 0 ? "MUTE" : "VOL"}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onInput={(e) => onChangeVolume(parseFloat((e.target as HTMLInputElement).value))}
          className="w-18 h-1 bg-palette-border accent-palette-charcoal cursor-pointer rounded"
        />
      </div>
    </footer>
  );
};
