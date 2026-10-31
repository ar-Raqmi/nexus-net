import { TABS, type LeaderboardTab } from "./types";

export default function LeaderboardTabs({
  active,
  onChange,
}: {
  active: LeaderboardTab;
  onChange: (tab: LeaderboardTab) => void;
}) {
  return (
    <div role="tablist" aria-label="Leaderboard type" className="seg self-start">
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
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
