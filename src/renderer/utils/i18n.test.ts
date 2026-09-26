import { describe, it, expect } from "vitest";
import { getTranslation, translations } from "./i18n";

describe("i18n", () => {
  it("should return English text by default", () => {
    expect(getTranslation("en", "welcome")).toBe("Welcome to TaskBarMusic");
    expect(getTranslation("en", "settings")).toBe("Settings");
  });

  it("should return Vietnamese text when language is vi", () => {
    expect(getTranslation("vi", "welcome")).toBe("Chào mừng đến với TaskBarMusic");
    expect(getTranslation("vi", "settings")).toBe("Cài đặt");
  });

  it("should replace interpolation parameters correctly", () => {
    const enText = getTranslation("en", "statusAddSuccess", { count: 5 });
    expect(enText).toBe("Added 5 track(s)");

    const viText = getTranslation("vi", "statusAddSuccess", { count: 3 });
    expect(viText).toBe("Đã thêm 3 bài hát");
  });

  it("should have matching translation keys between en and vi", () => {
    const enKeys = Object.keys(translations.en).sort();
    const viKeys = Object.keys(translations.vi).sort();
    expect(enKeys).toEqual(viKeys);
  });
});
