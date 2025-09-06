import { useState } from "react";
import type { Line, Station } from "../content.config";
import LineBadge from "./LineBadge";
import StationButton from "./StationButton";
import { motion } from "framer-motion";

export function LineList({
  line,
  lineById,
  stationsByLine,
}: {
  line: Line;
  lineById: Record<string, Line>;
  stationsByLine: Record<string, Station[]>;
}) {
  const [reversed, setReversed] = useState(false);

  const stations = reversed
    ? stationsByLine[line.id].toReversed()
    : stationsByLine[line.id];

  return (
    <div className="flex-1 relative isolate h-fit">
      <div
        className="w-8 absolute left-0 top-4 -bottom-4 -z-10 rounded-b-full"
        style={{ background: line.color }}
      />
      <h2
        className="text-2xl font-bold mb-4 flex gap-2 text-nowrap items-center cursor-pointer select-none"
        style={{ color: line.color }}
        onClick={() => setReversed(!reversed)}
      >
        <LineBadge line={line} />
        {line.name}
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 mt-1 transition-transform ${
            reversed ? "rotate-180" : ""
          }`}
        >
          <path
            d="M12 5V19M12 19L5 12M12 19L19 12"
            stroke={line.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </h2>
      <div className="space-y-2">
        {stations.map((station) => (
          <motion.div
            className="group pl-8"
            key={station.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              layout: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2 },
            }}
          >
            <StationButton
              station={station}
              lineById={lineById}
              line={line}
              isLast={station === stations[stations.length - 1]}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
