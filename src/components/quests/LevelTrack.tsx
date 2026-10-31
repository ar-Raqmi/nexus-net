import { LEVELS, getLevel, getLevelProgress } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";

export default function LevelTrack({ xp }: { xp: number }) {
  const current = getLevel(xp);
  // Position along the whole track: each of the 4 segments is one level step.
  const position = Math.min(
    1,
    (current.index - 1 + getLevelProgress(xp)) / (LEVELS.length - 1),
  );

  return (
    <section className="rounded-3xl bg-white shadow-card px-8 pt-12 pb-6 sm:px-12">
      <div className="relative mx-4">
        {/* Track */}
        <div className="h-5 rounded-full bg-purple-dark overflow-hidden">
          <div
            className="h-full rounded-full bg-purple transition-[width] duration-700"
            style={{ width: `${position * 100}%` }}
          />
        </div>

        {/* "You" marker */}
        <div
          className="absolute -top-10 -translate-x-1/2 flex flex-col items-center transition-[left] duration-700"
          style={{ left: `${position * 100}%` }}
        >
          <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">YOU</span>
          <span className="size-0 border-x-4 border-x-transparent border-t-6 border-t-ink" />
        </div>

        {/* Hexagon nodes */}
        {LEVELS.map((level, i) => {
          const unlocked = xp >= level.minXp;
          return (
            <div
              key={level.name}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(i / (LEVELS.length - 1)) * 100}%` }}
            >
              <span
                className={`hexagon flex size-11 items-center justify-center font-score text-lg font-bold ${
                  unlocked ? "bg-yellow text-ink" : "bg-[#C9C6F5] text-purple-dark"
                } ${level.index === current.index ? "scale-125" : ""} transition-transform`}
              >
                {level.index}
              </span>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="relative mx-4 mt-8 h-10">
        {LEVELS.map((level, i) => (
          <div
            key={level.name}
            className="absolute -translate-x-1/2 text-center w-24"
            style={{ left: `${(i / (LEVELS.length - 1)) * 100}%` }}
          >
            <p
              className={`text-xs sm:text-sm font-bold ${
                level.index === current.index ? "text-primary" : "text-ink"
              }`}
            >
              <span className="hidden sm:inline">{TIER_STYLE[level.name].icon} </span>
              {level.name}
            </p>
            <p className="font-score text-[11px] text-subtle">{level.minXp} XP</p>
          </div>
        ))}
      </div>
    </section>
  );
}
