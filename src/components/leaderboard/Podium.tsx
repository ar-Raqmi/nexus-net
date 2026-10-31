import type { LeaderboardRow } from "@/store/selectors";
import { CrownIcon } from "./icons";
import RowAvatar from "./RowAvatar";
import Score from "./Score";
import type { LeaderboardTab } from "./types";

const SLOTS = [
  { rank: 2, tier: "tier-red", height: "min-h-40 sm:min-h-48", tilt: "-rotate-3" },
  { rank: 1, tier: "tier-yellow", height: "min-h-52 sm:min-h-64", tilt: "" },
  { rank: 3, tier: "tier-blue", height: "min-h-36 sm:min-h-44", tilt: "rotate-3" },
] as const;

export default function Podium({ rows, tab }: { rows: LeaderboardRow[]; tab: LeaderboardTab }) {
  return (
    <ol className="grid grid-cols-3 items-end gap-2 sm:gap-5 pt-8">
      {SLOTS.map(({ rank, tier, height, tilt }, i) => {
        const row = rows[rank - 1];
        if (!row) return <li key={rank} aria-hidden />;
        return (
          <li
            key={row.id}
            style={{ transitionDelay: `${i * 90}ms` }}
            className="relative min-w-0 transition duration-500 starting:translate-y-6 starting:opacity-0 motion-reduce:transition-none"
          >
            {rank === 1 && (
              <CrownIcon className="absolute -top-8 left-1/2 h-8 w-10 -translate-x-1/2 sm:-top-10 sm:h-10 sm:w-12" />
            )}
            <div
              className={`${tier} ${height} ${tilt} flex flex-col items-center justify-between gap-2 rounded-2xl p-2.5 text-center text-ink shadow-card sm:rounded-3xl sm:p-4`}
            >
              <span className="rounded-full bg-ink px-2.5 py-0.5 font-pixel text-base tracking-wide text-white sm:text-xl">
                TOP{rank}
              </span>
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <RowAvatar tab={tab} id={row.id} size={18} />
                <span className="line-clamp-3 break-words font-display text-xs leading-tight sm:text-base">
                  {row.name}
                </span>
                <span className="text-xs font-medium text-ink/70">{row.outcomes} outcomes</span>
              </div>
              <Score value={row.score} className="text-base text-primary sm:text-2xl" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
