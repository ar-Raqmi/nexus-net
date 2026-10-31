"use client";

import { useMemo } from "react";
import { seedEvents, seedQuests, seedStartups } from "@/seed";
import {
  selectConversionRate,
  selectEventLeaderboard,
  selectFunnel,
  selectOutcomesByCountry,
  selectVerified,
} from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import CountryChart from "./CountryChart";
import EventTable from "./EventTable";
import Funnel from "./Funnel";
import KpiRow from "./KpiRow";

export default function CradleView() {
  const hydrated = useHasHydrated();
  const storeQuests = useGameStore((s) => s.quests);
  const storeStartups = useGameStore((s) => s.startups);
  // Seed data on the first render so SSR and hydration agree.
  const quests = hydrated ? storeQuests : seedQuests;
  const startups = hydrated ? storeStartups : seedStartups;

  const stats = useMemo(() => {
    const verified = selectVerified(quests);
    const byCountry = selectOutcomesByCountry(quests);
    return {
      funnel: selectFunnel(quests),
      conversion: selectConversionRate(quests),
      byCountry,
      events: selectEventLeaderboard(seedEvents, quests),
      outcomes: verified.length,
      active: new Set(verified.map((q) => q.startupId)).size,
      countries: byCountry.filter((c) => c.outcomes > 0).length,
    };
  }, [quests]);

  return (
    <div className="flex flex-col gap-6">
      <KpiRow
        conversion={stats.conversion}
        outcomes={stats.outcomes}
        startups={stats.active || startups.length}
        countries={stats.countries}
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Funnel stages={stats.funnel} />
        <CountryChart data={stats.byCountry} />
      </div>
      <EventTable rows={stats.events} events={seedEvents} />
    </div>
  );
}
