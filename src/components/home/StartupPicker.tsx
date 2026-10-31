"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import PixelIcon, { type PixelIconName } from "@/components/PixelIcon";
import { COUNTRY_NAMES } from "@/lib/game";
import type { Startup } from "@/lib/types";
import { seedStartups } from "@/seed";
import { selectLevelInfo } from "@/store/selectors";
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
        <h2 className="text-2xl font-bold">Pick your startup</h2>
        <p className="mt-2 text-muted">
          Demo login: choose a startup to set up its company profile. Seeded startups are fictional.
        </p>
      </div>

      <ul className="flex flex-wrap justify-center gap-6">
        {startups.map((startup, i) => (
          <li
            key={startup.id}
            className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] motion-safe:animate-fade-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
          >
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

const GRADIENTS: Record<string, string> = {
  Connected: "linear-gradient(135deg,#64748b,#94a3b8)",
  Engaged: "linear-gradient(135deg,#0ea5e9,#4f46e5)",
  POC: "linear-gradient(135deg,#7c3aed,#d946ef)",
  Partnership: "linear-gradient(135deg,#f97316,#ec4899)",
  Funded: "linear-gradient(135deg,#facc15,#84cc16)",
};

const DITHER =
  "repeating-linear-gradient(45deg,rgba(255,255,255,.18) 0 4px,transparent 4px 8px)";

// Stair-step pixel corners on the header's top edge.
const NOTCH =
  "polygon(0 8px,4px 8px,4px 4px,8px 4px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% 100%,0 100%)";

const LEVEL_ICON: Record<string, PixelIconName> = {
  Connected: "connect",
  Engaged: "meeting",
  POC: "poc",
  Partnership: "partnership",
  Funded: "funding",
};

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
  const { level, next, progress } = selectLevelInfo(startup.xp);
  const pct = Math.round(progress * 100);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const iconName = LEVEL_ICON[level.name] ?? "connect";

  return (
    <button
      type="button"
      onClick={onPlay}
      className={`group w-full h-full text-left flex flex-col bg-white border-2 border-ink shadow-[4px_4px_0_#222] transition-all duration-150 hover:-translate-y-1 hover:-rotate-[0.6deg] hover:shadow-[6px_8px_0_#222] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${
        selected ? "ring-4 ring-green shadow-[0_0_24px_4px_rgba(34,197,94,.55),4px_4px_0_#222]" : ""
      }`}
    >
      <div
        className="relative h-24 px-4 pt-3 text-white"
        style={{ backgroundImage: `${DITHER},${GRADIENTS[level.name] ?? GRADIENTS.Connected}`, clipPath: NOTCH }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 border-2 border-ink bg-white px-2 py-0.5 text-xs font-bold uppercase text-ink">
            <PixelIcon name={iconName} size={16} />
            {level.name}
          </span>
          {demoHero && (
            <span className="inline-flex items-center gap-1 border-2 border-ink bg-signature px-2 py-0.5 text-xs font-bold text-ink motion-safe:animate-shimmer">
              <PixelIcon name="star" size={14} />
              Demo hero
            </span>
          )}
        </div>
        <span className="absolute bottom-3 left-[72px] text-sm font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,.5)]">
          {COUNTRY_NAMES[startup.country]}
        </span>
      </div>

      <div className="relative -mt-8 ml-4 flex size-16 items-center justify-center rounded-2xl border-2 border-ink bg-white motion-safe:animate-pop transition-transform group-hover:scale-110 group-hover:-rotate-3">
        <CompanyLogo id={startup.id} name={startup.name} size={48} />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-2">
        <h3 className="text-xl font-bold">{startup.name}</h3>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {startup.sector} · {startup.stage}
        </p>
        <p className="text-sm text-muted line-clamp-2">{startup.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between">
            <p>
              <span className="font-pixel font-score text-3xl text-primary">
                {startup.xp.toLocaleString("en-US")}
              </span>{" "}
              <span className="text-xs font-semibold text-muted">XP</span>
            </p>
            <span
              className={`inline-flex items-center gap-1 border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0_#222] transition ${
                selected ? "bg-green text-white" : "bg-white text-ink group-hover:bg-primary group-hover:text-white"
              }`}
            >
              {selected ? (
                <>
                  <PixelIcon name="check" size={16} /> Playing
                </>
              ) : (
                "Play →"
              )}
            </span>
          </div>
          <div
            className="mt-3 h-3 border-2 border-ink bg-paper"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={next ? `Progress to ${next.name}` : "Max level"}
          >
            <div
              className="h-full bg-primary transition-[width] duration-1000 ease-out"
              style={{ width: filled ? `${pct}%` : "0%", backgroundImage: DITHER }}
            />
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase text-muted">
            {next ? `${next.minXp - startup.xp} XP to ${next.name}` : "Max level"}
          </p>
        </div>
      </div>
    </button>
  );
}
