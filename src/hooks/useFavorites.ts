import type { Station } from "../content.config";
import { useLocalStorage } from "./useLocalStorage";

export function useFavorites() {
  const [favoriteStationIds, setFavoriteStationIds] = useLocalStorage<string[]>(
    "metro-mtl-favorites",
    []
  );

  const addFavorite = (stationId: string) => {
    setFavoriteStationIds((prev) => {
      if (prev.includes(stationId)) return prev;
      return [...prev, stationId];
    });
  };

  const removeFavorite = (stationId: string) => {
    setFavoriteStationIds((prev) => prev.filter((id) => id !== stationId));
  };

  const toggleFavorite = (stationId: string) => {
    if (favoriteStationIds.includes(stationId)) {
      removeFavorite(stationId);
    } else {
      addFavorite(stationId);
    }
  };

  const isFavorite = (stationId: string) =>
    favoriteStationIds.includes(stationId);

  const getFavoriteStations = (allStations: Station[]) => {
    return allStations
      .filter((station) => favoriteStationIds.includes(station.id))
      .toSorted((a, b) => a.name.localeCompare(b.name));
  };

  return {
    favoriteStationIds,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteStations,
  };
}
