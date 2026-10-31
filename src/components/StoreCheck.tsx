"use client";

import { useMemo } from "react";
import { getLevel } from "@/lib/game";
import { seedEvents } from "@/seed";
import {
  selectConversionRate,
  selectEventLeaderboard,
  selectFunnel,
  selectStartupLeaderboard,
} from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

/** Temporary phase-1 panel proving the store, seed data and selectors work. Replaced in phase 2. */
export default function StoreCheck() {
  const hydrated = useHasHydrated();
  const startups = useGameStore((s) => s.startups);
  const quests = useGameStore((s) => s.quests);

  const leaders = useMemo(
    () => selectStartupLeaderboard(startups, quests).slice(0, 3),
    [startups, quests],
  );
  const events = useMemo(() => selectEventLeaderboard(seedEvents, quests), [quests]);
  const funnel = useMemo(() => selectFunnel(quests), [quests]);
  const conversion = useMemo(() => selectConversionRate(quests), [quests]);

  if (!hydrated) return <p className="text-subtle">Loading store…</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-3 w-full">
      <div className="rounded-3xl bg-white shadow-card p-6">
        <h2 className="font-bold mb-3">Top startups</h2>
        <ol className="space-y-2">
          {leaders.map((row) => (
            <li key={row.id} className="flex justify-between">
              <span>
                {row.name}{" "}
                <span className="text-subtle text-xs">{getLevel(row.score).name}</span>
              </span>
              <span className="font-score font-bold text-primary">{row.score}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-3xl bg-white shadow-card p-6">
        <h2 className="font-bold mb-3">Funnel</h2>
        <ul className="space-y-2">
          {funnel.map((stage) => (
            <li key={stage.key} className="flex justify-between">
              <span>{stage.label}</span>
              <span className="font-score font-bold text-primary">{stage.count}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Conversion to POC+: <b className="text-ink">{conversion}%</b>
        </p>
      </div>
      <div className="rounded-3xl bg-white shadow-card p-6">
        <h2 className="font-bold mb-3">Events</h2>
        <ul className="space-y-2">
          {events.map((row) => (
            <li key={row.id} className="flex justify-between gap-2">
              <span className="truncate">{row.name}</span>
              <span className="font-score font-bold text-primary">{row.outcomes}</span>
            </li>
          ))}
        </ul>
        <p className="font-pixel text-5xl mt-4 leading-none">
          {quests.filter((q) => q.status === "verified").length}
        </p>
        <p className="text-xs text-subtle">verified outcomes (pixel font check)</p>
      </div>
    </div>
  );
}
