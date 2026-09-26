import { useState, useEffect } from "preact/hooks";
import { Header } from "./components/Header";
import { Player } from "./components/Player";
import { Playlist } from "./components/Playlist";
import { LyricsPanel } from "./components/LyricsPanel";
import { TaskbarWidget } from "./components/TaskbarWidget";
import { SettingsModal, AppTheme } from "./components/SettingsModal";
import { usePlaylist } from "./hooks/usePlaylist";
import { useAudio } from "./hooks/useAudio";
import { createLocalTrackMetadata } from "./utils/localAudio";
import { Language } from "./utils/i18n";
import { TrackMetadata } from "../shared/types";

const THEME_STORAGE_KEY = "taskbarmusic_theme";
const LANG_STORAGE_KEY = "taskbarmusic_lang";

export const App = () => {
  const [isWidgetMode, setIsWidgetMode] = useState<boolean>(() => {
    return window.location.hash === "#widget";
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
    return saved === "dark" || saved === "light" || saved === "warm" ? saved : "warm";
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    return saved === "vi" || saved === "en" ? saved : "en";
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    const handleHashChange = () => {
      setIsWidgetMode(window.location.hash === "#widget");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const { playlist, addTracks, removeTrack, clearPlaylist, reorderTracks } = usePlaylist();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoadingStream,
    playbackMode,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    togglePlaybackMode,
    seek,
    changeVolume,
    toggleMute
  } = useAudio(playlist);

  const handleAddLocalFiles = async (files: File[]) => {
    const newTracks: TrackMetadata[] = [];
    for (const file of files) {
      const meta = await createLocalTrackMetadata(file);
      newTracks.push(meta);
    }
    if (newTracks.length > 0) {
      addTracks(newTracks);
    }
  };

  // When instance is running in taskbar widget mode
  if (isWidgetMode) {
    return <TaskbarWidget />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-palette-base select-none overflow-hidden text-palette-charcoal">
      {/* Draggable Header & URL Input Bar with Settings */}
      <Header
        onAddTracks={addTracks}
        language={language}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Cover Art, Track Details, and Synced Lyrics */}
        <section className="w-80 border-r border-palette-border p-5 flex flex-col space-y-4 bg-palette-surface/30 overflow-hidden">
          <div className="flex-shrink-0">
            <div className="relative w-full aspect-square max-h-52 rounded-2xl overflow-hidden bg-palette-surface border border-palette-border shadow-md mb-3 mx-auto">
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-contain object-center bg-palette-surface/50"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-palette-muted space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-palette-base border border-palette-border flex items-center justify-center text-palette-charcoal font-bold text-xs shadow-sm">
                    TaskBar
                  </div>
                  <span className="text-[11px]">
                    {language === "vi" ? "Chưa có bài hát" : "No active track"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-palette-charcoal truncate">
                {currentTrack?.title || (language === "vi" ? "Chào mừng đến với TaskBarMusic" : "Welcome to TaskBarMusic")}
              </h2>
              <p className="text-[11px] text-palette-muted font-medium truncate mt-0.5">
                {currentTrack?.artist || "SoundCloud, YouTube, Spotify, Local"}
              </p>
            </div>
          </div>

          {/* Synchronized Lyrics Panel */}
          <LyricsPanel
            currentTrack={currentTrack}
            currentTime={currentTime}
            onSeek={seek}
          />
        </section>

        {/* Right Side: Interactive Playlist Queue */}
        <section className="flex-1 flex flex-col overflow-hidden bg-palette-base">
          <Playlist
            tracks={playlist}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            onSelectTrack={playTrack}
            onRemoveTrack={removeTrack}
            onClearPlaylist={clearPlaylist}
            onReorderTracks={reorderTracks}
            onAddLocalFiles={handleAddLocalFiles}
          />
        </section>
      </main>

      {/* Bottom Control Bar */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isLoadingStream={isLoadingStream}
        playbackMode={playbackMode}
        onTogglePlay={togglePlay}
        onPlayNext={playNext}
        onPlayPrevious={playPrevious}
        onTogglePlaybackMode={togglePlaybackMode}
        onSeek={seek}
        onChangeVolume={changeVolume}
        onToggleMute={toggleMute}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        language={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );
};
