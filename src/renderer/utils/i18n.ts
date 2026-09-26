export type Language = "en" | "vi";

export const translations = {
  en: {
    welcome: "Welcome to TaskBarMusic",
    noTrack: "No active track",
    noTrackSelected: "No track selected",
    pastePrompt: "Paste a link or drop local files to begin",
    queue: "Queue",
    queueEmpty: "No tracks in queue",
    clearAll: "Clear All",
    dropToAdd: "Drop audio files to add",
    settings: "Settings",
    appearance: "Appearance",
    language: "Language",
    themeWarm: "Warm Gray",
    themeDark: "Dark",
    themeLight: "Light",
    themeLabel: "Theme",
    languageLabel: "Language",
    audioEngine: "Audio Engine",
    localFiles: "Local Files",
    add: "ADD",
    local: "LOCAL",
    widget: "WIDGET",
    searchPlaceholder: "Paste YouTube, SoundCloud, or Spotify link here...",
    statusImporting: "Importing local tracks...",
    statusResolving: "Resolving media source...",
    statusImportSuccess: "Imported {count} local track(s)",
    statusAddSuccess: "Added {count} track(s)",
    statusNoTracks: "No tracks found from provided link",
    statusError: "Error resolving link",
    close: "Close",
    about: "About",
    appVersion: "Version 1.0.0 (Portable)"
  },
  vi: {
    welcome: "Chào mừng đến với TaskBarMusic",
    noTrack: "Chưa có bài hát",
    noTrackSelected: "Chưa chọn bài hát",
    pastePrompt: "Dán link hoặc kéo thả file âm thanh để phát",
    queue: "Hàng đợi",
    queueEmpty: "Hàng đợi đang trống",
    clearAll: "Xóa tất cả",
    dropToAdd: "Thả file âm thanh để thêm vào",
    settings: "Cài đặt",
    appearance: "Giao diện",
    language: "Ngôn ngữ",
    themeWarm: "Xám ấm",
    themeDark: "Tối",
    themeLight: "Sáng",
    themeLabel: "Chủ đề màu",
    languageLabel: "Ngôn ngữ hiển thị",
    audioEngine: "Trình phát âm thanh",
    localFiles: "Tệp cục bộ",
    add: "THÊM",
    local: "TỆP MÁY",
    widget: "WIDGET",
    searchPlaceholder: "Dán link YouTube, SoundCloud hoặc Spotify vào đây...",
    statusImporting: "Đang nhập tệp âm thanh...",
    statusResolving: "Đang xử lý nguồn phát...",
    statusImportSuccess: "Đã thêm {count} tệp âm thanh",
    statusAddSuccess: "Đã thêm {count} bài hát",
    statusNoTracks: "Không tìm thấy bài hát nào từ link",
    statusError: "Lỗi xử lý đường dẫn",
    close: "Đóng",
    about: "Thông tin",
    appVersion: "Phiên bản 1.0.0 (Bản Portable)"
  }
};

export const getTranslation = (
  lang: Language,
  key: keyof typeof translations["en"],
  params?: Record<string, string | number>
): string => {
  const dict = translations[lang] || translations.en;
  let text = dict[key] || translations.en[key] || String(key);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }

  return text;
};
