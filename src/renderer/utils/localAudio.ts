import { TrackMetadata } from "../../shared/types";

export const parseFileName = (
  rawFileName: string
): { artist: string; title: string } => {
  const cleanName = rawFileName.replace(/\.[^/.]+$/, "").trim();
  const delimiters = [" - ", " – ", " — "];

  for (const delim of delimiters) {
    if (cleanName.includes(delim)) {
      const parts = cleanName.split(delim);
      const artist = parts[0]?.trim() || "Local Audio";
      const title = parts.slice(1).join(delim).trim() || "Untitled Track";
      return { artist, title };
    }
  }

  return {
    artist: "Local Audio",
    title: cleanName || "Untitled Track"
  };
};

export const getAudioDuration = (fileUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
    };

    const onLoaded = () => {
      cleanup();
      resolve(Math.round(audio.duration) || 0);
    };

    const onError = () => {
      cleanup();
      resolve(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.src = fileUrl;

    setTimeout(() => {
      cleanup();
      resolve(0);
    }, 2000);
  });
};

export const createLocalTrackMetadata = async (file: File): Promise<TrackMetadata> => {
  const { artist, title } = parseFileName(file.name);
  const objectUrl = URL.createObjectURL(file);
  const duration = await getAudioDuration(objectUrl);
  const uniqueId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    id: uniqueId,
    title,
    artist,
    duration,
    coverUrl: "",
    source: "local",
    sourceUrl: objectUrl,
    streamUrl: objectUrl
  };
};
