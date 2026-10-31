"use client";

import { useRouter } from "next/navigation";
import { COUNTRY_FLAGS, COUNTRY_NAMES, getLevel } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";
import type { Startup } from "@/lib/types";
import { seedStartups } from "@/seed";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

const DEMO_HERO_ID = "paylah-lite";

export default function StartupPicker() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const storeStartups = useGameStore((s) => s.startups);
  const currentStartupId = useGameStore((s) => s.currentStartupId);
  const login = useGameStore((s) => s.login);

  const startups = hydrated ? storeStartups : seedStartups;
  const selectedId = hydrated ? currentStartupId : null;

  function play(startup: Startup) {
    login(startup.id);
    router.push("/profile");
  }

  return (
    <section id="startups" className="scroll-mt-20 py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold">Pick your startup</h2>
        <p className="mt-2 text-muted">
          Demo login: choose a startup to set up its company profile. Seeded startups are fictional.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {startups.map((startup) => (
          <li key={startup.id}>
            <StartupCard
              startup={startup}
              selected={startup.id === selectedId}
              demoHero={startup.id === DEMO_HERO_ID}
              onPlay={() => play(startup)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function StartupCard({
  startup,
  selected,
  demoHero,
  onPlay,
}: {
  startup: Startup;
  selected: boolean;
  demoHero: boolean;
  onPlay: () => void;
}) {
  const level = getLevel(startup.xp);
  const tier = TIER_STYLE[level.name];

  return (
    <button
      type="button"
      onClick={onPlay}
      className={`group w-full h-full text-left flex flex-col rounded-3xl bg-white shadow-card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
        selected ? "ring-4 ring-primary" : ""
      }`}
    >
      <div className={`${tier.bg} relative h-24 px-5 flex items-center gap-3`}>
        <span className="text-4xl" aria-hidden>
          {COUNTRY_FLAGS[startup.country]}
        </span>
        <span className="text-sm font-semibold text-ink/70">
          {COUNTRY_NAMES[startup.country]}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs font-bold">
          {tier.icon} {level.name}
        </span>
        {demoHero && (
          <span className="absolute bottom-3 right-3 bg-signature rounded-full px-3 py-0.5 text-xs font-bold">
            Demo hero
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-xl font-bold">{startup.name}</h3>
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {startup.sector} · {startup.stage}
        </p>
        <p className="text-sm text-muted line-clamp-2">{startup.description}</p>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <p>
            <span className="font-score text-3xl font-bold text-primary">
              {startup.xp.toLocaleString("en-US")}
            </span>{" "}
            <span className="text-xs font-semibold text-subtle">XP</span>
          </p>
          <span
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              selected
                ? "bg-green text-white"
                : "bg-ink text-white group-hover:bg-primary"
            }`}
          >
            {selected ? "Playing ✓" : "Play →"}
          </span>
        </div>
      </div>
    </button>
  );
}
