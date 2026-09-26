import { useState, useEffect } from "preact/hooks";
import { TrackMetadata } from "../../shared/types";
import { reorderList } from "../utils/playlistUtils";

const STORAGE_KEY = "taskbarmusic_playlist_v1";

export const usePlaylist = () => {
  const [playlist, setPlaylist] = useState<TrackMetadata[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
    } catch {
      // Storage quota exception handling
    }
  }, [playlist]);

  const addTracks = (newTracks: TrackMetadata[]) => {
    setPlaylist((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const filtered = newTracks.filter((t) => !existingIds.has(t.id));
      return [...prev, ...filtered];
    });
  };

  const removeTrack = (trackId: string) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  const reorderTracks = (startIndex: number, endIndex: number) => {
    setPlaylist((prev) => reorderList(prev, startIndex, endIndex));
  };

  return {
    playlist,
    addTracks,
    removeTrack,
    clearPlaylist,
    reorderTracks
  };
};
