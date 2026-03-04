import type { Line } from "../content.config";
import LineBadge from "./LineBadge";

export function LineBadges({ lines, omit }: { lines: Line[]; omit?: Line }) {
  lines = lines
    .filter(
      (line) =>
        // Omit the line if it's the same as the omit line, or if it has the same station code as the omit line (for split lines)
        !omit || (line.id !== omit.id && line.stationCode !== omit.stationCode),
    )
    .filter(
      (line, index, self) =>
        // Only include the first line with a given station code, to avoid duplicates for branch lines
        !line.stationCode ||
        index === self.findIndex((l) => l.stationCode === line.stationCode),
    );
  return (
    <>
      {lines.map((line) => (
        <LineBadge key={line.id} line={line} />
      ))}
    </>
  );
}
