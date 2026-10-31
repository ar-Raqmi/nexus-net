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
  return (
    <ol className="flex flex-col gap-3">
      {rows.map((row, i) => {
        const rank = i + FIRST_LIST_RANK;
        const isYou = tab === "startups" && row.id === highlightId;
        return (
          <li
            key={row.id}
            style={{ animationDelay: `${Math.min(i * 60 + 300, 600)}ms` }}
            className={`animate-fade-up flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-card motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:gap-4 ${
              isYou ? "ring-4 ring-yellow" : ""
            }`}
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-pixel text-3xl text-white ${
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
                  <span className="shrink-0 rounded-full bg-yellow px-2 py-0.5 text-xs font-bold">You</span>
                )}
              </p>
              <p className="truncate text-sm text-muted">{row.subtitle}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Score value={row.score} className="text-xl text-primary sm:text-3xl" />
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-muted">
                {row.outcomes} outcomes
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
