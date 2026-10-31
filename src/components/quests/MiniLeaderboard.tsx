"use client";

import { useMemo } from "react";
import { getLevel } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";
import { selectStartupLeaderboard } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { seedQuests, seedStartups } from "@/seed";

/** Compact "most XP" standings for the quests page. */
export default function MiniLeaderboard() {
  const hydrated = useHasHydrated();
  const storeStartups = useGameStore((s) => s.startups);
  const storeQuests = useGameStore((s) => s.quests);
  const currentStartupId = useGameStore((s) => s.currentStartupId);

  const startups = hydrated ? storeStartups : seedStartups;
  const quests = hydrated ? storeQuests : seedQuests;
  const myId = hydrated ? currentStartupId : null;

  const rows = useMemo(
    () => selectStartupLeaderboard(startups, quests).slice(0, 5),
    [startups, quests],
  );

  return (
    <div className="rounded-3xl bg-white shadow-card overflow-hidden">
      <ul className="divide-y divide-ink/5">
        {rows.map((row, i) => {
          const tier = TIER_STYLE[getLevel(row.score).name];
          const mine = row.id === myId;
          return (
            <li
              key={row.id}
              className={`flex items-center gap-3 px-4 py-3 ${mine ? "bg-primary/5" : ""}`}
            >
              <span className="font-score text-base font-bold text-subtle w-7">#{i + 1}</span>
              <span
                className={`${tier.bg} size-9 shrink-0 rounded-lg flex items-center justify-center text-lg`}
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
                <p className="font-score font-bold text-primary">
                  {row.score.toLocaleString("en-US")}
                </p>
                <p className="text-xs text-muted">{row.outcomes} quests</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}