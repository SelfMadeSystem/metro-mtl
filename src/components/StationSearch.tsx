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
    <div className="flex flex-col items-center mt-8 pb-8">
      <input
        type="text"
        placeholder="Search for a station..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full md:w-1/3 p-2 border rounded border-gray-300 dark:border-white dark:bg-stm-dark"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{
                layout: { duration: 0.3, ease: "circInOut" },
                height: { duration: 0.3, ease: "circInOut" },
              }}
            >
              <motion.h2
                layout
                className="text-2xl font-bold mb-4 text-center text-yellow-600"
              >
                ★ Favorite Stations
              </motion.h2>
              <motion.div
                className="relative flex flex-wrap justify-center gap-4 mx-8"
                layout
              >
                <AnimatePresence mode="popLayout">
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {query === "" && (
        <motion.div
          className="flex justify-between flex-wrap mx-8 gap-8 mt-4"
          layout
          transition={{
            layout: { duration: 0, ease: "circInOut" },
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
