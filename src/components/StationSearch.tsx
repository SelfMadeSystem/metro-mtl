import { useState } from "react";
import type { Line, Station } from "../content.config";
import LineList from "./LineList";
import { normalizeString } from "../utils";
import StationButton from "./StationButton";

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

  const normalizedQuery = normalizeString(query);
  const filteredStations = stations
    .filter((station) =>
      normalizeString(station.name).includes(normalizedQuery)
    )
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col items-center gap-4 my-8">
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
            {filteredStations.map((station) => (
              <StationButton
                key={station.id}
                station={station}
                lineById={lineById}
              />
            ))}
          </div>
        ) : (
          <p className="w-full">No stations found.</p>
        ))}
      {query === "" && (
        <div className="flex justify-between flex-wrap mx-8 gap-8">
          {lines.map((line) => (
            <LineList
              line={line}
              lineById={lineById}
              stationsByLine={stationsByLine}
            />
          ))}
        </div>
      )}
    </div>
  );
}
