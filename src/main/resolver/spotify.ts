import playdl from "play-dl";
import { TrackMetadata } from "../../shared/types";

const extractSpotifyTrack = (track: any): TrackMetadata => {
  const artists = Array.isArray(track.artists)
    ? track.artists.map((a: any) => a.name).join(", ")
    : "Spotify Artist";

  return {
    id: `sp-${track.id || Date.now()}`,
    title: track.name || "Spotify Track",
    artist: artists,
    duration: Math.floor((track.durationInSec || (track.durationInMs ? track.durationInMs / 1000 : 0)) || 0),
    coverUrl: track.thumbnail?.url || "",
    source: "spotify",
    sourceUrl: track.url || "",
    album: track.album?.name
  };
};

export const resolveSpotifyUrl = async (url: string): Promise<TrackMetadata[]> => {
  try {
    const spData = await playdl.spotify(url);

    if (spData.type === "track") {
      return [extractSpotifyTrack(spData)];
    }

    if (spData.type === "album" || spData.type === "playlist") {
      const collection = spData as any;
      const allTracks = await collection.all_tracks();
      return allTracks.map((item: any) => extractSpotifyTrack(item));
    }

    return [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Spotify resolve failure";
    throw new Error(`Failed to resolve Spotify URL: ${errorMessage}`);
  }
};

export const findMatchingMediaUrl = async (track: TrackMetadata): Promise<string> => {
  try {
    const searchQuery = `${track.title} ${track.artist} audio`;
    const searchResults = await playdl.search(searchQuery, {
      limit: 1,
      source: { youtube: "video" }
    });

    if (!searchResults || searchResults.length === 0) {
      throw new Error(`No match found for ${track.title}`);
    }

    return searchResults[0].url;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Spotify matching failure";
    throw new Error(`Failed to match audio for Spotify track: ${errorMessage}`);
  }
};
