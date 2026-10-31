"use client";

import { useSyncExternalStore } from "react";

// End of Q4 season, Kuala Lumpur time.
const SEASON_END = new Date("2026-12-31T23:59:59+08:00").getTime();

let now = Date.now();

function subscribe(onChange: () => void) {
  now = Date.now();
  const id = setInterval(() => {
    now = Date.now();
    onChange();
  }, 30_000);
  return () => clearInterval(id);
}

function formatRemaining(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return `${d}d ${h}h ${m}m`;
}

export default function CountdownPill() {
  const current = useSyncExternalStore(
    subscribe,
    () => now,
    () => null,
  );

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-card px-4 py-2 text-sm font-semibold">
      <span className="size-2 rounded-full bg-green animate-pulse" />
      Q4 season ends in{" "}
      <span className="font-score text-primary">
        {current === null ? "--d --h --m" : formatRemaining(SEASON_END - current)}
      </span>
    </div>
  );
}
