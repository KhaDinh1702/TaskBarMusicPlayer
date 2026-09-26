import { describe, it, expect } from "vitest";
import { reorderList, getNextTrackIndex, getPreviousTrackIndex } from "./playlistUtils";

describe("playlistUtils", () => {
  describe("reorderList", () => {
    it("should reorder items from start to end index correctly", () => {
      const initial = ["A", "B", "C", "D"];
      const reordered = reorderList(initial, 0, 2);
      expect(reordered).toEqual(["B", "C", "A", "D"]);
    });

    it("should move an item backwards correctly", () => {
      const initial = ["A", "B", "C", "D"];
      const reordered = reorderList(initial, 3, 1);
      expect(reordered).toEqual(["A", "D", "B", "C"]);
    });

    it("should return identical copy if indexes are out of bounds or identical", () => {
      const initial = ["A", "B", "C"];
      expect(reorderList(initial, 1, 1)).toEqual(["A", "B", "C"]);
      expect(reorderList(initial, -1, 2)).toEqual(["A", "B", "C"]);
      expect(reorderList(initial, 0, 5)).toEqual(["A", "B", "C"]);
    });
  });

  describe("getNextTrackIndex", () => {
    it("should handle normal mode stopping at the end", () => {
      expect(getNextTrackIndex(0, 3, "normal")).toBe(1);
      expect(getNextTrackIndex(1, 3, "normal")).toBe(2);
      expect(getNextTrackIndex(2, 3, "normal")).toBe(-1);
    });

    it("should handle repeat all mode looping back to 0", () => {
      expect(getNextTrackIndex(2, 3, "repeat")).toBe(0);
      expect(getNextTrackIndex(0, 3, "repeat")).toBe(1);
    });

    it("should handle repeat-one mode keeping the same index", () => {
      expect(getNextTrackIndex(1, 3, "repeat-one")).toBe(1);
    });

    it("should handle shuffle mode picking another index", () => {
      const nextIndex = getNextTrackIndex(1, 3, "shuffle");
      expect(nextIndex).toBeGreaterThanOrEqual(0);
      expect(nextIndex).toBeLessThan(3);
    });
  });

  describe("getPreviousTrackIndex", () => {
    it("should wrap around to last track when on first track", () => {
      expect(getPreviousTrackIndex(0, 3, "normal")).toBe(2);
      expect(getPreviousTrackIndex(2, 3, "normal")).toBe(1);
    });

    it("should return the same index in repeat-one mode", () => {
      expect(getPreviousTrackIndex(1, 3, "repeat-one")).toBe(1);
    });
  });
});
