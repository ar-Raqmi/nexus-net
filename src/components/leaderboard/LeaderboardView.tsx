"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getLevel } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";
import type { LeaderboardRow } from "@/store/selectors";
import { selectStartupLeaderboard } from "@/store/selectors";
import { seedQuests, seedStartups } from "@/seed";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

export default function LeaderboardView() {
  const hydrated = useHasHydrated();
  const storeStartups = useGameStore((s) => s.startups);
  const storeQuests = useGameStore((s) => s.quests);
  const currentStartupId = useGameStore((s) => s.currentStartupId);

  const startups = hydrated ? storeStartups : seedStartups;
  const quests = hydrated ? storeQuests : seedQuests;

  const rows = useMemo(
    () => selectStartupLeaderboard(startups, quests),
    [startups, quests],
  );

  const top = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myId = hydrated ? currentStartupId : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          Season standings
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold">Leaderboard</h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted">
          Startups ranked by XP earned from verified outcomes and event subscriptions.
        </p>
      </header>

      {/* Top 3 podium */}
      <section className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
        {[top[1], top[0], top[2]].map((row, i) => {
          const place = i === 1 ? 1 : i === 0 ? 2 : 3;
          return (
            <div key={place} className="flex items-end">
              {row ? (
                <PodiumCard row={row} place={place as 1 | 2 | 3} mine={row.id === myId} />
              ) : null}
            </div>
          );
        })}
      </section>

      {/* Ranked list */}
      <section className="rounded-3xl bg-white shadow-card overflow-hidden">
        <ul className="divide-y divide-ink/5">
          {rest.map((row, i) => (
            <RankRow key={row.id} row={row} rank={i + 4} mine={row.id === myId} />
          ))}
        </ul>
      </section>

      <p className="text-center text-sm text-subtle">
        Want to climb?{" "}
        <Link href="/quests" className="font-bold text-primary hover:underline">
          Complete quests
        </Link>{" "}
        or{" "}
        <Link href="/events" className="font-bold text-primary hover:underline">
          subscribe to events
        </Link>
        .
      </p>
    </div>
  );
}

const PODIUM_STYLE = {
  1: { panel: "bg-yellow", medal: "🥇", height: "h-40 sm:h-48" },
  2: { panel: "tier-silver", medal: "🥈", height: "h-32 sm:h-40" },
  3: { panel: "tier-peach", medal: "🥉", height: "h-28 sm:h-32" },
} as const;

function PodiumCard({
  row,
  place,
  mine,
}: {
  row: LeaderboardRow;
  place: 1 | 2 | 3;
  mine: boolean;
}) {
  const style = PODIUM_STYLE[place];
  return (
    <Link
      href="/quests"
      className={`${style.panel} ${style.height} w-full rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-end text-center shadow-card transition hover:-translate-y-1 ${
        mine ? "ring-4 ring-primary" : ""
      }`}
    >
      <span className="text-3xl sm:text-4xl" aria-hidden>
        {style.medal}
      </span>
      <h3 className="mt-1 w-full text-sm sm:text-lg font-bold leading-tight line-clamp-2">
        {row.name}
      </h3>
      <p className="font-score text-xl sm:text-3xl font-bold text-primary leading-tight">
        {row.score.toLocaleString("en-US")}
      </p>
      <p className="text-[11px] font-semibold text-ink/70">XP · {row.outcomes} quests</p>
    </Link>
  );
}

function RankRow({
  row,
  rank,
  mine,
}: {
  row: LeaderboardRow;
  rank: number;
  mine: boolean;
}) {
  const level = getLevel(row.score);
  const tier = TIER_STYLE[level.name];

  return (
    <li
      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 ${
        mine ? "bg-primary/5" : ""
      }`}
    >
      <span className="font-score text-lg sm:text-xl font-bold text-subtle w-8">
        #{rank}
      </span>
      <span
        className={`${tier.bg} size-10 shrink-0 rounded-xl flex items-center justify-center text-xl`}
        aria-hidden
      >
        {tier.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold truncate">
          {row.name}
          {mine && <span className="ml-2 text-xs font-bold text-primary">You</span>}
        </p>
        <p className="text-xs text-muted truncate">{row.subtitle}</p>
      </div>
      <div className="text-right">
        <p className="font-score text-lg sm:text-xl font-bold text-primary">
          {row.score.toLocaleString("en-US")}
        </p>
        <p className="text-xs text-muted">{row.outcomes} quests</p>
      </div>
    </li>
  );
}