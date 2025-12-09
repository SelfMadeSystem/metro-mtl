import type { Line } from "../content.config";

export default function LineBadge({
  line,
  station,
}: {
  line: Line;
  station?: boolean;
}) {
  const code = (station ?? true) ? line.stationCode ?? line.code : line.code;
  if (line.style === "split") {
    return (
      <span
        className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold line text-base bg-white dark:bg-stm-black"
        style={{
          border: `4px solid ${line.color}`,
          color: line.textColor,
        }}
        title={line.name}
      >
        {code}
      </span>
    );
  }
  return (
    <span
      className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold line text-base"
      style={{
        background: line.color,
        color: line.textColor,
      }}
      title={line.name}
    >
      {code}
    </span>
  );
}
