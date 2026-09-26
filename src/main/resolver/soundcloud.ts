import playdl from "play-dl";
import { TrackMetadata } from "../../shared/types";

const extractTrackData = (info: any): TrackMetadata => {
  return {
    id: `sc-${info.id || Date.now()}`,
    title: info.name || info.title || "SoundCloud Track",
    artist: info.user?.name || info.publisher?.artist || "SoundCloud Artist",
    duration: Math.floor((info.durationInSec || (info.durationInMs ? info.durationInMs / 1000 : 0)) || 0),
    coverUrl: info.thumbnail || "",
    source: "soundcloud",
    sourceUrl: info.url
  };
};

export const resolveSoundCloudUrl = async (url: string): Promise<TrackMetadata[]> => {
  try {
    const scData = await playdl.soundcloud(url);

    if (scData.type === "playlist") {
      const playlist = scData as any;
      const allTracks = await playlist.all_tracks();
      return allTracks.map((item: any) => extractTrackData(item));
    }

    return [extractTrackData(scData)];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "SoundCloud resolve failure";
    throw new Error(`Failed to resolve SoundCloud URL: ${errorMessage}`);
  }
};
