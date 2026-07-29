import { useMemo } from "react";
import { generateStrokes } from "../utils/generative";

export default function PaintingCanvas({ seed, palette, className = "" }) {
  const strokes = useMemo(() => generateStrokes(seed, palette, 7), [seed, palette]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Üretimsel eser önizlemesi"
    >
      <rect width="100" height="100" fill={palette[palette.length - 1]} opacity="0.9" />
      {strokes.map((s, i) => (
        <path
          key={i}
          d={`M ${s.x1} ${s.y1} Q ${(s.x1 + s.x2) / 2 + s.curve} ${(s.y1 + s.y2) / 2 - s.curve}, ${s.x2} ${s.y2}`}
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinecap="round"
          fill="none"
          opacity={s.opacity}
        />
      ))}
    </svg>
  );
}
