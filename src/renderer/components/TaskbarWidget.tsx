import { useState, useEffect } from "preact/hooks";
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
    <div className="titlebar-drag w-full h-full glass-widget rounded-xl p-2 flex items-center justify-between overflow-hidden shadow-xl border border-palette-border select-none bg-palette-base/95 text-palette-charcoal font-mono">
      {/* Track Art & Info */}
      <div className="flex items-center space-x-2 overflow-hidden flex-1 titlebar-no-drag">
        <div className="relative w-8 h-8 rounded overflow-hidden bg-palette-charcoal border border-palette-border flex-shrink-0 flex items-center justify-center">
          {track?.coverUrl ? (
            <img
              src={track.coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-palette-base font-bold">T</span>
          )}
        </div>

        <div className="overflow-hidden pr-2">
          <p className="text-[11px] font-bold text-palette-charcoal truncate leading-tight">
            {track?.title || "TaskBarMusic Standby"}
          </p>
          <p className="text-[9px] text-palette-muted truncate leading-tight mt-0.5">
            {track?.artist || "Ready to play"}
          </p>
        </div>
      </div>

      {/* Mini Controls */}
      <div className="flex items-center space-x-1 flex-shrink-0 titlebar-no-drag text-[10px] font-bold">
        <button
          onClick={() => handleAction("prev")}
          className="px-1.5 py-0.5 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          PREV
        </button>

        <button
          onClick={() => handleAction("toggle")}
          className="px-2 py-0.5 rounded bg-palette-charcoal text-palette-base shadow transition-all active:scale-95"
        >
          {playbackState.isPlaying ? "PAUSE" : "PLAY"}
        </button>

        <button
          onClick={() => handleAction("next")}
          className="px-1.5 py-0.5 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          NEXT
        </button>

        <div className="w-[1px] h-3 bg-palette-border mx-1" />

        <button
          onClick={handleExpand}
          title="Restore Main Window (Ctrl+M)"
          className="px-1.5 py-0.5 text-palette-muted hover:text-palette-charcoal transition-colors"
        >
          MAX
        </button>
      </div>

      {/* Subtle bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-palette-border/40">
        <div
          className="h-full bg-palette-charcoal transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
