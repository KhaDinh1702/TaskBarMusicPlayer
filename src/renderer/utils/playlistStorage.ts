import { PlaylistModel, TrackMetadata } from "../../shared/types";
import { reorderList } from "./playlistUtils";

export const DEFAULT_PLAYLIST_ID = "default";

export const createDefaultPlaylists = (initialTracks: TrackMetadata[] = []): PlaylistModel[] => {
  return [
    {
      id: DEFAULT_PLAYLIST_ID,
      name: "Queue",
      tracks: initialTracks,
      createdAt: Date.now()
    }
  ];
};

export const addTracksToPlaylist = (
  playlists: PlaylistModel[],
  playlistId: string,
  newTracks: TrackMetadata[]
): PlaylistModel[] => {
  return playlists.map((pl) => {
    if (pl.id !== playlistId) return pl;
    const existingIds = new Set(pl.tracks.map((t) => t.id));
    const uniqueNewTracks: TrackMetadata[] = [];
    for (const t of newTracks) {
      if (!existingIds.has(t.id)) {
        existingIds.add(t.id);
        uniqueNewTracks.push(t);
      }
    }
    return {
      ...pl,
      tracks: [...pl.tracks, ...uniqueNewTracks]
    };
  });
};

export const removeTrackFromPlaylist = (
  playlists: PlaylistModel[],
  playlistId: string,
  trackId: string
): PlaylistModel[] => {
  return playlists.map((pl) => {
    if (pl.id !== playlistId) return pl;
    return {
      ...pl,
      tracks: pl.tracks.filter((t) => t.id !== trackId)
    };
  });
};

export const clearTracksInPlaylist = (
  playlists: PlaylistModel[],
  playlistId: string
): PlaylistModel[] => {
  return playlists.map((pl) => {
    if (pl.id !== playlistId) return pl;
    return {
      ...pl,
      tracks: []
    };
  });
};

export const reorderTracksInPlaylist = (
  playlists: PlaylistModel[],
  playlistId: string,
  startIndex: number,
  endIndex: number
): PlaylistModel[] => {
  return playlists.map((pl) => {
    if (pl.id !== playlistId) return pl;
    return {
      ...pl,
      tracks: reorderList(pl.tracks, startIndex, endIndex)
    };
  });
};

export const createNewPlaylist = (
  playlists: PlaylistModel[],
  name?: string
): { updatedPlaylists: PlaylistModel[]; newId: string } => {
  const newId = `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const playlistName = name?.trim() || `Playlist ${playlists.length + 1}`;
  const newPlaylist: PlaylistModel = {
    id: newId,
    name: playlistName,
    tracks: [],
    createdAt: Date.now()
  };

  return {
    updatedPlaylists: [...playlists, newPlaylist],
    newId
  };
};

export const deletePlaylistById = (
  playlists: PlaylistModel[],
  playlistId: string
): { updatedPlaylists: PlaylistModel[]; nextActiveId: string } => {
  if (playlists.length <= 1) {
    // If only 1 playlist exists, clear its tracks instead of deleting
    const cleared = playlists.map((pl) => ({ ...pl, tracks: [] }));
    return { updatedPlaylists: cleared, nextActiveId: playlists[0].id };
  }

  const remaining = playlists.filter((pl) => pl.id !== playlistId);
  return {
    updatedPlaylists: remaining,
    nextActiveId: remaining[0].id
  };
};

export const renamePlaylistById = (
  playlists: PlaylistModel[],
  playlistId: string,
  newName: string
): PlaylistModel[] => {
  const cleanName = newName.trim();
  if (!cleanName) return playlists;
  return playlists.map((pl) => {
    if (pl.id !== playlistId) return pl;
    return { ...pl, name: cleanName };
  });
};
