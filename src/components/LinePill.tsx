import type { Line } from "../content.config";

export default function LinePill({
  line,
  towards,
}: {
  line: Line;
  towards?: string;
}) {
  return (
    <span
      className="inline-flex items-center pl-2 pr-3 py-1.5 rounded-full text-sm font-bold shadow-sm text-nowrap"
      style={{
        backgroundColor: line.color,
        color: line.textColor,
      }}
    >
      <span className="w-6 h-6 rounded-full bg-white text-black bg-opacity-20 flex items-center justify-center mr-2 text-xs font-black">
        {
          // Hard-code direction A1 Brossard for now since it's the only line with a different code for the direction
          towards === "Brossard" ? "A1" : line.code
        }
      </span>
      {towards ?? line.name}
    </span>
  );
}
