"use client";

import { useEffect, useState } from "react";
import type { FunnelStage } from "@/store/selectors";
import Card from "./Card";

const COLORS = ["bg-primary", "bg-purple", "bg-green", "bg-yellow"];
const MIN_WIDTH = 14; // % — keeps the count readable on tiny stages

const dropOff = (prev: number, count: number) =>
  prev === 0 ? 0 : Math.round((1 - count / prev) * 100);

export default function Funnel({ stages }: { stages: FunnelStage[] }) {
  // Mount at zero width, then grow, so the bars animate in.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card title="Conversion funnel" subtitle="Verified outcomes at each stage of the ladder">
      <ol className="flex flex-col">
        {stages.map((stage, i) => {
          const width = Math.max((stage.count / max) * 100, MIN_WIDTH);
          const drop = i > 0 ? dropOff(stages[i - 1].count, stage.count) : null;
          return (
            <li key={stage.key}>
              {drop !== null && (
                <div className="my-2 pl-1">
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-muted">
                    −{drop}%
                  </span>
                </div>
              )}
              <div className="mb-1 text-sm font-bold text-ink">{stage.label}</div>
              <div
                className={`flex h-12 items-center justify-end rounded-2xl px-4 motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out ${
                  COLORS[Math.min(i, COLORS.length - 1)]
                } ${i === 3 ? "text-ink" : "text-white"}`}
                style={{ width: grown ? `${width}%` : `${MIN_WIDTH}%` }}
              >
                <span className="font-score text-xl font-bold">{stage.count}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
