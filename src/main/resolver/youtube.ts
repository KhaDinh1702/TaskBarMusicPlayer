import playdl from "play-dl";
import { TrackMetadata } from "../../shared/types";

const getBestThumbnail = (video: any): string => {
  if (video.thumbnails && Array.isArray(video.thumbnails) && video.thumbnails.length > 0) {
    const highest = video.thumbnails[video.thumbnails.length - 1];
    if (highest?.url) return highest.url;
  }
  if (video.id) {
    return `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  }
  return "";
};

const extractVideoData = (video: any): TrackMetadata => {
  return {
    id: `yt-${video.id || Date.now()}`,
    title: video.title || "YouTube Video",
    artist: video.channel?.name || "YouTube Creator",
    duration: video.durationInSec || 0,
    coverUrl: getBestThumbnail(video),
    source: "youtube",
    sourceUrl: video.url || `https://www.youtube.com/watch?v=${video.id}`
  };
};

const extractVideoId = (inputUrl: string): string | null => {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace(/^\//, "").split("?")[0];
    }
    return null;
  } catch {
    return null;
  }
};

const resolveAsSingleVideo = async (videoId: string): Promise<TrackMetadata[]> => {
  const cleanVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const info = await playdl.video_basic_info(cleanVideoUrl);
  return [extractVideoData(info.video_details)];
};

export const resolveYouTubeUrl = async (url: string): Promise<TrackMetadata[]> => {
  try {
    const videoId = extractVideoId(url);
    const parsedUrl = new URL(url);
    const listId = parsedUrl.searchParams.get("list");

    // YouTube Mix/Radio playlists (starting with RD) cannot be fetched as static playlists
    if (listId && listId.startsWith("RD") && videoId) {
      return await resolveAsSingleVideo(videoId);
    }

    // Standard playlist resolution
    if (listId) {
      try {
        const playlist = await playdl.playlist_info(url, { incomplete: true });
        const videos = await playlist.all_videos();
        if (videos && videos.length > 0) {
          return videos.map((v: any) => extractVideoData(v));
        }
      } catch {
        // Fallback to single video if playlist is restricted or inaccessible
        if (videoId) {
          return await resolveAsSingleVideo(videoId);
        }
      }
    }

    if (videoId) {
      return await resolveAsSingleVideo(videoId);
    }

    const info = await playdl.video_basic_info(url);
    return [extractVideoData(info.video_details)];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "YouTube resolve failure";
    throw new Error(`Failed to resolve YouTube URL: ${errorMessage}`);
  }
};
