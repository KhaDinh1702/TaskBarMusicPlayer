import { useState, useRef } from "preact/hooks";
import { Settings } from "lucide-preact";
import { TrackMetadata } from "../../shared/types";
import { createLocalTrackMetadata } from "../utils/localAudio";
import { Language, getTranslation } from "../utils/i18n";

interface HeaderProps {
  onAddTracks: (tracks: TrackMetadata[]) => void;
  language: Language;
  onOpenSettings: () => void;
}

export const Header = ({ onAddTracks, language, onOpenSettings }: HeaderProps) => {
  const [urlInput, setUrlInput] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = (key: Parameters<typeof getTranslation>[1], params?: Record<string, string | number>) =>
    getTranslation(language, key, params);

  const handleLocalFileSelection = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    setIsResolving(true);
    setStatusMessage(t("statusImporting"));

    try {
      const files = Array.from(target.files);
      const newTracks: TrackMetadata[] = [];
      for (const file of files) {
        const meta = await createLocalTrackMetadata(file);
        newTracks.push(meta);
      }
      onAddTracks(newTracks);
      setStatusMessage(t("statusImportSuccess", { count: newTracks.length }));
    } catch {
      setStatusMessage(t("statusError"));
    } finally {
      setIsResolving(false);
      target.value = "";
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleResolve = async (e?: Event) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed || isResolving) return;

    setIsResolving(true);
    setStatusMessage(t("statusResolving"));

    try {
      if (window.electronAPI) {
        const tracks = await window.electronAPI.resolveUrl(trimmed);
        if (tracks && tracks.length > 0) {
          onAddTracks(tracks);
          setUrlInput("");
          setStatusMessage(t("statusAddSuccess", { count: tracks.length }));
        } else {
          setStatusMessage(t("statusNoTracks"));
        }
      } else {
        setStatusMessage("Electron bridge unavailable");
      }
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : t("statusError");
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
      <div className="flex items-center titlebar-no-drag">
        <span className="font-bold text-xs tracking-widest uppercase text-palette-charcoal">
          TaskBarMusic
        </span>
      </div>

      <div className="flex-1 max-w-xl mx-4 titlebar-no-drag relative flex items-center space-x-2">
        <form onSubmit={handleResolve} className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={urlInput}
            onInput={(e) => setUrlInput((e.target as HTMLInputElement).value)}
            disabled={isResolving}
            className="w-full bg-palette-surface border border-palette-border rounded py-1.5 pl-3 pr-20 text-xs font-mono text-palette-charcoal placeholder-palette-muted focus:outline-none focus:border-palette-charcoal transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isResolving || !urlInput.trim()}
            className="absolute right-1 px-2.5 py-1 bg-palette-charcoal hover:opacity-90 disabled:opacity-40 text-palette-base rounded text-[11px] font-mono font-semibold transition-all"
          >
            {isResolving ? "..." : t("add")}
          </button>
        </form>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.opus"
          onChange={handleLocalFileSelection}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open local audio files (.mp3, .flac, .wav)"
          disabled={isResolving}
          className="px-2.5 py-1.5 bg-palette-surface border border-palette-border hover:border-palette-charcoal text-palette-charcoal rounded text-[11px] font-mono font-medium transition-colors shadow-sm flex items-center justify-center flex-shrink-0"
        >
          {t("local")}
        </button>

        {statusMessage && (
          <p className="absolute -bottom-4 left-0 text-[10px] font-mono text-palette-charcoal font-medium truncate max-w-md">
            {statusMessage}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-1.5 titlebar-no-drag text-xs font-mono">
        <button
          onClick={onOpenSettings}
          title={t("settings")}
          className="p-1.5 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleWidget}
          title="Switch to Transparent Taskbar Mini Widget (Ctrl+M)"
          className="px-2 py-1 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors text-[11px] font-semibold"
        >
          {t("widget")}
        </button>
        <button
          onClick={handleMinimize}
          className="px-2 py-1 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors text-xs"
        >
          _
        </button>
        <button
          onClick={handleMaximize}
          className="px-2 py-1 text-palette-muted hover:text-palette-charcoal hover:bg-palette-surface rounded transition-colors text-xs"
        >
          [ ]
        </button>
        <button
          onClick={handleClose}
          className="px-2 py-1 text-palette-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
        >
          X
        </button>
      </div>
    </header>
  );
};
