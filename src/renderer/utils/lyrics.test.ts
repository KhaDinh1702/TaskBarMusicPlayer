import { describe, it, expect } from "vitest";
import { parseLrc } from "./lyrics";

describe("lyrics", () => {
  describe("parseLrc", () => {
    it("should parse standard LRC format lines into sorted timestamps", () => {
      const lrc = `
        [ti:Sample Song]
        [ar:Sample Artist]
        [00:04.50]First line of lyrics
        [00:09.20]Second line of lyrics
        [00:15.80]Third line of lyrics
      `;

      const parsed = parseLrc(lrc);
      expect(parsed).toHaveLength(3);
      expect(parsed[0]).toEqual({ time: 4.5, text: "First line of lyrics" });
      expect(parsed[1]).toEqual({ time: 9.2, text: "Second line of lyrics" });
      expect(parsed[2]).toEqual({ time: 15.8, text: "Third line of lyrics" });
    });

    it("should handle multiple timestamps on a single line", () => {
      const lrc = `[00:01.00][00:05.00]Chorus line repeated`;
      const parsed = parseLrc(lrc);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].time).toBe(1.0);
      expect(parsed[1].time).toBe(5.0);
    });

    it("should return empty array for invalid or empty input", () => {
      expect(parseLrc("")).toEqual([]);
      expect(parseLrc("[header:only]")).toEqual([]);
    });
  });
});
