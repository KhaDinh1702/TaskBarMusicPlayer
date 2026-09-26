import { describe, it, expect } from "vitest";
import {
  createDefaultPlaylists,
  addTracksToPlaylist,
  removeTrackFromPlaylist,
  createNewPlaylist,
  deletePlaylistById,
  renamePlaylistById
} from "./playlistStorage";
import { TrackMetadata } from "../../shared/types";

const mockTrack: TrackMetadata = {
  id: "track-1",
  title: "Test Track",
  artist: "Test Artist",
  duration: 180,
  coverUrl: "",
  source: "youtube",
  sourceUrl: "https://youtube.com/watch?v=123"
};

describe("playlistStorage", () => {
  it("should create default playlist", () => {
    const playlists = createDefaultPlaylists([mockTrack]);
    expect(playlists).toHaveLength(1);
    expect(playlists[0].id).toBe("default");
    expect(playlists[0].tracks).toHaveLength(1);
  });

  it("should add track without duplicates", () => {
    const initial = createDefaultPlaylists();
    const updated = addTracksToPlaylist(initial, "default", [mockTrack, mockTrack]);
    expect(updated[0].tracks).toHaveLength(1);
  });

  it("should remove track from specified playlist", () => {
    const initial = createDefaultPlaylists([mockTrack]);
    const updated = removeTrackFromPlaylist(initial, "default", "track-1");
    expect(updated[0].tracks).toHaveLength(0);
  });

  it("should create new playlist and return its ID", () => {
    const initial = createDefaultPlaylists();
    const { updatedPlaylists, newId } = createNewPlaylist(initial, "Chill Lo-Fi");
    expect(updatedPlaylists).toHaveLength(2);
    expect(updatedPlaylists[1].id).toBe(newId);
    expect(updatedPlaylists[1].name).toBe("Chill Lo-Fi");
  });

  it("should delete playlist and return next active playlist ID", () => {
    const initial = createDefaultPlaylists();
    const { updatedPlaylists, newId } = createNewPlaylist(initial, "Workout");
    const { updatedPlaylists: afterDelete, nextActiveId } = deletePlaylistById(updatedPlaylists, newId);
    expect(afterDelete).toHaveLength(1);
    expect(nextActiveId).toBe("default");
  });

  it("should rename playlist correctly", () => {
    const initial = createDefaultPlaylists();
    const updated = renamePlaylistById(initial, "default", "Favorites");
    expect(updated[0].name).toBe("Favorites");
  });
});
