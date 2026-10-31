import { LEVELS, getLevel, getLevelProgress, getNextLevel } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";
import PixelIcon from "@/components/PixelIcon";

export default function LevelTrack({ xp }: { xp: number }) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  const steps = LEVELS.length - 1;
  // Position along the whole track: each of the 4 segments is one level step.
  const fill = Math.min(1, (current.index - 1 + getLevelProgress(xp)) / steps);
  const currentLeft = ((current.index - 1) / steps) * 100;

  return (
    <section className="rounded-3xl bg-white shadow-card px-4 pt-14 pb-6 sm:px-8">
      {/* The 10% inset puts the track ends under the centres of the first and last label columns. */}
      <div className="relative mx-[10%]">
        <div className="h-5 rounded-full bg-purple/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out starting:w-0"
            style={{ width: `${fill * 100}%` }}
          />
        </div>

        <div
          className="absolute -top-11 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${currentLeft}%` }}
        >
          <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-white">YOU</span>
          <span className="size-0 border-x-4 border-x-transparent border-t-6 border-t-ink" />
        </div>

        {LEVELS.map((level, i) => {
          const unlocked = xp >= level.minXp;
          return (
            <div
              key={level.name}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(i / steps) * 100}%` }}
            >
              <span
                className={`hexagon flex size-11 items-center justify-center font-score text-lg font-bold transition-transform ${
                  unlocked ? "bg-primary text-white" : "bg-[#DEDCFB] text-purple-dark"
                } ${level.index === current.index ? "scale-125" : ""}`}
              >
                {level.index}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-5 text-center">
        {LEVELS.map((level) => (
          <div key={level.name}>
            <p
              className={`text-xs sm:text-sm font-bold ${
                level.index === current.index ? "text-primary" : "text-ink"
              }`}
            >
              <PixelIcon name={TIER_STYLE[level.name].icon} size={18} className="hidden sm:inline-block align-middle mr-1" />
              {level.name}
            </p>
            <p className="font-score text-xs text-subtle">{level.minXp} XP</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center font-score text-sm font-bold text-muted">
        {next ? (
          <>
            <span className="text-primary">{xp.toLocaleString("en-US")}</span> /{" "}
            {next.minXp.toLocaleString("en-US")} XP to {next.name}
          </>
        ) : (
          <>{xp.toLocaleString("en-US")} XP · max level</>
        )}
      </p>
    </section>
  );
}
