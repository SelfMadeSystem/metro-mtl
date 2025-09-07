import { useState } from "react";
import type { Line, Station } from "../content.config";
import LineList from "./LineList";
import { normalizeString } from "../utils";
import StationButton from "./StationButton";
import { useFavorites } from "../hooks/useFavorites";
import { AnimatePresence, motion } from "framer-motion";

export default function StationSearch({
  lines,
  lineById,
  stations,
  stationsByLine,
}: {
  lines: Line[];
  lineById: Record<string, Line>;
  stations: Station[];
  stationsByLine: Record<string, Station[]>;
}) {
  const [query, setQuery] = useState("");
  const { isFavorite, toggleFavorite, getFavoriteStations } = useFavorites();

  const normalizedQuery = normalizeString(query);
  const filteredStations = stations
    .filter((station) =>
      normalizeString(station.name).includes(normalizedQuery)
    )
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const favoriteStations = getFavoriteStations(stations);

  return (
    <div className="flex flex-col items-center gap-4 mt-8 pb-8">
      <input
        type="text"
        placeholder="Search for a station..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
      />
      {query !== "" &&
        (filteredStations.length > 0 ? (
          <div className="flex flex-wrap justify-between mx-8 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStations.map((station) => (
                <motion.div
                  key={station.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    layout: { duration: 0.3, ease: "circInOut" },
                  }}
                  className="mx-auto"
                >
                  <StationButton
                    station={station}
                    lineById={lineById}
                    isFavorite={isFavorite(station.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="w-full">No stations found.</p>
        ))}
      {query === "" && (
        <AnimatePresence>
          {favoriteStations.length > 0 && (
            <motion.div
              className="w-full"
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                layout: { duration: 0.3, ease: "circInOut" },
              }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-yellow-600">
                ★ Favorite Stations
              </h2>
              <div className="flex flex-wrap justify-center gap-4 mx-8 mb-8">
                <AnimatePresence>
                  {favoriteStations.map((station) => (
                    <motion.div
                      key={station.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        layout: { duration: 0.3, ease: "circInOut" },
                      }}
                    >
                      <StationButton
                        station={station}
                        lineById={lineById}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {query === "" && (
        <motion.div
          className="flex justify-between flex-wrap mx-8 gap-8"
          layout
          transition={{
            layout: { duration: 0.3, ease: "circInOut" },
          }}
        >
          {lines.map((line) => (
            <LineList
              key={line.id}
              line={line}
              lineById={lineById}
              stationsByLine={stationsByLine}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
