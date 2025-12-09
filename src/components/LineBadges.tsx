import type { Line } from "../content.config";
import LineBadge from "./LineBadge";

export function LineBadges({ lines, omit }: { lines: Line[]; omit?: Line }) {
  return (
    <>
      {lines.map((line) => {
        if (
          omit &&
          (line.id === omit.id ||
            (omit.stationCode && line.stationCode == omit.stationCode))
        )
          return null;
        return <LineBadge key={line.id} line={line} />;
      })}
    </>
  );
}
