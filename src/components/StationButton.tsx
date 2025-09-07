import clsx from "clsx";
import type { Line, Station } from "../content.config";
import LineBadge from "./LineBadge";
import { useEffect, useState } from "react";

export default function StationButton({
  station,
  lineById,
  line,
  isLast,
  isFavorite,
  onToggleFavorite,
}: {
  station: Station;
  lineById: Record<string, Line>;
  line?: Line;
  isLast?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (stationId: string) => void;
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
    <div className="relative">
      <a
        href={`/station/${station.id}/`}
        className={clsx(
          "static p-4 border border-gray-300 transition-all flex",
          line
            ? "rounded-r-2xl border-l-0 relative mr-8 hover:mr-0 hover:pr-12"
            : "rounded-2xl hover:shadow-lg"
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
        <h3
          className={clsx(
            "text-xl font-semibold flex gap-2 rounded-lg rounded-r-lg",
            line || station.id === "longueuil" ? "flex-wrap" : "text-nowrap"
          )}
        >
          {station.name}
          {station.lines.map(({ id }) => {
            if (id === line?.id) return null; // Don't show the current line badge
            const l = lineById[id];
            return l ? <LineBadge key={id} line={l} /> : null;
          })}
        </h3>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(station.id);
          }}
          className={clsx(
            "w-8 h-8 min-w-8 min-h-8 rounded-full border-2 transition-all flex items-center justify-center text-lg hover:scale-110",
            isFavorite
              ? "bg-yellow-400 border-yellow-500 text-yellow-800"
              : "bg-white border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-600",
            line ? "absolute top-2 right-2" : "float-right ml-4 -mt-2 -mr-2"
          )}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </a>
    </div>
  );
}
