import { useState, useMemo, useEffect } from "react";
import {
  MetroPathFinder,
  type MetroPathStep,
  type MetroPathStepOptimal,
} from "../pathFinding";
import type { Line, StationWithLines } from "../content.config";
import { normalizeString } from "../utils";
import LinePill from "./LinePill";

export default function PathFinding({
  stations,
  lines,
}: {
  stations: StationWithLines[];
  lines: Line[];
}) {
  const [pathFinder] = useState(() => new MetroPathFinder(lines, stations));
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [path, setPath] = useState<StationWithLines[] | null>(null);
  const [steps, setSteps] = useState<MetroPathStepOptimal[] | null>(null);
  const [startSearch, setStartSearch] = useState("");
  const [endSearch, setEndSearch] = useState("");
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);

  // Handle URL query parameters on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const startParam = urlParams.get("start");
      const endParam = urlParams.get("end");

      // Find stations by ID if they exist
      const startStationExists =
        startParam && stations.find((s) => s.id === startParam);
      const endStationExists =
        endParam && stations.find((s) => s.id === endParam);

      if (startStationExists) {
        setStartStation(startParam);
      }
      if (endStationExists) {
        setEndStation(endParam);
      }

      // If both stations are valid, find the path
      if (startStationExists && endStationExists) {
        const result = pathFinder.findShortestPath(startParam, endParam);
        setPath(result);
        if (result) {
          const pathSteps = pathFinder.pathToSteps(result);
          console.log("Path Steps:", pathSteps);
          setSteps(pathFinder.addOptimalBoardingInfo(pathSteps));
        } else {
          setSteps(null);
        }
      }
    }
  }, [stations, pathFinder]); // Run when stations data is available

  // Create searchable station options
  const stationOptions = useMemo(() => {
    return stations.map((station) => ({
      id: station.id,
      name: station.name,
      searchText: normalizeString(`${station.name} ${station.id}`),
    }));
  }, [stations]);

  // Filter stations based on search
  const filteredStartStations = useMemo(() => {
    if (!startSearch) return stationOptions;
    return stationOptions.filter((station) =>
      station.searchText.includes(normalizeString(startSearch))
    );
  }, [stationOptions, startSearch]);

  const filteredEndStations = useMemo(() => {
    if (!endSearch) return stationOptions;
    return stationOptions.filter((station) =>
      station.searchText.includes(normalizeString(endSearch))
    );
  }, [stationOptions, endSearch]);

  const selectedStartStation = stationOptions.find(
    (s) => s.id === startStation
  );
  const selectedEndStation = stationOptions.find((s) => s.id === endStation);

  const handleFindPath = (start: string, end: string) => {
    if (!start || !end) {
      setPath(null);
      setSteps(null);
      return;
    }

    const result = pathFinder.findShortestPath(start, end);
    setPath(result);
    if (result) {
      const pathSteps = pathFinder.pathToSteps(result);
      console.log("Path Steps:", pathSteps);
      setSteps(pathFinder.addOptimalBoardingInfo(pathSteps));
    } else {
      setSteps(null);
    }
  };

  const handleStartSelect = (stationId: string) => {
    setStartStation(stationId);
    setStartSearch("");
    setShowStartDropdown(false);

    // Update URL parameters
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("start", stationId);
      window.history.replaceState({}, "", url.toString());
    }

    if (endStation) {
      handleFindPath(stationId, endStation);
    }
  };

  const handleEndSelect = (stationId: string) => {
    setEndStation(stationId);
    setEndSearch("");
    setShowEndDropdown(false);

    // Update URL parameters
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("end", stationId);
      window.history.replaceState({}, "", url.toString());
    }

    if (startStation) {
      handleFindPath(startStation, stationId);
    }
  };

  const handleSwapStations = () => {
    const prevStart = startStation;
    setStartStation(endStation);
    setEndStation(prevStart);

    // Update URL parameters
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (endStation) {
        url.searchParams.set("start", endStation);
      } else {
        url.searchParams.delete("start");
      }
      if (prevStart) {
        url.searchParams.set("end", prevStart);
      } else {
        url.searchParams.delete("end");
      }
      window.history.replaceState({}, "", url.toString());
    }

    if (endStation && prevStart) {
      handleFindPath(endStation, prevStart);
    } else {
      setPath(null);
      setSteps(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Find Shortest Path</h1>
      <div className="mb-4 flex flex-wrap gap-4">
        {/* Start Station Selector */}
        <div className="relative flex-1 min-w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Station
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search start station..."
              value={
                selectedStartStation ? selectedStartStation.name : startSearch
              }
              onChange={(e) => {
                setStartSearch(e.target.value);
                setStartStation("");
                setShowStartDropdown(true);
              }}
              onFocus={() => setShowStartDropdown(true)}
              className="w-full border border-gray-300 bg-white/50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showStartDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b max-h-48 overflow-y-auto shadow-lg">
                {filteredStartStations.length > 0 ? (
                  filteredStartStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStartSelect(station.id)}
                      className="w-full text-left p-2 hover:bg-blue-50 focus:bg-blue-50 border-none"
                    >
                      <div className="font-medium">{station.name}</div>
                      <div className="text-sm text-gray-500">{station.id}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No stations found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-end">
          <button
            onClick={handleSwapStations}
            className="cursor-pointer bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Swap Start and End Stations"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="white"
                d="M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z"
              />
            </svg>
          </button>
        </div>

        {/* End Station Selector */}
        <div className="relative flex-1 min-w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Station
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search destination station..."
              value={selectedEndStation ? selectedEndStation.name : endSearch}
              onChange={(e) => {
                setEndSearch(e.target.value);
                setEndStation("");
                setShowEndDropdown(true);
              }}
              onFocus={() => setShowEndDropdown(true)}
              className="w-full border border-gray-300 bg-white/50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showEndDropdown && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b max-h-48 overflow-y-auto shadow-lg">
                {filteredEndStations.length > 0 ? (
                  filteredEndStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleEndSelect(station.id)}
                      className="w-full text-left p-2 hover:bg-blue-50 focus:bg-blue-50 border-none"
                    >
                      <div className="font-medium">{station.name}</div>
                      <div className="text-sm text-gray-500">{station.id}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No stations found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {path && steps && path.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Shortest Path ({path.length} stations):
          </h2>
          <div className="bg-white/50 rounded p-4">
            <ol className="list-decimal list-inside space-y-1">
              {steps.map((step, index) => (
                <StepComponent key={index} step={step} />
              ))}
            </ol>
          </div>
        </div>
      ) : startStation && endStation ? (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">
            No path found between the selected stations.
          </p>
        </div>
      ) : null}

      {/* Click outside to close dropdowns */}
      {(showStartDropdown || showEndDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowStartDropdown(false);
            setShowEndDropdown(false);
          }}
        />
      )}
    </div>
  );
}

