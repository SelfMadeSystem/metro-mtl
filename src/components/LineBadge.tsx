import type { Line } from "../content.config";

export default function LineBadge({ line }: { line: Line }) {
  return (
    <span
      className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold line text-base"
      style={{
        background: line.color,
        color: line.textColor,
      }}
      title={line.name}
    >
      {line.code}
    </span>
  );
}
