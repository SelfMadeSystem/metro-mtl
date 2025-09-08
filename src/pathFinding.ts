import Graph from "graphology";
import shortestPath from "graphology-shortest-path/unweighted";
import type { Line, StationWithLines } from "./content.config";

type MetroPathStartStep = {
  type: "start";
  station: StationWithLines;
  line: Line;
  towards: StationWithLines;
};

type MetroPathTransferStep = {
  type: "transfer";
  at: StationWithLines;
  fromLine: Line;
  toLine: Line;
  towards: StationWithLines;
};

type MetroPathExitStep = {
  type: "exit";
  station: StationWithLines;
};

export type MetroPathStep =
  | MetroPathStartStep
  | MetroPathTransferStep
  | MetroPathExitStep;

export class MetroPathFinder {
  private graph: Graph;
  private stationsById: Record<string, StationWithLines> = {};

  constructor(private lines: Line[], private stations: StationWithLines[]) {
    for (const station of stations) {
      this.stationsById[station.id] = station;
    }
    this.graph = new Graph();

    this.buildGraph();
  }

  private buildGraph() {
    for (const line of this.lines) {
      const stations = line.stations;
      for (let i = 0; i < stations.length - 1; i++) {
        const stationA = stations[i];
        const stationB = stations[i + 1];

        if (!this.graph.hasNode(stationA.id)) {
          this.graph.addNode(stationA.id, this.stationsById[stationA.id]);
        }
        if (!this.graph.hasNode(stationB.id)) {
          this.graph.addNode(stationB.id, this.stationsById[stationB.id]);
        }

        if (!this.graph.hasEdge(stationA.id, stationB.id)) {
          this.graph.addEdge(stationA.id, stationB.id);
        }

        if (!this.graph.hasEdge(stationB.id, stationA.id)) {
          this.graph.addEdge(stationB.id, stationA.id);
        }
      }
    }
  }

  public findShortestPath(
    startId: string,
    endId: string
  ): StationWithLines[] | null {
    if (!this.graph.hasNode(startId) || !this.graph.hasNode(endId)) {
      return null;
    }

    const path = shortestPath.bidirectional(this.graph, startId, endId);
    if (!path) {
      return null;
    }

    return path.map((stationId) => this.stationsById[stationId]);
  }

  public getTowardsStation(
    current: StationWithLines,
    next: StationWithLines
  ): StationWithLines | null {
    // Find a line that connects current to next
    const commonLine = current.lines.find((line) =>
      next.lines.some((l) => l.id === line.id)
    );
    if (!commonLine) return null;

    // Determine direction on that line
    const currentIndex = commonLine.stations.findIndex(
      (s) => s.id === current.id
    );
    const nextIndex = commonLine.stations.findIndex((s) => s.id === next.id);

    if (currentIndex === -1 || nextIndex === -1) return null;

    if (nextIndex > currentIndex) {
      // Moving forward on the line
      return this.stationsById[commonLine.stations.at(-1)!.id];
    } else {
      // Moving backward on the line
      return this.stationsById[commonLine.stations[0].id];
    }
  }

  public pathToSteps(path: StationWithLines[]): MetroPathStep[] {
    if (path.length === 0) return [];

    const steps: MetroPathStep[] = [];
    let currentLine: Line | null = null;

    for (let i = 0; i < path.length; i++) {
      const station = path[i];
      const nextStation = path[i + 1] || null;

      if (i === 0 && nextStation) {
        // Determine starting line
        currentLine = station.lines.find((line) =>
          line.stations.some((s) => s.id === nextStation.id)
        ) as Line;

        const towards = this.getTowardsStation(station, nextStation);

        if (!currentLine || !towards) {
          throw new Error("Invalid path: cannot determine starting line");
        }

        steps.push({
          type: "start",
          station,
          line: currentLine,
          towards,
        });
      } else if (nextStation) {
        // Check if we need to transfer
        const onSameLine = currentLine?.stations.some(
          (s) => s.id === nextStation.id
        );

        if (onSameLine) {
          continue;
        }

        // Transfer needed
        const newLine = station.lines.find((line) =>
          line.stations.some((s) => s.id === nextStation.id)
        ) as Line;

        const towards = this.getTowardsStation(station, nextStation);

        if (!towards) {
          throw new Error("Invalid path: cannot determine transfer direction");
        }

        if (newLine && currentLine) {
          steps.push({
            type: "transfer",
            at: station,
            fromLine: currentLine,
            toLine: newLine,
            towards,
          });
          currentLine = newLine;
        }
      } else {
        // Last station, exit
        steps.push({
          type: "exit",
          station,
        });
      }
    }

    return steps;
  }
}
