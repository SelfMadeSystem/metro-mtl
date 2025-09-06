import clsx from "clsx";
import type { Line, Station } from "../content.config";
import LineBadge from "./LineBadge";
import { useEffect, useState } from "react";

export default function StationButton({
  station,
  lineById,
  line,
  isLast,
}: {
  station: Station;
  lineById: Record<string, Line>;
  line?: Line;
  isLast?: boolean;
}) {
  const [prevIsLast, setPrevIsLast] = useState(isLast);

  useEffect(() => {
    // Reason for waiting 1 frame is to allow CSS transitions to apply correctly
    const frame = requestAnimationFrame(() => {
      setPrevIsLast(isLast);
    });

    return () => cancelAnimationFrame(frame);
  }, [isLast]);

  return (
    <a
      href={`/station/${station.id}/`}
      className={clsx(
        "p-4 border border-gray-300 hover:shadow-lg transition-shadow flex",
        line ? "rounded-r-2xl border-l-0 relative" : "rounded-2xl"
      )}
    >
      {line && (
        <div
          className={clsx(
            "w-4 h-4 absolute -left-4 top-1/2 -translate-1/2 bg-white rounded-full mx-auto transition-all",
            prevIsLast && "w-6 h-6 top-full"
          )}
        />
      )}
      <h3 className="text-xl font-semibold flex flex-wrap gap-2 rounded-lg rounded-r-lg">
        {station.name}
        {station.lines.map(({ id }) => {
          if (id === line?.id) return null; // Don't show the current line badge
          const l = lineById[id];
          return l ? <LineBadge key={id} line={l} /> : null;
        })}
      </h3>
    </a>
  );
}
