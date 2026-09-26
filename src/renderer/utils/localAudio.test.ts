import { describe, it, expect } from "vitest";
import { parseFileName } from "./localAudio";

describe("localAudio", () => {
  describe("parseFileName", () => {
    it("should parse 'Artist - Title.mp3' format", () => {
      const result = parseFileName("The Weeknd - Blinding Lights.mp3");
      expect(result.artist).toBe("The Weeknd");
      expect(result.title).toBe("Blinding Lights");
    });

    it("should handle en-dash and em-dash separators", () => {
      const result1 = parseFileName("Daft Punk – One More Time.flac");
      expect(result1.artist).toBe("Daft Punk");
      expect(result1.title).toBe("One More Time");

      const result2 = parseFileName("Coldplay — Yellow.wav");
      expect(result2.artist).toBe("Coldplay");
      expect(result2.title).toBe("Yellow");
    });

    it("should handle filenames without artist separator", () => {
      const result = parseFileName("Lo-Fi Study Beat.mp3");
      expect(result.artist).toBe("Local Audio");
      expect(result.title).toBe("Lo-Fi Study Beat");
    });

    it("should strip file extensions properly", () => {
      const result = parseFileName("Imagine Dragons - Believer.opus");
      expect(result.artist).toBe("Imagine Dragons");
      expect(result.title).toBe("Believer");
    });
  });
});
