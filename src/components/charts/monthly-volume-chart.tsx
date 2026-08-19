"use client";

import { useMemo, useState } from "react";
import { formatETB } from "@/components/ui";

interface Point {
  month: string; // YYYY-MM
  volume: number;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 12;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;
const BAR_GAP = 10;

function formatMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function MonthlyVolumeChart({ data }: { data: Point[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const plot = useMemo(() => {
    if (data.length === 0) return null;
    const max = Math.max(1, ...data.map((d) => d.volume));
    const innerW = WIDTH - PAD_LEFT - PAD_RIGHT;
    const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const barW = Math.max(4, innerW / data.length - BAR_GAP);
    const step = innerW / data.length;

    const bars = data.map((d, i) => {
      const barH = (d.volume / max) * innerH;
      return {
        x: PAD_LEFT + step * i + (step - barW) / 2,
        y: PAD_TOP + innerH - barH,
        width: barW,
        height: barH,
        ...d,
      };
    });

    return { bars, baseline: PAD_TOP + innerH };
  }, [data]);

  if (!plot || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[var(--chart-muted)]">
        No approved investments recorded yet.
      </div>
    );
  }

  const hovered = hoverIdx !== null ? plot.bars[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {[0, 0.5, 1].map((t) => {
          const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * t;
          return (
            <line
              key={t}
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y}
              y2={y}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
          );
        })}

        {plot.bars.map((bar, i) => (
          <g key={bar.month}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={Math.max(bar.height, 1)}
              rx={3}
              fill="var(--series-blue)"
              opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.5}
              onMouseEnter={() => setHoverIdx(i)}
            />
            <text
              x={bar.x + bar.width / 2}
              y={HEIGHT - 4}
              fontSize={10}
              fill="var(--chart-muted)"
              textAnchor="middle"
            >
              {formatMonth(bar.month)}
            </text>
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs shadow-md dark:border-neutral-700 dark:bg-neutral-800"
          style={{
            left: `${((hovered.x + hovered.width / 2) / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatETB(hovered.volume)}
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">
            {formatMonth(hovered.month)}
          </p>
        </div>
      )}
    </div>
  );
}
