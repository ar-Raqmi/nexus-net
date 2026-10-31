import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";
import type { Startup } from "@/lib/types";
import { selectLevelInfo } from "@/store/selectors";
import PixelIcon from "@/components/PixelIcon";

export default function StartupHeader({ startup }: { startup: Startup }) {
  const { level, next, progress } = selectLevelInfo(startup.xp);
  const tier = TIER_STYLE[level.name];

  return (
    <section className="rounded-3xl bg-white shadow-card p-6 sm:p-8 flex flex-col gap-6 md:flex-row md:items-center">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span
          className={`${tier.bg} size-16 shrink-0 rounded-2xl flex items-center justify-center`}
        >
          <Flag country={startup.country} size={26} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            {COUNTRY_NAMES[startup.country]} · {startup.sector} · {startup.stage}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl truncate">{startup.name}</h1>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-dark px-3 py-1 text-xs font-bold text-white">
            <PixelIcon name={tier.icon} size={16} /> Level {level.index} · {level.name}
          </span>
        </div>
      </div>

      <div className="md:w-80">
        <div className="flex items-end justify-between mb-2">
          <p>
            <span className="font-score text-4xl font-bold text-primary">
              {startup.xp.toLocaleString("en-US")}
            </span>{" "}
            <span className="text-sm font-semibold text-subtle">XP</span>
          </p>
          <p className="text-xs font-semibold text-muted text-right">
            {next ? (
              <>
                <span className="font-score text-ink">{next.minXp - startup.xp} XP</span> to{" "}
                {next.name}
              </>
            ) : (
              <span className="inline-flex items-center gap-1">Max level reached <PixelIcon name="party" size={16} /></span>
            )}
          </p>
        </div>
        <div className="h-4 rounded-full bg-purple/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-signature transition-[width] duration-1000 ease-out starting:w-0"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
