import { useState, useEffect } from "preact/hooks";
import { Header } from "./components/Header";
import { Player } from "./components/Player";
import { Playlist } from "./components/Playlist";
import { Visualizer } from "./components/Visualizer";
import { TaskbarWidget } from "./components/TaskbarWidget";
import { usePlaylist } from "./hooks/usePlaylist";
import { useAudio } from "./hooks/useAudio";

export const App = () => {
  const [isWidgetMode, setIsWidgetMode] = useState<boolean>(() => {
    return window.location.hash === "#widget";
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsWidgetMode(window.location.hash === "#widget");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const { playlist, addTracks, removeTrack, clearPlaylist } = usePlaylist();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoadingStream,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
    toggleMute
  } = useAudio(playlist);

  // When instance is running in taskbar widget mode
  if (isWidgetMode) {
    return <TaskbarWidget />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-palette-base select-none overflow-hidden text-palette-charcoal">
      {/* Draggable Header & URL Input Bar */}
      <Header onAddTracks={addTracks} />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Cover Art, Track Details, and Visualizer */}
        <section className="w-80 border-r border-palette-border p-6 flex flex-col justify-between bg-palette-surface/40">
          <div>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-palette-surface border border-palette-border shadow-md mb-4">
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-palette-muted space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-palette-base border border-palette-border flex items-center justify-center text-palette-charcoal font-bold text-sm shadow-sm">
                    Aura
                  </div>
                  <span className="text-xs">No active track</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-base font-bold text-palette-charcoal truncate">
                {currentTrack?.title || "Welcome to AuraMusic"}
              </h2>
              <p className="text-xs text-palette-muted font-medium truncate mt-0.5">
                {currentTrack?.artist || "SoundCloud, YouTube, Spotify"}
              </p>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-palette-muted mb-2">
              Audio Spectrum
            </div>
            <Visualizer isPlaying={isPlaying} />
          </div>
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
        onTogglePlay={togglePlay}
        onPlayNext={playNext}
        onPlayPrevious={playPrevious}
        onSeek={seek}
        onChangeVolume={changeVolume}
        onToggleMute={toggleMute}
      />
    </div>
  );
};
