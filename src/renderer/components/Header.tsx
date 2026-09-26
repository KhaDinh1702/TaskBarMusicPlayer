import { useState } from "preact/hooks";
import { Plus, Minus, Square, X, Tv, Loader2 } from "lucide-preact";
import { TrackMetadata } from "../../shared/types";

interface HeaderProps {
  onAddTracks: (tracks: TrackMetadata[]) => void;
}

export const Header = ({ onAddTracks }: HeaderProps) => {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleResolve = async (e?: Event) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed || isResolving) return;

    setIsResolving(true);
    setStatusMessage("Resolving media source...");

    try {
      if (window.electronAPI) {
        const tracks = await window.electronAPI.resolveUrl(trimmed);
        if (tracks && tracks.length > 0) {
          onAddTracks(tracks);
          setUrlInput("");
          setStatusMessage(`Added ${tracks.length} track(s)`);
        } else {
          setStatusMessage("No tracks found from provided link");
        }
      } else {
        setStatusMessage("Electron bridge unavailable");
      }
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : "Error resolving link";
      const cleanMsg = rawMsg.replace(/^Error invoking remote method '[^']+':\s*(Error:\s*)?/, "");
      setStatusMessage(cleanMsg);
    } finally {
      setIsResolving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();
  const handleToggleWidget = () => window.electronAPI?.toggleTaskbarWidget();

  return (
    <header className="titlebar-drag h-14 bg-palette-base/95 border-b border-palette-border px-4 flex items-center justify-between z-50">
      <div className="flex items-center space-x-3 titlebar-no-drag">
        <div className="w-7 h-7 rounded-lg bg-palette-charcoal flex items-center justify-center font-bold text-xs text-palette-base shadow-sm">
          A
        </div>
        <span className="font-semibold text-sm tracking-wider text-palette-charcoal">
          AuraMusic
        </span>
      </div>

      <div className="flex-1 max-w-xl mx-4 titlebar-no-drag relative">
        <form onSubmit={handleResolve} className="relative flex items-center">
          <input
            type="text"
            placeholder="Paste YouTube, SoundCloud, or Spotify link here..."
            value={urlInput}
            onInput={(e) => setUrlInput((e.target as HTMLInputElement).value)}
            disabled={isResolving}
            className="w-full bg-palette-surface border border-palette-border rounded-lg py-1.5 pl-3 pr-24 text-xs text-palette-charcoal placeholder-palette-muted focus:outline-none focus:border-palette-charcoal focus:ring-1 focus:ring-palette-charcoal transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isResolving || !urlInput.trim()}
            className="absolute right-1 px-2.5 py-1 bg-palette-charcoal hover:opacity-90 disabled:opacity-40 text-palette-base rounded text-xs font-medium flex items-center space-x-1 transition-all"
          >
            {isResolving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>{isResolving ? "Loading" : "Add"}</span>
          </button>
        </form>
        {statusMessage && (
          <p className="absolute text-[11px] text-palette-charcoal font-medium mt-0.5 truncate max-w-md">
            {statusMessage}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-1 titlebar-no-drag">
        <button
          onClick={handleToggleWidget}
          title="Switch to Transparent Taskbar Mini Widget (Ctrl+M)"
          className="p-1.5 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors"
        >
          <Tv className="w-4 h-4" />
        </button>
        <button
          onClick={handleMinimize}
          className="p-1.5 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="p-1.5 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 text-palette-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
