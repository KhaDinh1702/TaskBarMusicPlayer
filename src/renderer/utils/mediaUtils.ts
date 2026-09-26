/**
 * Upgrades audio cover image URLs to high-resolution variants
 * - YouTube: upgrades /default.jpg or /mqdefault.jpg to /hqdefault.jpg
 * - SoundCloud: upgrades -large.jpg (100x100) to -t500x500.jpg (500x500)
 */
export const getHighResCoverUrl = (url: string | undefined): string => {
  if (!url) return "";

  // YouTube thumbnails
  if (url.includes("ytimg.com") || url.includes("youtube.com")) {
    if (url.includes("/default.jpg")) {
      return url.replace("/default.jpg", "/hqdefault.jpg");
    }
    if (url.includes("/mqdefault.jpg")) {
      return url.replace("/mqdefault.jpg", "/hqdefault.jpg");
    }
  }

  // SoundCloud artworks
  if (url.includes("sndcdn.com") && url.includes("-large.jpg")) {
    return url.replace("-large.jpg", "-t500x500.jpg");
  }

  return url;
};
