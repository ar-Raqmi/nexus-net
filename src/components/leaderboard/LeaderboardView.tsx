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
    <div className="flex flex-col gap-8">
      <header className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl">Leaderboard</h1>
        <p className="mt-2 text-muted">Top startups, countries and events by verified outcomes.</p>
      </header>

      <section className="bg-grid-dark flex flex-col gap-8 rounded-[32px] p-4 sm:p-8">
        <LeaderboardTabs active={tab} onChange={setTab} />
        <div
          role="tabpanel"
          id="leaderboard-panel"
          aria-labelledby={`tab-${tab}`}
          className="flex flex-col gap-8"
        >
          {!hydrated ? (
            <p className="py-16 text-center text-white/70">Loading the leaderboard…</p>
          ) : rows.length === 0 ? (
            <p className="py-16 text-center text-white/70">
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
    </div>
  );
}
