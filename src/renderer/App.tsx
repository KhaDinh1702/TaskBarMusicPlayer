import { useState, useEffect } from "preact/hooks";
import { Header } from "./components/Header";
import { Player } from "./components/Player";
import { Playlist } from "./components/Playlist";
import { LyricsPanel } from "./components/LyricsPanel";
import { ExpandedLyrics } from "./components/ExpandedLyrics";
import { TaskbarWidget } from "./components/TaskbarWidget";
import { SettingsModal, AppTheme } from "./components/SettingsModal";
import { usePlaylist } from "./hooks/usePlaylist";
import { useAudio } from "./hooks/useAudio";
import { useLyrics } from "./hooks/useLyrics";
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
  const [isLyricsExpanded, setIsLyricsExpanded] = useState<boolean>(false);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLyricsExpanded) {
        setIsLyricsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLyricsExpanded]);

  const {
    playlists,
    playlist,
    activePlaylistId,
    addTracks,
    removeTrack,
    clearPlaylist,
    reorderTracks,
    createPlaylist,
    switchPlaylist,
    deletePlaylist
  } = usePlaylist();

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

  const { lyrics, isLoading: isLoadingLyrics } = useLyrics(currentTrack);

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
                  <div className="w-10 h-10 rounded-xl bg-palette-base border border-palette-border" />
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

          {/* Synchronized Lyrics Panel (with Spotify Expand button) */}
          <LyricsPanel
            currentTrack={currentTrack}
            lyrics={lyrics}
            isLoading={isLoadingLyrics}
            currentTime={currentTime}
            onSeek={seek}
            onToggleExpand={() => setIsLyricsExpanded(true)}
          />
        </section>

        {/* Right Side: Interactive Multi-Playlist Queue OR Spotify-Style Expanded Cinema Lyrics */}
        <section className="flex-1 flex flex-col overflow-hidden bg-palette-base">
          {isLyricsExpanded ? (
            <ExpandedLyrics
              currentTrack={currentTrack}
              lyrics={lyrics}
              currentTime={currentTime}
              isLoading={isLoadingLyrics}
              onSeek={seek}
              onClose={() => setIsLyricsExpanded(false)}
            />
          ) : (
            <Playlist
              playlists={playlists}
              activePlaylistId={activePlaylistId}
              tracks={playlist}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onSelectTrack={playTrack}
              onRemoveTrack={removeTrack}
              onClearPlaylist={clearPlaylist}
              onReorderTracks={reorderTracks}
              onAddLocalFiles={handleAddLocalFiles}
              onSwitchPlaylist={switchPlaylist}
              onCreatePlaylist={createPlaylist}
              onDeletePlaylist={deletePlaylist}
            />
          )}
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
        isLyricsExpanded={isLyricsExpanded}
        onTogglePlay={togglePlay}
        onPlayNext={playNext}
        onPlayPrevious={playPrevious}
        onTogglePlaybackMode={togglePlaybackMode}
        onToggleLyrics={() => setIsLyricsExpanded((prev) => !prev)}
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
