import Graph from "graphology";
import shortestPath from "graphology-shortest-path/unweighted";
import type { Line, StationWithLines } from "./content.config";

type BoardingInfo = {
  position: "front" | "middle" | "back" | "none";
  car?: number; // Car number (-9 to 9, where negative indicates from the back)
  door?: number; // Door number (1-4)
  oppositeDoors?: boolean; // If true, the doors will be on the opposite side of the train
};

export type MetroPathStartStep = {
  type: "start";
  station: StationWithLines;
  line: Line;
  towards: StationWithLines;
  boarding: BoardingInfo;
};

export type MetroPathTransferStep = {
  type: "transfer";
  station: StationWithLines;
  fromLine: Line;
  toLine: Line;
  fromDirection: StationWithLines;
  toDirection: StationWithLines;
  boarding: BoardingInfo;
  exiting: BoardingInfo;
};

export type MetroPathExitStep = {
  type: "exit";
  station: StationWithLines;
  towards: StationWithLines | null;
  exiting: BoardingInfo;
};

export type MetroPathStep =
  | MetroPathStartStep
  | MetroPathTransferStep
  | MetroPathExitStep;

export type PartialMetroPathStep =
  | Omit<MetroPathStartStep, "boarding">
  | Omit<MetroPathTransferStep, "boarding" | "exiting">
  | Omit<MetroPathExitStep, "exiting">;

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

  public pathToSteps(path: StationWithLines[]): PartialMetroPathStep[] {
    if (path.length === 0) return [];

    const steps: PartialMetroPathStep[] = [];
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

        const prevPrevTowards = prevTowards;

        prevTowards = towards;

        if (newLine && currentLine) {
          steps.push({
            type: "transfer",
            station: station,
            fromLine: currentLine,
            toLine: newLine,
            fromDirection: prevPrevTowards!,
            toDirection: towards,
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

  public addBoardingInfo(
    steps: Exclude<PartialMetroPathStep & Partial<MetroPathStep>, never>[]
  ): MetroPathStep[] {
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];

      switch (step.type) {
        case "exit": {
          if (steps.length === 1) {
            // user prolly trolling
            step.exiting = { position: "none" };
            break;
          }
          if (i !== steps.length - 1) {
            throw new Error("Exit must be the last step");
          }
          if (!step.station.exits || !step.towards) {
            step.exiting = { position: "none" };
            break;
          }

          const prevStep = steps[i - 1];

          // TODO: allow user to choose
          const exit =
            step.station.lines.length > 1
              ? step.station.exits.find((s) => {
                  if (prevStep.type === "transfer") {
                    return s.optimalBoarding?.id === prevStep.toDirection.id;
                  }
                  if (prevStep.type === "start") {
                    return s.optimalBoarding?.id === prevStep.towards.id;
                  }
                  return false;
                })
              : step.station.exits[0];

          // No boarding info if no exit info
          if (!exit || (!exit.boarding && !exit.optimalBoarding)) {
            step.exiting = { position: "none" };
            break;
          }

          // Use optimal boarding if no boarding info
          if (!exit.boarding && exit.optimalBoarding) {
            const optimal = exit.optimalBoarding;
            if (!step.towards) {
              step.exiting = { position: "none" };
              break;
            }

            // Determine direction
            switch (optimal.id) {
              case step.towards.id:
                step.exiting = { position: "front" };
                continue;
              case "middle":
                step.exiting = { position: "middle" };
                continue;
              default:
                // TODO: Validate this
                step.exiting = { position: "back" };
                continue;
            }
          }

          // This case shouldn't ever happen.
          if (!exit.boarding) {
            throw new Error("Exit should have boarding info at this point");
          }

          if (!(step.towards.id in exit.boarding)) {
            // No boarding info for this direction
            // Shouldn't happen if the data is correct
            step.exiting = { position: "none" };
            break;
          }

          step.exiting = exit.boarding[step.towards.id] || { position: "none" };
          break;
        }
        case "transfer": {
          if (i === 0 || i === steps.length - 1) {
            throw new Error("Transfer cannot be the first or last step");
          }
          const next = steps[i + 1];
          if (next.type === "start") {
            throw new Error("Invalid path: start cannot follow transfer");
          }
          if (!next.exiting) {
            throw new Error("Next step must have had exiting info added first");
          }
          // Set this step's boarding to the next step's exiting
          step.boarding = next.exiting;

          if (
            !step.station.pathfinding ||
            !step.station.pathfinding.transfers
          ) {
            step.exiting = { position: "none" };
            break;
          }

          console.log(step.station.pathfinding.transfers, step);

          const transfer = step.station.pathfinding.transfers.find((t) => {
            return (
              t.fromLine.id === step.fromLine.id &&
              t.toLine.id === step.toLine.id &&
              t.fromDirection.id === step.fromDirection.id &&
              t.toDirection.id === step.toDirection.id
            );
          });

          if (!transfer) {
            step.exiting = { position: "none" };
            break;
          }

          const { oppositeDoors } = transfer;

          if (!transfer.boarding && !transfer.singleBoarding) {
            step.exiting = { position: "none", oppositeDoors };
            break;
          }

          if (!transfer.boarding && transfer.singleBoarding) {
            step.exiting = { ...transfer.singleBoarding, oppositeDoors };
            break;
          }

          if (!transfer.boarding) {
            throw new Error("Transfer should have boarding info at this point");
          }

          // No boarding info for this direction. Probably because it's "none"
          if (!(next.exiting.position in transfer.boarding)) {
            step.exiting = { position: "none", oppositeDoors };
            break;
          }

          step.exiting = {
            ...(transfer.boarding[
              next.exiting.position as keyof typeof transfer.boarding
            ] || {
              position: "none",
            }),
            oppositeDoors,
          };
          break;
        }
        case "start": {
          if (i !== 0) {
            throw new Error("Start must be the first step");
          }
          const next = steps[i + 1];
          if (!next || next.type === "start") {
            throw new Error(
              "Invalid path: start must be followed by transfer/exit"
            );
          }
          if (!next.exiting) {
            throw new Error("Next step must have had exiting info added first");
          }
          step.boarding = next.exiting;
          break;
        }
      }
    }

    return steps as MetroPathStep[];
  }
}
