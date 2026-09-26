import { describe, it, expect } from "vitest";
import { getHighResCoverUrl } from "./mediaUtils";

describe("mediaUtils.getHighResCoverUrl", () => {
  it("returns empty string when url is empty or undefined", () => {
    expect(getHighResCoverUrl("")).toBe("");
    expect(getHighResCoverUrl(undefined)).toBe("");
  });

  it("upgrades YouTube /default.jpg to /hqdefault.jpg", () => {
    const input = "https://i.ytimg.com/vi/abc12345/default.jpg";
    const output = getHighResCoverUrl(input);
    expect(output).toBe("https://i.ytimg.com/vi/abc12345/hqdefault.jpg");
  });

  it("upgrades YouTube /mqdefault.jpg to /hqdefault.jpg", () => {
    const input = "https://i.ytimg.com/vi/abc12345/mqdefault.jpg";
    const output = getHighResCoverUrl(input);
    expect(output).toBe("https://i.ytimg.com/vi/abc12345/hqdefault.jpg");
  });

  it("preserves YouTube /maxresdefault.jpg or /hqdefault.jpg", () => {
    const maxres = "https://i.ytimg.com/vi/abc12345/maxresdefault.jpg";
    expect(getHighResCoverUrl(maxres)).toBe(maxres);

    const hq = "https://i.ytimg.com/vi/abc12345/hqdefault.jpg";
    expect(getHighResCoverUrl(hq)).toBe(hq);
  });

  it("upgrades SoundCloud -large.jpg to -t500x500.jpg", () => {
    const input = "https://i1.sndcdn.com/artworks-xyz-large.jpg";
    const output = getHighResCoverUrl(input);
    expect(output).toBe("https://i1.sndcdn.com/artworks-xyz-t500x500.jpg");
  });

  it("preserves Spotify and standard URLs", () => {
    const spotify = "https://i.scdn.co/image/ab67616d0000b273b57c7f";
    expect(getHighResCoverUrl(spotify)).toBe(spotify);
  });
});
