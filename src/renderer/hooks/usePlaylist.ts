import { useState, useEffect } from "preact/hooks";
import { PlaylistModel, TrackMetadata } from "../../shared/types";
import {
  createDefaultPlaylists,
  addTracksToPlaylist,
  removeTrackFromPlaylist,
  clearTracksInPlaylist,
  reorderTracksInPlaylist,
  createNewPlaylist,
  deletePlaylistById,
  renamePlaylistById,
  DEFAULT_PLAYLIST_ID
} from "../utils/playlistStorage";

const STORAGE_KEY_V2 = "taskbarmusic_playlists_v2";
const ACTIVE_ID_KEY = "taskbarmusic_active_playlist_id";
const LEGACY_STORAGE_KEY = "taskbarmusic_playlist_v1";

export const usePlaylist = () => {
  const [playlists, setPlaylists] = useState<PlaylistModel[]>(() => {
    try {
      const storedV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (storedV2) {
        const parsed = JSON.parse(storedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      // Legacy migration from v1
      const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyStored) {
        const legacyTracks: TrackMetadata[] = JSON.parse(legacyStored);
        if (Array.isArray(legacyTracks)) {
          return createDefaultPlaylists(legacyTracks);
        }
      }
    } catch {
      // Fallback
    }
    return createDefaultPlaylists();
  });

  const [activePlaylistId, setActivePlaylistId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem(ACTIVE_ID_KEY);
    return savedActiveId || DEFAULT_PLAYLIST_ID;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(playlists));
    } catch {
      // Storage quota exception handling
    }
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_ID_KEY, activePlaylistId);
  }, [activePlaylistId]);

  const activePlaylist =
    playlists.find((p) => p.id === activePlaylistId) || playlists[0] || {
      id: DEFAULT_PLAYLIST_ID,
      name: "Queue",
      tracks: [],
      createdAt: Date.now()
    };

  const addTracks = (newTracks: TrackMetadata[]) => {
    setPlaylists((prev) => addTracksToPlaylist(prev, activePlaylist.id, newTracks));
  };

  const removeTrack = (trackId: string) => {
    setPlaylists((prev) => removeTrackFromPlaylist(prev, activePlaylist.id, trackId));
  };

  const clearPlaylist = () => {
    setPlaylists((prev) => clearTracksInPlaylist(prev, activePlaylist.id));
  };

  const reorderTracks = (startIndex: number, endIndex: number) => {
    setPlaylists((prev) =>
      reorderTracksInPlaylist(prev, activePlaylist.id, startIndex, endIndex)
    );
  };

  const createPlaylist = (name?: string) => {
    setPlaylists((prev) => {
      const { updatedPlaylists, newId } = createNewPlaylist(prev, name);
      setActivePlaylistId(newId);
      return updatedPlaylists;
    });
  };

  const switchPlaylist = (id: string) => {
    if (playlists.some((p) => p.id === id)) {
      setActivePlaylistId(id);
    }
  };

  const renamePlaylist = (id: string, newName: string) => {
    setPlaylists((prev) => renamePlaylistById(prev, id, newName));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => {
      const { updatedPlaylists, nextActiveId } = deletePlaylistById(prev, id);
      if (activePlaylistId === id) {
        setActivePlaylistId(nextActiveId);
      }
      return updatedPlaylists;
    });
  };

  return {
    playlists,
    activePlaylist,
    playlist: activePlaylist.tracks,
    activePlaylistId: activePlaylist.id,
    addTracks,
    removeTrack,
    clearPlaylist,
    reorderTracks,
    createPlaylist,
    switchPlaylist,
    renamePlaylist,
    deletePlaylist
  };
};
