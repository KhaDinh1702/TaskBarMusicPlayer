import { useEffect, useRef } from "preact/hooks";
import { TrackMetadata } from "../../shared/types";
import { LyricLine } from "../utils/lyrics";

interface ExpandedLyricsProps {
  currentTrack: TrackMetadata | null;
  lyrics: LyricLine[];
  currentTime: number;
  isLoading: boolean;
  onSeek: (time: number) => void;
  onClose: () => void;
}

export const ExpandedLyrics = ({
  currentTrack,
  lyrics,
  currentTime,
  isLoading,
  onSeek,
  onClose
}: ExpandedLyricsProps) => {
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
    <div className="flex-1 flex flex-col h-full bg-palette-base p-8 overflow-hidden select-text relative">
      {/* Top Bar inside Expanded Lyrics */}
      <div className="flex items-center justify-between pb-4 border-b border-palette-border mb-6">
        <div>
          <h2 className="text-base font-bold text-palette-charcoal truncate">
            {currentTrack?.title || "No Track Playing"}
          </h2>
          <p className="text-xs font-mono text-palette-muted">
            {currentTrack?.artist || "Unknown Artist"}
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg border border-palette-border bg-palette-surface hover:border-palette-charcoal text-palette-charcoal text-xs font-mono font-semibold transition-colors shadow-sm"
        >
          CLOSE [ESC]
        </button>
      </div>

      {/* Main Lyrics Flow (Spotify Cinema Style) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-6 py-16 px-4 scrollbar-none text-left"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-lg font-mono text-palette-muted animate-pulse">
            LOADING LYRICS...
          </div>
        ) : lyrics.length === 0 ? (
          <div className="h-full flex items-center justify-center text-base font-mono text-palette-muted">
            {currentTrack ? "NO SYNCED LYRICS AVAILABLE FOR THIS SONG" : "PLAY A TRACK TO DISPLAY LYRICS"}
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={`${line.time}-${idx}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => onSeek(line.time)}
                className={`transition-all duration-300 cursor-pointer select-none leading-tight ${
                  isActive
                    ? "text-3xl sm:text-4xl font-extrabold text-palette-charcoal scale-[1.02] origin-left"
                    : "text-xl sm:text-2xl font-bold text-palette-muted/30 hover:text-palette-charcoal"
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
