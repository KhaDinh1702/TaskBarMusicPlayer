import { Trash2, Music } from "lucide-preact";
import { TrackMetadata } from "../../shared/types";

interface PlaylistProps {
  tracks: TrackMetadata[];
  currentTrackId?: string;
  isPlaying: boolean;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onClearPlaylist: () => void;
}

const formatTrackDuration = (sec: number): string => {
  if (isNaN(sec) || sec <= 0) return "--:--";
  const mins = Math.floor(sec / 60);
  const remaining = Math.floor(sec % 60);
  return `${mins}:${remaining.toString().padStart(2, "0")}`;
};

const getSourceBadgeStyle = (source: string) => {
  switch (source) {
    case "soundcloud":
      return "bg-[#8C8C8C]/15 text-palette-charcoal border-palette-border";
    case "youtube":
      return "bg-[#BFBFBD]/30 text-palette-charcoal border-palette-border";
    case "spotify":
      return "bg-palette-charcoal text-palette-base border-palette-charcoal";
    default:
      return "bg-palette-border/20 text-palette-muted border-palette-border";
  }
};

export const Playlist = ({
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onRemoveTrack,
  onClearPlaylist
}: PlaylistProps) => {
  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-palette-base">
        <div className="w-14 h-14 rounded-2xl bg-palette-surface border border-palette-border flex items-center justify-center text-palette-muted mb-3 shadow-sm">
          <Music className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-palette-charcoal mb-1">
          Your playlist is empty
        </h3>
        <p className="text-xs text-palette-muted max-w-sm">
          Copy and paste any SoundCloud track, YouTube video, or Spotify playlist link into the top bar to begin playback.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 py-4 bg-palette-base">
      <div className="flex items-center justify-between pb-3 border-b border-palette-border mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-palette-charcoal">
          Queue ({tracks.length} tracks)
        </h2>
        <button
          onClick={onClearPlaylist}
          className="text-xs text-palette-muted hover:text-red-600 flex items-center space-x-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {tracks.map((track, idx) => {
          const isCurrent = track.id === currentTrackId;

          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(idx)}
              className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                isCurrent
                  ? "bg-palette-surface border-palette-charcoal shadow-sm"
                  : "bg-palette-surface/50 border-transparent hover:bg-palette-surface hover:border-palette-border"
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-palette-base border border-palette-border flex-shrink-0">
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-palette-muted">
                      <Music className="w-4 h-4" />
                    </div>
                  )}
                  {isCurrent && isPlaying && (
                    <div className="absolute inset-0 bg-palette-charcoal/30 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-palette-base animate-ping" />
                    </div>
                  )}
                </div>

                <div className="overflow-hidden">
                  <p
                    className={`text-xs font-medium truncate ${
                      isCurrent ? "text-palette-charcoal font-bold" : "text-palette-charcoal"
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-palette-muted truncate">
                    {track.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${getSourceBadgeStyle(
                    track.source
                  )}`}
                >
                  {track.source}
                </span>

                <span className="text-[11px] font-mono text-palette-muted">
                  {formatTrackDuration(track.duration)}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTrack(track.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-palette-muted hover:text-red-600 transition-opacity"
                  title="Remove from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
