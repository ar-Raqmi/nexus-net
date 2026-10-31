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
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {LEVELS.map((level) => {
        const tier = TIER_STYLE[level.name];
        const unlocked = xp >= level.minXp;
        const isCurrent = level.index === current.index;
        return (
          <li
            key={level.name}
            className={`relative rounded-3xl bg-white shadow-card overflow-hidden transition ${
              isCurrent ? "ring-4 ring-primary" : ""
            } ${unlocked ? "" : "opacity-60 grayscale-[40%]"}`}
          >
            <span
              className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                unlocked ? "bg-green text-white" : "bg-ink/70 text-white"
              }`}
            >
              {unlocked ? "Unlocked" : "🔒 Locked"}
            </span>
            <div className={`${tier.bg} h-24 flex items-center justify-center text-5xl`}>
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
  );
}
