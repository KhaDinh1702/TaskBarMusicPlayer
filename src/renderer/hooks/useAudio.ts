import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { TrackMetadata, PlaybackState } from "../../shared/types";

type ActivePlayerEngine = "youtube" | "soundcloud" | "native";

declare global {
  interface Window {
    YT?: any;
    SC?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const extractYouTubeId = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v") || "";
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace(/^\//, "").split("?")[0];
    }
  } catch {
    // Malformed URL fallback
  }
  return "";
};

export const useAudio = (
  playlist: TrackMetadata[],
  onTrackEnded?: () => void
) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeEngineRef = useRef<ActivePlayerEngine>("youtube");
  const ytPlayerRef = useRef<any>(null);
  const scWidgetRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentTrackIndex] || null;

  const syncStateWithElectron = useCallback(
    (playing: boolean, time: number, dur: number) => {
      if (!window.electronAPI) return;
      const state: PlaybackState = {
        currentTrack,
        isPlaying: playing,
        currentTime: time,
        duration: dur,
        volume,
        isMuted
      };
      window.electronAPI.syncPlaybackState(state);
    },
    [currentTrack, volume, isMuted]
  );

  const setupYouTubePlayer = () => {
    if (ytPlayerRef.current || !window.YT || !window.YT.Player) return;
    let ytContainer = document.getElementById("aura-yt-player");
    if (!ytContainer) {
      ytContainer = document.createElement("div");
      ytContainer.id = "aura-yt-player";
      ytContainer.style.cssText =
        "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;";
      document.body.appendChild(ytContainer);
    }

    try {
      ytPlayerRef.current = new window.YT.Player("aura-yt-player", {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              setIsLoadingStream(false);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              setIsPlaying(false);
              playNext();
            }
          },
          onError: () => {
            setIsLoadingStream(false);
            setErrorMessage("YouTube playback failed");
          }
        }
      });
    } catch {
      // Fallback
    }
  };

  const setupSoundCloudWidget = () => {
    if (scWidgetRef.current || !window.SC) return;
    let scIframe = document.getElementById("aura-sc-player") as HTMLIFrameElement;
    if (!scIframe) {
      scIframe = document.createElement("iframe");
      scIframe.id = "aura-sc-player";
      scIframe.src = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293";
      scIframe.style.cssText =
        "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;";
      document.body.appendChild(scIframe);
    }

    try {
      const widget = window.SC.Widget(scIframe);
      widget.bind(window.SC.Widget.Events.READY, () => {
        scWidgetRef.current = widget;
      });
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setIsPlaying(false);
        playNext();
      });
      widget.bind(window.SC.Widget.Events.PLAY, () => {
        setIsPlaying(true);
        setIsLoadingStream(false);
      });
      widget.bind(window.SC.Widget.Events.PAUSE, () => {
        setIsPlaying(false);
      });
    } catch {
      // Fallback
    }
  };

  const playYouTubeTrack = (track: TrackMetadata) => {
    activeEngineRef.current = "youtube";
    scWidgetRef.current?.pause();
    audioRef.current?.pause();

    const videoId = extractYouTubeId(track.sourceUrl) || track.id.replace("yt-", "");
    if (!videoId) {
      setErrorMessage("Invalid YouTube video ID");
      setIsLoadingStream(false);
      return;
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      ytPlayerRef.current.loadVideoById(videoId);
      ytPlayerRef.current.setVolume(isMuted ? 0 : volume * 100);
      ytPlayerRef.current.playVideo();
    } else {
      setTimeout(() => playYouTubeTrack(track), 400);
    }
  };

  const playSoundCloudTrack = (track: TrackMetadata) => {
    activeEngineRef.current = "soundcloud";
    ytPlayerRef.current?.pauseVideo();
    audioRef.current?.pause();

    if (scWidgetRef.current) {
      scWidgetRef.current.load(track.sourceUrl, {
        auto_play: true,
        callback: () => {
          scWidgetRef.current.setVolume(isMuted ? 0 : volume * 100);
          scWidgetRef.current.play();
        }
      });
    } else {
      setTimeout(() => playSoundCloudTrack(track), 400);
    }
  };

  const playTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) return;
      setCurrentTrackIndex(index);
      const track = playlist[index];
      setIsLoadingStream(true);
      setErrorMessage(null);

      if (track.source === "youtube" || track.source === "spotify") {
        playYouTubeTrack(track);
      } else if (track.source === "soundcloud") {
        playSoundCloudTrack(track);
      }
    },
    [playlist, isMuted, volume]
  );

  const togglePlay = useCallback(() => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      playTrack(0);
      return;
    }

    const engine = activeEngineRef.current;
    if (isPlaying) {
      if (engine === "youtube") ytPlayerRef.current?.pauseVideo();
      if (engine === "soundcloud") scWidgetRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (engine === "youtube") ytPlayerRef.current?.playVideo();
      if (engine === "soundcloud") scWidgetRef.current?.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrackIndex, playlist, playTrack]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
  }, [currentTrackIndex, playlist, playTrack]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  }, [currentTrackIndex, playlist, playTrack]);

  const seek = useCallback(
    (timeInSeconds: number) => {
      setCurrentTime(timeInSeconds);
      const engine = activeEngineRef.current;
      if (engine === "youtube") {
        ytPlayerRef.current?.seekTo(timeInSeconds, true);
      } else if (engine === "soundcloud") {
        scWidgetRef.current?.seekTo(timeInSeconds * 1000);
      }
      syncStateWithElectron(isPlaying, timeInSeconds, duration);
    },
    [isPlaying, duration, syncStateWithElectron]
  );

  const changeVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    ytPlayerRef.current?.setVolume(clamped * 100);
    scWidgetRef.current?.setVolume(clamped * 100);
  }, []);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      ytPlayerRef.current?.mute();
      scWidgetRef.current?.setVolume(0);
    } else {
      ytPlayerRef.current?.unMute();
      ytPlayerRef.current?.setVolume(volume * 100);
      scWidgetRef.current?.setVolume(volume * 100);
    }
  }, [isMuted, volume]);

  useEffect(() => {
    setupYouTubePlayer();
    setupSoundCloudWidget();

    const checkApisInterval = setInterval(() => {
      if (!ytPlayerRef.current) setupYouTubePlayer();
      if (!scWidgetRef.current) setupSoundCloudWidget();
    }, 1000);

    return () => clearInterval(checkApisInterval);
  }, []);

  // Polling playback time & duration while playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const engine = activeEngineRef.current;
      if (engine === "youtube" && ytPlayerRef.current?.getCurrentTime) {
        const cur = ytPlayerRef.current.getCurrentTime() || 0;
        const dur = ytPlayerRef.current.getDuration() || 0;
        setCurrentTime(cur);
        setDuration(dur);
        syncStateWithElectron(true, cur, dur);
      } else if (engine === "soundcloud" && scWidgetRef.current?.getPosition) {
        scWidgetRef.current.getPosition((pos: number) => {
          const cur = pos / 1000;
          setCurrentTime(cur);
          syncStateWithElectron(true, cur, duration);
        });
        scWidgetRef.current.getDuration((dur: number) => {
          setDuration(dur / 1000);
        });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, duration, syncStateWithElectron]);

  useEffect(() => {
    if (!window.electronAPI) return;
    const unsubscribe = window.electronAPI.onPlaybackAction((action: string) => {
      if (action === "toggle") togglePlay();
      if (action === "next") playNext();
      if (action === "prev") playPrevious();
    });
    return () => unsubscribe();
  }, [togglePlay, playNext, playPrevious]);

  return {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoadingStream,
    errorMessage,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
    toggleMute
  };
};
