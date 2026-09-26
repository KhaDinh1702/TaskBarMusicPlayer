import { PlaybackMode } from "../../shared/types";

export const reorderList = <T>(list: T[], startIndex: number, endIndex: number): T[] => {
  if (
    startIndex < 0 ||
    startIndex >= list.length ||
    endIndex < 0 ||
    endIndex >= list.length ||
    startIndex === endIndex
  ) {
    return [...list];
  }

  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const getNextTrackIndex = (
  currentIndex: number,
  totalTracks: number,
  mode: PlaybackMode
): number => {
  if (totalTracks <= 0) return -1;
  if (totalTracks === 1) return 0;

  switch (mode) {
    case "repeat-one":
      return currentIndex >= 0 ? currentIndex : 0;

    case "shuffle": {
      let randIndex = Math.floor(Math.random() * totalTracks);
      if (randIndex === currentIndex && totalTracks > 1) {
        randIndex = (randIndex + 1) % totalTracks;
      }
      return randIndex;
    }

    case "repeat":
      return (currentIndex + 1) % totalTracks;

    case "normal":
    default:
      if (currentIndex + 1 >= totalTracks) return -1;
      return currentIndex + 1;
  }
};

export const getPreviousTrackIndex = (
  currentIndex: number,
  totalTracks: number,
  mode: PlaybackMode
): number => {
  if (totalTracks <= 0) return -1;
  if (totalTracks === 1) return 0;

  switch (mode) {
    case "repeat-one":
      return currentIndex >= 0 ? currentIndex : 0;

    case "shuffle": {
      let randIndex = Math.floor(Math.random() * totalTracks);
      if (randIndex === currentIndex && totalTracks > 1) {
        randIndex = (randIndex + totalTracks - 1) % totalTracks;
      }
      return randIndex;
    }

    case "repeat":
    case "normal":
    default:
      return currentIndex <= 0 ? totalTracks - 1 : currentIndex - 1;
  }
};
