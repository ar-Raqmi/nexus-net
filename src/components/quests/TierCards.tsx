import { LEVELS, getLevel } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";

const TIER_BLURB: Record<string, string> = {
  Connected: "You're in the network.",
  Engaged: "Real meetings are happening.",
  POC: "Running a cross-border pilot.",
  Partnership: "Signed commercial deals.",
  Funded: "Investment closed.",
};

export default function TierCards({ xp }: { xp: number }) {
  const current = getLevel(xp);

  return (
    <details className="group rounded-3xl bg-white shadow-card px-4 py-3 sm:px-6">
      <summary className="flex cursor-pointer list-none items-center justify-between py-1 font-bold [&::-webkit-details-marker]:hidden">
        All levels
        <span aria-hidden className="text-primary transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ul className="mt-4 mb-2 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {LEVELS.map((level) => {
          const tier = TIER_STYLE[level.name];
          const unlocked = xp >= level.minXp;
          const isCurrent = level.index === current.index;
          return (
            <li
              key={level.name}
              className={`relative w-44 shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-card lg:w-auto ${
                isCurrent ? "ring-4 ring-primary" : ""
              }`}
            >
              <span
                className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  unlocked ? "bg-green text-white" : "bg-ink/70 text-white"
                }`}
              >
                {unlocked ? "Unlocked" : "🔒 Locked"}
              </span>
              <div
                className={`${tier.bg} h-20 flex items-center justify-center text-4xl ${
                  unlocked ? "" : "opacity-50"
                }`}
              >
                <span aria-hidden>{tier.icon}</span>
              </div>
              <div className="p-4 flex flex-col items-center text-center gap-2">
                <h3 className="font-bold">{level.name}</h3>
                <p className="text-xs text-muted min-h-8">{TIER_BLURB[level.name]}</p>
                <span className="rounded-full bg-purple/10 px-3 py-1 font-score text-xs font-bold text-purple-dark">
                  {level.minXp === 0 ? "Start" : `${level.minXp.toLocaleString("en-US")} XP`}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
