import { EVENT_CATEGORIES } from "@/lib/events";
import type { EventCategory } from "@/lib/types";
import PixelIcon from "@/components/PixelIcon";

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
      <div className="seg self-start" role="group" aria-label="Event layout">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={mode === m.key}
            onClick={() => onMode(m.key)}
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
            <PixelIcon name={c.icon} size={16} className="inline-block mr-1 align-middle" />{c.label}
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
      className="chip shrink-0 whitespace-nowrap"
    >
      {children}
    </button>
  );
}
