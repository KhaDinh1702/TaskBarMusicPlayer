import { useState, useEffect } from "preact/hooks";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Music } from "lucide-preact";
import { PlaybackState } from "../../shared/types";

export const TaskbarWidget = () => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false
  });

  useEffect(() => {
    if (!window.widgetBridge) return;
    const unsubscribe = window.widgetBridge.onStateUpdate((newState: PlaybackState) => {
      setPlaybackState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAction = (action: string) => {
    window.widgetBridge?.sendAction(action);
  };

  const handleExpand = () => {
    window.widgetBridge?.toggleWidget();
  };

  const track = playbackState.currentTrack;
  const progress =
    playbackState.duration > 0
      ? (playbackState.currentTime / playbackState.duration) * 100
      : 0;

  return (
    <div className="titlebar-drag w-full h-full glass-widget rounded-2xl p-2.5 flex items-center justify-between overflow-hidden shadow-xl border border-palette-border select-none bg-palette-base/95 text-palette-charcoal">
      {/* Track Art & Info */}
      <div className="flex items-center space-x-2.5 overflow-hidden flex-1 titlebar-no-drag">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-palette-charcoal border border-palette-border flex-shrink-0 flex items-center justify-center shadow-inner">
          {track?.coverUrl ? (
            <img
              src={track.coverUrl}
              alt=""
              className={`w-full h-full object-cover rounded-full ${
                playbackState.isPlaying ? "animate-spin-slow" : ""
              }`}
            />
          ) : (
            <Music className="w-4 h-4 text-palette-base" />
          )}
          {/* Vinyl center pin */}
          <div className="absolute w-2.5 h-2.5 bg-palette-base border border-palette-border rounded-full" />
        </div>

        <div className="overflow-hidden pr-2">
          <p className="text-xs font-bold text-palette-charcoal truncate leading-tight">
            {track?.title || "AuraMusic Standby"}
          </p>
          <p className="text-[10px] text-palette-muted truncate leading-tight mt-0.5">
            {track?.artist || "Ready to play"}
          </p>
        </div>
      </div>

      {/* Mini Controls */}
      <div className="flex items-center space-x-1 flex-shrink-0 titlebar-no-drag">
        <button
          onClick={() => handleAction("prev")}
          className="p-1 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleAction("toggle")}
          className="w-7 h-7 rounded-full bg-palette-charcoal hover:opacity-90 text-palette-base flex items-center justify-center shadow transition-all active:scale-95"
        >
          {playbackState.isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3 translate-x-0.5" />
          )}
        </button>

        <button
          onClick={() => handleAction("next")}
          className="p-1 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-palette-border mx-1" />

        <button
          onClick={handleExpand}
          title="Restore Main Window (Ctrl+M)"
          className="p-1 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-palette-border/40">
        <div
          className="h-full bg-palette-charcoal transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
