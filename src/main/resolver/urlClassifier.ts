import { TrackSource } from "../../shared/types";

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+/i;
const SOUNDCLOUD_REGEX = /^(https?:\/\/)?(www\.|m\.)?soundcloud\.com\/.+/i;
const SPOTIFY_REGEX = /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist)\/.+/i;

export const identifyTrackSource = (url: string): TrackSource | null => {
  const trimmedUrl = url.trim();

  if (YOUTUBE_REGEX.test(trimmedUrl)) {
    return "youtube";
  }

  if (SOUNDCLOUD_REGEX.test(trimmedUrl)) {
    return "soundcloud";
  }

  if (SPOTIFY_REGEX.test(trimmedUrl)) {
    return "spotify";
  }

  return null;
};
