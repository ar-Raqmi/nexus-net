import PixelIcon from "@/components/PixelIcon";
import type { LeaderboardRow } from "@/store/selectors";
import RowAvatar from "./RowAvatar";
import Score from "./Score";
import type { LeaderboardTab } from "./types";

// Solid colours only. DOM order is 1,2,3 (mobile stack); md+ reorders to 2,1,3.
const SLOTS = [
  { rank: 1, bg: "bg-[#FFDD56]", order: "md:order-2", height: "md:min-h-72" },
  { rank: 2, bg: "bg-[#FFB2B3]", order: "md:order-1", height: "md:min-h-60" },
  { rank: 3, bg: "bg-[#A9BBFF]", order: "md:order-3", height: "md:min-h-48" },
] as const;

export default function Podium({ rows, tab }: { rows: LeaderboardRow[]; tab: LeaderboardTab }) {
  return (
    <ol className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3 md:items-end md:gap-6">
      {SLOTS.map(({ rank, bg, order, height }) => {
        const row = rows[rank - 1];
        if (!row) return <li key={rank} aria-hidden className={`hidden ${order}`} />;
        return (
          <li key={row.id} className={`relative min-w-0 ${order}`}>
            <div
              style={{ animationDelay: `${Math.min((rank - 1) * 120, 400)}ms` }}
              className={`motion-safe:animate-fade-up ${bg} ${height} flex flex-col items-center justify-between gap-3 rounded-2xl border-2 border-ink p-4 text-center text-ink shadow-[4px_4px_0_#222]`}
            >
              <div className="flex flex-col items-center gap-1">
                {rank === 1 && (
                  <span className="grid place-items-center rounded-md bg-ink p-1 text-white motion-safe:animate-bob">
                    <PixelIcon name="crown" size={32} />
                  </span>
                )}
                <span className="rounded-md bg-ink px-2.5 py-0.5 font-pixel text-xl tracking-wide text-white">
                  TOP{rank}
                </span>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <RowAvatar tab={tab} id={row.id} name={row.name} size={rank === 1 ? 40 : 32} />
                <span className="line-clamp-3 break-words font-display text-base leading-tight sm:text-lg">
                  {row.name}
                </span>
                <span className="text-xs font-medium text-ink">{row.outcomes} outcomes</span>
              </div>
              <Score value={row.score} className="text-3xl text-ink" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
