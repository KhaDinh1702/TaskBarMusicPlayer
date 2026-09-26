import { useEffect, useRef } from "preact/hooks";
import { TrackMetadata } from "../../shared/types";
import { LyricLine } from "../utils/lyrics";

interface LyricsPanelProps {
  currentTrack: TrackMetadata | null;
  lyrics: LyricLine[];
  isLoading: boolean;
  currentTime: number;
  onSeek: (time: number) => void;
  onToggleExpand?: () => void;
}

export const LyricsPanel = ({
  currentTrack,
  lyrics,
  isLoading,
  currentTime,
  onSeek,
  onToggleExpand
}: LyricsPanelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [activeIndex]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-palette-surface/30 rounded-xl border border-palette-border p-3 overflow-hidden shadow-inner font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-palette-border/60 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-palette-muted">
          LYRICS
        </span>
        <div className="flex items-center space-x-2">
          {isLoading && <span className="text-[9px] text-palette-muted animate-pulse">SYNCING...</span>}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="text-[9px] font-bold text-palette-muted hover:text-palette-charcoal px-1.5 py-0.5 rounded border border-palette-border hover:border-palette-charcoal transition-colors"
              title="Expand lyrics to Spotify cinema view"
            >
              EXPAND
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 py-3 text-center scrollbar-none select-text"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-[11px] text-palette-muted">
            SEARCHING LYRICS...
          </div>
        ) : lyrics.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[11px] text-palette-muted">
            {currentTrack ? "NO SYNCED LYRICS AVAILABLE" : "NO ACTIVE TRACK"}
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={`${line.time}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`transition-all duration-150 cursor-pointer text-xs leading-relaxed px-2 rounded ${
                  isActive
                    ? "font-bold text-palette-charcoal bg-palette-surface/80 py-1"
                    : "text-palette-muted/60 hover:text-palette-charcoal"
                }`}
              >
                {line.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
