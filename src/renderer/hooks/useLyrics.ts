import { useState, useEffect } from "preact/hooks";
import { TrackMetadata } from "../../shared/types";
import { LyricLine, fetchLyricsFromLrclib } from "../utils/lyrics";

export const useLyrics = (currentTrack: TrackMetadata | null) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchLyricsFromLrclib(currentTrack.title, currentTrack.artist, currentTrack.duration)
      .then((lines) => {
        if (isMounted) {
          setLyrics(lines);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyrics([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id]);

  return { lyrics, isLoading };
};
