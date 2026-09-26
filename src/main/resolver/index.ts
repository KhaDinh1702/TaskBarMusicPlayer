import { TrackMetadata } from "../../shared/types";
import { identifyTrackSource } from "./urlClassifier";
import { resolveSoundCloudUrl } from "./soundcloud";
import { resolveYouTubeUrl } from "./youtube";
import { resolveSpotifyUrl, findMatchingMediaUrl } from "./spotify";

export const resolveAudioUrl = async (url: string): Promise<TrackMetadata[]> => {
  const source = identifyTrackSource(url);

  if (!source) {
    throw new Error("Unsupported URL format. Please paste a valid YouTube, SoundCloud, or Spotify link.");
  }

  switch (source) {
    case "soundcloud":
      return await resolveSoundCloudUrl(url);
    case "youtube":
      return await resolveYouTubeUrl(url);
    case "spotify":
      return await resolveSpotifyUrl(url);
    default:
      throw new Error("Unsupported or unrecognized audio source.");
  }
};

export const resolveTrackStreamUrl = async (track: TrackMetadata): Promise<string> => {
  if (track.source === "spotify") {
    return await findMatchingMediaUrl(track);
  }
  return track.sourceUrl;
};
