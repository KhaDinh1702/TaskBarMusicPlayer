import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { TrackMetadata, PlaybackState, PlaybackMode } from "../../shared/types";
import { getNextTrackIndex, getPreviousTrackIndex } from "../utils/playlistUtils";

type ActivePlayerEngine = "youtube" | "soundcloud" | "native";

declare global {
  interface Window {
    YT?: any;
    SC?: any;
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

export const useAudio = (playlist: TrackMetadata[]) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("repeat");

  const activeEngineRef = useRef<ActivePlayerEngine>("youtube");
  const ytPlayerRef = useRef<any>(null);
  const scWidgetRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlistRef = useRef<TrackMetadata[]>(playlist);
  const currentTrackIndexRef = useRef<number>(currentTrackIndex);
  const playbackModeRef = useRef<PlaybackMode>(playbackMode);

  playlistRef.current = playlist;
  currentTrackIndexRef.current = currentTrackIndex;
  playbackModeRef.current = playbackMode;

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

  const handleTrackEnded = useCallback(() => {
    const currentList = playlistRef.current;
    if (currentList.length === 0) return;

    if (playbackModeRef.current === "repeat-one") {
      seek(0);
      playTrack(currentTrackIndexRef.current);
      return;
    }

    const nextIndex = getNextTrackIndex(
      currentTrackIndexRef.current,
      currentList.length,
      playbackModeRef.current
    );

    if (nextIndex !== -1) {
      playTrack(nextIndex);
    } else {
      setIsPlaying(false);
    }
  }, []);

  const setupYouTubePlayer = () => {
    if (ytPlayerRef.current || !window.YT || !window.YT.Player) return;
    let ytContainer = document.getElementById("taskbar-yt-player");
    if (!ytContainer) {
      ytContainer = document.createElement("div");
      ytContainer.id = "taskbar-yt-player";
      ytContainer.style.cssText =
        "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;";
      document.body.appendChild(ytContainer);
    }

    try {
      ytPlayerRef.current = new window.YT.Player("taskbar-yt-player", {
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
              handleTrackEnded();
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
    let scIframe = document.getElementById("taskbar-sc-player") as HTMLIFrameElement;
    if (!scIframe) {
      scIframe = document.createElement("iframe");
      scIframe.id = "taskbar-sc-player";
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
        handleTrackEnded();
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

  const playNativeTrack = (track: TrackMetadata) => {
    activeEngineRef.current = "native";
    ytPlayerRef.current?.pauseVideo();
    scWidgetRef.current?.pause();

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = track.streamUrl || track.sourceUrl;
    audio.volume = isMuted ? 0 : volume;

    audio.onplay = () => {
      setIsPlaying(true);
      setIsLoadingStream(false);
    };
    audio.onpause = () => {
      setIsPlaying(false);
    };
    audio.onended = () => {
      setIsPlaying(false);
      handleTrackEnded();
    };
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      syncStateWithElectron(true, audio.currentTime, audio.duration || 0);
    };
    audio.onerror = () => {
      setIsLoadingStream(false);
      setErrorMessage("Local audio playback error");
    };

    audio.play().catch(() => {
      setIsLoadingStream(false);
    });
  };

  const playTrack = useCallback(
    (index: number) => {
      const list = playlistRef.current;
      if (index < 0 || index >= list.length) return;
      setCurrentTrackIndex(index);
      const track = list[index];
      setIsLoadingStream(true);
      setErrorMessage(null);

      if (track.source === "local") {
        playNativeTrack(track);
      } else if (track.source === "soundcloud") {
        playSoundCloudTrack(track);
      } else {
        playYouTubeTrack(track);
      }
    },
    [isMuted, volume]
  );

  const togglePlay = useCallback(() => {
    if (currentTrackIndexRef.current === -1 && playlistRef.current.length > 0) {
      playTrack(0);
      return;
    }

    const engine = activeEngineRef.current;
    if (isPlaying) {
      if (engine === "youtube") ytPlayerRef.current?.pauseVideo();
      if (engine === "soundcloud") scWidgetRef.current?.pause();
      if (engine === "native") audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (engine === "youtube") ytPlayerRef.current?.playVideo();
      if (engine === "soundcloud") scWidgetRef.current?.play();
      if (engine === "native") audioRef.current?.play();
      setIsPlaying(true);
    }
  }, [isPlaying, playTrack]);

  const playNext = useCallback(() => {
    const list = playlistRef.current;
    if (list.length === 0) return;
    const nextIndex = getNextTrackIndex(
      currentTrackIndexRef.current,
      list.length,
      playbackModeRef.current
    );
    if (nextIndex !== -1) {
      playTrack(nextIndex);
    }
  }, [playTrack]);

  const playPrevious = useCallback(() => {
    const list = playlistRef.current;
    if (list.length === 0) return;
    const prevIndex = getPreviousTrackIndex(
      currentTrackIndexRef.current,
      list.length,
      playbackModeRef.current
    );
    if (prevIndex !== -1) {
      playTrack(prevIndex);
    }
  }, [playTrack]);

  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode((prev) => {
      switch (prev) {
        case "normal":
          return "repeat";
        case "repeat":
          return "repeat-one";
        case "repeat-one":
          return "shuffle";
        case "shuffle":
        default:
          return "normal";
      }
    });
  }, []);

  const seek = useCallback(
    (timeInSeconds: number) => {
      setCurrentTime(timeInSeconds);
      const engine = activeEngineRef.current;
      if (engine === "youtube") {
        ytPlayerRef.current?.seekTo(timeInSeconds, true);
      } else if (engine === "soundcloud") {
        scWidgetRef.current?.seekTo(timeInSeconds * 1000);
      } else if (engine === "native" && audioRef.current) {
        audioRef.current.currentTime = timeInSeconds;
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
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const targetVol = nextMute ? 0 : volume;
    ytPlayerRef.current?.[nextMute ? "mute" : "unMute"]?.();
    ytPlayerRef.current?.setVolume(targetVol * 100);
    scWidgetRef.current?.setVolume(targetVol * 100);
    if (audioRef.current) {
      audioRef.current.volume = targetVol;
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

  // Polling playback time & duration for YouTube and SoundCloud
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
    playbackMode,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    togglePlaybackMode,
    seek,
    changeVolume,
    toggleMute
  };
};
