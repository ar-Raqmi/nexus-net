import { TABS, type LeaderboardTab } from "./types";

export default function LeaderboardTabs({
  active,
  onChange,
}: {
  active: LeaderboardTab;
  onChange: (tab: LeaderboardTab) => void;
}) {
  return (
    <div role="tablist" aria-label="Leaderboard type" className="flex justify-center gap-2">
      {TABS.map(({ key, label }) => {
        const selected = key === active;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            id={`tab-${key}`}
            aria-selected={selected}
            aria-controls="leaderboard-panel"
            onClick={() => onChange(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow sm:px-6 ${
              selected ? "bg-yellow text-ink" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
