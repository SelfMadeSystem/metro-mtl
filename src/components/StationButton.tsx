import clsx from "clsx";
import type { Line, Station } from "../content.config";
import LineBadge from "./LineBadge";

export default function StationButton({
  station,
  lineById,
  line,
}: {
  station: Station;
  lineById: Record<string, Line>;
  line?: Line;
}) {
  return (
    <a
      href={`/station/${station.id}/`}
      className={clsx(
        "group p-4 border border-gray-300 hover:shadow-lg transition-shadow flex",
        line ? "rounded-r-2xl border-l-0 relative" : "rounded-2xl"
      )}
    >
      {line && (
        <>
          <div
            className="w-8 absolute left-0 -top-2 -bottom-2 group-last:rounded-b-full flex items-center group-last:items-end"
            style={{ background: line.color }}
          >
            <div className="w-4 h-4 bg-white rounded-full mx-auto group-last:mb-1 group-last:w-6 group-last:h-6" />
          </div>
          <div className="w-8" />
        </>
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
