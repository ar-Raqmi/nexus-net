import { EVENT_CATEGORIES } from "@/lib/events";
import type { EventCategory } from "@/lib/types";

export type Filter = "all" | EventCategory;
export type Mode = "month" | "week" | "list";

const MODES: { key: Mode; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "list", label: "List" },
];

interface Props {
  filter: Filter;
  mode: Mode;
  onFilter: (filter: Filter) => void;
  onMode: (mode: Mode) => void;
}

export default function EventControls({ filter, mode, onFilter, onMode }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="inline-flex self-start rounded-full bg-white p-1 shadow-card" role="group" aria-label="Event layout">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={mode === m.key}
            onClick={() => onMode(m.key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              mode === m.key ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        className="-mx-4 flex min-w-0 flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="group"
        aria-label="Filter by category"
      >
        <FilterChip active={filter === "all"} onClick={() => onFilter("all")}>
          All
        </FilterChip>
        {EVENT_CATEGORIES.map((c) => (
          <FilterChip key={c.key} active={filter === c.key} onClick={() => onFilter(c.key)}>
            {c.icon} {c.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? "bg-primary text-white" : "bg-white shadow-card text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