function StepComponent({ step }: { step: MetroPathStep }) {
  if (step.type === "start") {
    return (
      <li>
        Start at{" "}
        <a
          href={`/station/${step.station.id}`}
          className="font-bold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {step.station.name}
        </a>{" "}
        {<LinePill line={step.line} />} towards{" "}
        <a
          href={`/station/${step.towards.id}`}
          className="font-bold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {step.towards.name}
        </a>
        . Board at the <span className="font-bold">{step.optimalBoarding}</span>{" "}
        of the train.
      </li>
    );
  } else if (step.type === "transfer") {
    return (
      <li>
        Transfer to <LinePill line={step.toLine} /> towards{" "}
        <a
          href={`/station/${step.towards.id}`}
          className="font-bold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {step.towards.name}
        </a>{" "}
        at{" "}
        <a
          href={`/station/${step.station.id}`}
          className="font-bold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {step.station.name}
        </a>
        . Board at the <span className="font-bold">{step.optimalBoarding}</span>{" "}
        of the train.
      </li>
    );
  } else if (step.type === "exit") {
    return (
      <li>
        Exit at{" "}
        <a
          href={`/station/${step.station.id}`}
          className="font-bold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {step.station.name}
        </a>
        . Exit from the{" "}
        <span className="font-bold">{step.optimalBoarding}</span> of the train.
      </li>
    );
  } else {
    return null;
  }
}
