import type { LeaderboardRow } from "@/store/selectors";
import RowAvatar from "./RowAvatar";
import Score from "./Score";
import type { LeaderboardTab } from "./types";

const FIRST_LIST_RANK = 4;

export default function RankList({
  rows,
  tab,
  highlightId,
}: {
  rows: LeaderboardRow[];
  tab: LeaderboardTab;
  highlightId: string | null;
}) {
  if (rows.length === 0) return null;
  return (
    <ol className="divide-y divide-ink/10 overflow-hidden rounded-2xl border-2 border-ink bg-white">
      {rows.map((row, i) => {
        const rank = i + FIRST_LIST_RANK;
        const isYou = tab === "startups" && row.id === highlightId;
        return (
          <li
            key={row.id}
            style={{ animationDelay: `${Math.min(i * 40 + 200, 400)}ms` }}
            className={`motion-safe:animate-fade-up flex items-center gap-3 p-3 pr-4 transition-colors hover:bg-paper sm:gap-4 ${
              isYou ? "bg-yellow/20" : ""
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-pixel text-2xl text-white ${
                i % 2 === 0 ? "bg-purple" : "bg-green"
              }`}
            >
              {rank}
            </span>
            <RowAvatar tab={tab} id={row.id} name={row.name} size={20} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-bold text-ink">
                <span className="truncate">{row.name}</span>
                {isYou && (
                  <span className="shrink-0 rounded-md border border-ink bg-yellow px-2 py-0.5 text-xs font-bold">You</span>
                )}
              </p>
              <p className="truncate text-sm text-muted">{row.subtitle}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Score value={row.score} className="text-xl text-primary sm:text-2xl" />
              <span className="rounded-md border border-ink/10 bg-paper px-2 py-0.5 text-xs font-medium text-muted">
                {row.outcomes} outcomes
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
