"use client";

import { useMemo, useState } from "react";
import { seedEvents } from "@/seed";
import {
  selectCountryLeaderboard,
  selectEventLeaderboard,
  selectStartupLeaderboard,
} from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import LeaderboardTabs from "./LeaderboardTabs";
import Podium from "./Podium";
import RankList from "./RankList";
import type { LeaderboardTab } from "./types";

const PODIUM_SIZE = 3;

export default function LeaderboardView() {
  const hydrated = useHasHydrated();
  const startups = useGameStore((s) => s.startups);
  const quests = useGameStore((s) => s.quests);
  const currentStartupId = useGameStore((s) => s.currentStartupId);
  const [tab, setTab] = useState<LeaderboardTab>("startups");

  const boards = useMemo(
    () => ({
      startups: selectStartupLeaderboard(startups, quests),
      countries: selectCountryLeaderboard(startups, quests),
      events: selectEventLeaderboard(seedEvents, quests),
    }),
    [startups, quests],
  );
  const rows = boards[tab];

  return (
    <section className="flex flex-col gap-8 py-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Leaderboard</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-card">
            <span className="size-2 rounded-full bg-green animate-pulse-ring" />
            Live
          </span>
        </div>
        <p className="text-muted">Top startups, countries and events by verified outcomes.</p>
      </header>

      <LeaderboardTabs active={tab} onChange={setTab} />
      <div
        role="tabpanel"
        id="leaderboard-panel"
        aria-labelledby={`tab-${tab}`}
        className="flex flex-col gap-8"
      >
        {!hydrated ? (
          <p className="py-16 text-center text-muted">Loading the leaderboard…</p>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-muted">
            No results yet. Verify a quest to get on the board.
          </p>
        ) : (
          <>
            <Podium key={tab} rows={rows} tab={tab} />
            <RankList
              key={`${tab}-list`}
              rows={rows.slice(PODIUM_SIZE)}
              tab={tab}
              highlightId={currentStartupId}
            />
          </>
        )}
      </div>
    </section>
  );
}
