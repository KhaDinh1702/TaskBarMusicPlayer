import { describe, it, expect } from "vitest";
import { identifyTrackSource } from "./urlClassifier";

describe("identifyTrackSource", () => {
  it("should identify standard YouTube video URLs", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(identifyTrackSource(url)).toBe("youtube");
  });

  it("should identify YouTube Mix and playlist URLs", () => {
    const mixUrl = "https://www.youtube.com/watch?v=wHYt_bCtBwY&list=RDwHYt_bCtBwY&start_radio=1";
    expect(identifyTrackSource(mixUrl)).toBe("youtube");
  });

  it("should identify short YouTube URLs", () => {
    const url = "https://youtu.be/dQw4w9WgXcQ";
    expect(identifyTrackSource(url)).toBe("youtube");
  });

  it("should identify SoundCloud track URLs", () => {
    const url = "https://soundcloud.com/artist-name/track-title";
    expect(identifyTrackSource(url)).toBe("soundcloud");
  });

  it("should identify Spotify track, album, and playlist URLs", () => {
    expect(identifyTrackSource("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")).toBe("spotify");
    expect(identifyTrackSource("https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy")).toBe("spotify");
    expect(identifyTrackSource("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")).toBe("spotify");
  });

  it("should return null for unsupported or invalid URLs", () => {
    expect(identifyTrackSource("https://google.com")).toBeNull();
    expect(identifyTrackSource("not-a-valid-url")).toBeNull();
  });
});
