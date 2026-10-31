"use client";

import Link from "next/link";
import { seedQuests, seedStartups } from "@/seed";
import { selectCountryLeaderboard, selectStartup, selectVerified } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import CountdownPill from "./CountdownPill";
import PodiumScene from "./PodiumScene";

export default function Hero() {
  const hydrated = useHasHydrated();
  const storeQuests = useGameStore((s) => s.quests);
  const storeStartups = useGameStore((s) => s.startups);
  const currentStartupId = useGameStore((s) => s.currentStartupId);

  // Render seed values until localStorage has loaded so server and client HTML match.
  const quests = hydrated ? storeQuests : seedQuests;
  const startups = hydrated ? storeStartups : seedStartups;
  const current = hydrated ? selectStartup(startups, currentStartupId) : null;

  const verified = selectVerified(quests);
  const totalXp = startups.reduce((sum, s) => sum + s.xp, 0);
  const markets = new Set(verified.map((q) => q.targetCountry)).size;
  const topCountries = selectCountryLeaderboard(startups, quests).slice(0, 3);

  const stats = [
    { label: "XP earned", value: totalXp.toLocaleString("en-US") },
    { label: "startups", value: startups.length },
    { label: "markets", value: markets },
  ];

  return (
    <section className="flex flex-col items-center text-center gap-4 pt-2 pb-8">
      <CountdownPill />

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/70">
        Startup ASEAN · Outcome Conversion
      </p>

      <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] leading-tight">
        Turn connections into outcomes
      </h1>

      <p className="max-w-[560px] text-base text-ink/70 text-balance">
        Earn XP by turning connections into investments, partnerships and cross-border POCs.
        Gemma 4 writes the quests and checks the proof.
      </p>

      <div className="flex flex-col items-center gap-1">
        <PodiumScene countries={topCountries} verified={verified.length} />
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          Live leaderboard preview
        </p>
      </div>

      {current ? (
        <Link
          href="/quests"
          className="rounded-full bg-primary px-8 py-3.5 text-white font-bold shadow-card hover:brightness-110 transition"
        >
          Continue as {current.name} →
        </Link>
      ) : (
        <a
          href="#startups"
          className="rounded-full bg-primary px-8 py-3.5 text-white font-bold shadow-card hover:brightness-110 transition"
        >
          Pick your startup ↓
        </a>
      )}

      <dl className="flex items-center divide-x divide-ink/10 rounded-full bg-white shadow-card py-2 text-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-1 whitespace-nowrap px-3 sm:px-5">
            <dd className="font-score font-bold text-primary">{stat.value}</dd>
            <dt className="text-muted">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
