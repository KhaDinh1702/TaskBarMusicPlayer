export interface LyricLine {
  time: number;
  text: string;
}

export const parseLrc = (lrcContent: string): LyricLine[] => {
  if (!lrcContent) return [];
  const lines = lrcContent.split("\n");
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    timeRegex.lastIndex = 0;
    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length === 0) continue;

    const text = trimmed.replace(timeRegex, "").trim();
    if (!text) continue;

    for (const match of matches) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const msPart = match[3] || "0";
      const ms = parseFloat(`0.${msPart}`);
      const totalSeconds = min * 60 + sec + ms;

      result.push({
        time: totalSeconds,
        text
      });
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

export const fetchLyricsFromLrclib = async (
  title: string,
  artist: string,
  duration?: number
): Promise<LyricLine[]> => {
  try {
    const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, "").trim();
    const cleanArtist = artist.replace(/\(.*?\)|\[.*?\]/g, "").trim();

    const getUrl = new URL("https://lrclib.net/api/get");
    getUrl.searchParams.set("track_name", cleanTitle);
    getUrl.searchParams.set("artist_name", cleanArtist);
    if (duration && duration > 0) {
      getUrl.searchParams.set("duration", Math.round(duration).toString());
    }

    const res = await fetch(getUrl.toString(), {
      headers: { "User-Agent": "TaskBarMusic-Desktop-Player/1.0" }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) {
        return parseLrc(data.syncedLyrics);
      }
    }

    // Fallback: search endpoint
    const searchUrl = new URL("https://lrclib.net/api/search");
    searchUrl.searchParams.set("q", `${cleanTitle} ${cleanArtist}`);
    const searchRes = await fetch(searchUrl.toString(), {
      headers: { "User-Agent": "TaskBarMusic-Desktop-Player/1.0" }
    });

    if (searchRes.ok) {
      const items = await searchRes.json();
      if (Array.isArray(items) && items.length > 0) {
        const found = items.find((item) => item.syncedLyrics) || items[0];
        if (found?.syncedLyrics) {
          return parseLrc(found.syncedLyrics);
        }
      }
    }

    return [];
  } catch {
    return [];
  }
};
