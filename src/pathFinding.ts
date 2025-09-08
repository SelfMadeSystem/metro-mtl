import Graph from "graphology";
import shortestPath from "graphology-shortest-path/unweighted";
import type {
  Line,
  PathfindingTransfer,
  StationWithLines,
} from "./content.config";

function inversePathfindingTransfer(
  transfer: PathfindingTransfer
): PathfindingTransfer {
  return {
    fromLine: transfer.toLine,
    toLine: transfer.fromLine,
    sameDirection: transfer.sameDirection
      ? transfer.sameDirection.map(([a, b]) => [b, a])
      : undefined,
    crossDirection: transfer.crossDirection
      ? transfer.crossDirection.map(([a, b]) => [b, a])
      : undefined,
  };
}

type OptimalBoarding = "front" | "middle" | "back" | "none" | `none${number}`; // will remove noneX later

function oppositeOptimalBoarding(boarding: OptimalBoarding): OptimalBoarding {
  switch (boarding) {
    case "front":
      return "back";
    case "back":
      return "front";
    case "middle":
    case "none":
    default:
      return boarding;
  }
}

type MetroPathStartStep = {
  type: "start";
  station: StationWithLines;
  line: Line;
  towards: StationWithLines;
  optimalBoarding?: OptimalBoarding;
};

type MetroPathTransferStep = {
  type: "transfer";
  station: StationWithLines;
  fromLine: Line;
  toLine: Line;
  towards: StationWithLines;
  optimalBoarding?: OptimalBoarding;
};

type MetroPathExitStep = {
  type: "exit";
  station: StationWithLines;
  towards: StationWithLines | null;
  optimalBoarding?: OptimalBoarding;
};

export type MetroPathStep =
  | MetroPathStartStep
  | MetroPathTransferStep
  | MetroPathExitStep;

export type MetroPathStepOptimal = MetroPathStep & {
  optimalBoarding: OptimalBoarding;
};

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
    let prevTowards: StationWithLines | null = null;

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

        prevTowards = towards;

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

        prevTowards = towards;

        if (newLine && currentLine) {
          steps.push({
            type: "transfer",
            station: station,
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
          towards: prevTowards,
        });
      }
    }

    return steps;
  }

  public addOptimalBoardingInfo(
    steps: MetroPathStep[]
  ): MetroPathStepOptimal[] {
    // Work backwards to assign optimal boarding info
    let nextOptimalBoarding: OptimalBoarding = "none6";

    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];

      switch (step.type) {
        case "exit": {
          const exit = step.station.exits?.[0];
          if (!exit || !step.towards || !exit.optimalBoarding) {
            nextOptimalBoarding = step.optimalBoarding = "none7";
            continue;
          }
          switch (exit.optimalBoarding.id) {
            case step.towards.id:
              nextOptimalBoarding = "front";
              break;
            case "middle":
              nextOptimalBoarding = "middle";
              break;
            // assume opposite direction. might verify later, but too lazy now
            default:
              nextOptimalBoarding = "back";
              break;
          }
          step.optimalBoarding = nextOptimalBoarding;
          break;
        }
        case "transfer": {
          step.optimalBoarding = nextOptimalBoarding;
          if (!step.station.pathfinding?.transfers) {
            // TODO: Implement logic for regular transfers
            nextOptimalBoarding = "none1";
            continue;
          }

          const fromStep = steps[i - 1];
          const from = fromStep.station;

          if (!Array.isArray(step.station.pathfinding.transfers)) {
            nextOptimalBoarding = "none2"; // TODO: Implement full logic here
            continue;
          }

          if (!fromStep.towards) {
            nextOptimalBoarding = "none3";
            continue;
          }

          let foundTransfer = step.station.pathfinding.transfers.find(
            (transfer) =>
              (transfer.fromLine.id === step.fromLine.id &&
                transfer.toLine.id === step.toLine.id) ||
              (transfer.fromLine.id === step.toLine.id &&
                transfer.toLine.id === step.fromLine.id)
          );

          if (
            foundTransfer &&
            foundTransfer.fromLine.id === step.toLine.id &&
            foundTransfer.toLine.id === step.fromLine.id
          ) {
            foundTransfer = inversePathfindingTransfer(foundTransfer);
          }

          if (!foundTransfer) {
            nextOptimalBoarding = "none4";
            continue;
          }

          const sameDirection = foundTransfer.sameDirection?.find(
            ([a, b]) =>
              a.id === fromStep.towards!.id && b.id === step.towards.id
          );
          if (sameDirection) {
            // same direction transfer
            // keep the same optimal boarding
            continue;
          }

          const crossDirection = foundTransfer.crossDirection?.find(
            ([a, b]) =>
              a.id === fromStep.towards!.id && b.id === step.towards.id
          );
          if (crossDirection) {
            // cross platform transfer
            nextOptimalBoarding = oppositeOptimalBoarding(nextOptimalBoarding);
            continue;
          }

          nextOptimalBoarding = "none5";

          break;
        }
        case "start": {
          step.optimalBoarding = nextOptimalBoarding;
          break;
        }
      }
    }

    return steps as MetroPathStepOptimal[];
  }
}
