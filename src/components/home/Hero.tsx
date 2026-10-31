"use client";

import Link from "next/link";
import { seedQuests, seedStartups } from "@/seed";
import { selectCountryLeaderboard, selectStartup, selectVerified } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import CountdownPill from "./CountdownPill";
import PodiumScene from "./PodiumScene";

// Scattered decorative icons around the hero (hidden on small screens).
const FLOATERS = [
  { icon: "🪙", className: "left-[6%] top-[18%] -rotate-12" },
  { icon: "🚀", className: "right-[8%] top-[14%] rotate-12" },
  { icon: "🤝", className: "left-[4%] top-[40%] rotate-6" },
  { icon: "💎", className: "right-[4%] top-[44%] -rotate-6" },
  { icon: "⭐", className: "left-[24%] top-[6%] rotate-3" },
  { icon: "🏆", className: "right-[26%] top-[4%] -rotate-3" },
];

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
  const countries = new Set(verified.map((q) => q.targetCountry)).size;
  const topCountries = selectCountryLeaderboard(startups, quests).slice(0, 3);

  return (
    <section className="relative overflow-hidden flex flex-col items-center text-center gap-5 py-12 sm:py-16">
      {FLOATERS.map((f) => (
        <span
          key={f.icon}
          aria-hidden
          className={`absolute hidden md:flex size-14 items-center justify-center rounded-2xl bg-white shadow-card text-3xl ${f.className}`}
        >
          {f.icon}
        </span>
      ))}

      <CountdownPill />

      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        Startup ASEAN · Outcome Conversion
      </p>

      <div className="flex flex-col items-center">
        <span className="font-pixel text-[8rem] sm:text-[11rem] leading-[0.8] text-ink">
          {verified.length.toLocaleString("en-US")}
        </span>
        <span className="mt-3 text-lg font-semibold">
          cross-border outcomes{" "}
          <span className="bg-signature rounded-full px-3 py-0.5">verified</span>
        </span>
      </div>

      <p className="max-w-xl text-muted">
        Turn ecosystem connections into real investments, partnerships and POCs.
        Build a trusted company profile, discover cross-border opportunities, and turn connections into measurable outcomes.
      </p>

      {current ? (
        <Link
          href="/profile"
          className="rounded-full bg-primary px-8 py-3.5 text-white font-bold shadow-card hover:brightness-110 transition"
        >
          Continue as {current.name} →
        </Link>
      ) : (
        <Link
          href="/register"
          className="rounded-full bg-primary px-8 py-3.5 text-white font-bold shadow-card hover:brightness-110 transition"
        >
          Register your company →
        </Link>
      )}

      <PodiumScene countries={topCountries} verified={verified.length} />

      <dl className="mt-4 flex flex-wrap justify-center gap-3">
        {[
          { label: "XP earned", value: totalXp.toLocaleString("en-US") },
          { label: "Startups", value: startups.length },
          { label: "Markets reached", value: countries },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white shadow-card px-5 py-3 min-w-32">
            <dd className="font-score text-2xl font-bold text-primary">{stat.value}</dd>
            <dt className="text-xs text-subtle">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
