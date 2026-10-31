"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_BY_KEY,
  addDays,
  daysInMonth,
  formatEventTime,
  groupEventsByDay,
  klDateKey,
  mondayIndex,
  partsKey,
  type DateParts,
} from "@/lib/events";
import type { LumaEvent } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export type CalendarView = "month" | "week";

interface DayCell {
  key: string; // YYYY-MM-DD in KL time
  parts: DateParts;
  inMonth: boolean;
  isToday: boolean;
  events: LumaEvent[];
}

function buildCells(
  start: DateParts,
  count: number,
  month: number,
  byDay: Map<string, LumaEvent[]>,
  todayKey: string,
): DayCell[] {
  return Array.from({ length: count }, (_, i) => {
    const parts = addDays(start, i);
    const key = partsKey(parts);
    return {
      key,
      parts,
      inMonth: parts.month === month,
      isToday: key === todayKey,
      events: byDay.get(key) ?? [],
    };
  });
}

function dayLabel(cell: DayCell): string {
  const n = cell.events.length;
  const date = DAY_LABEL.format(new Date(Date.UTC(cell.parts.year, cell.parts.month - 1, cell.parts.day)));
  return `${date}, ${n === 0 ? "no events" : `${n} event${n === 1 ? "" : "s"}`}`;
}

interface Props {
  events: LumaEvent[];
  view: CalendarView;
  /** Any date inside the month / week being shown. */
  anchor: DateParts;
  title: string;
  /** Epoch seconds for "today" in KL time. Null before client hydration. */
  now: number | null;
  /** Nearest upcoming event outside the visible range, offered when the range is empty. */
  jump: { label: string; onJump: () => void } | null;
  onNavigate: (delta: -1 | 1) => void;
  onSelectEvent: (event: LumaEvent) => void;
}

export default function EventCalendar({
  events,
  view,
  anchor,
  title,
  now,
  jump,
  onNavigate,
  onSelectEvent,
}: Props) {
  const [pickedKey, setPickedKey] = useState<string | null>(null);

  const cells = useMemo(() => {
    const todayKey = now === null ? "" : klDateKey(new Date(now * 1000));
    const byDay = groupEventsByDay(events);
    if (view === "week") {
      return buildCells(addDays(anchor, -mondayIndex(anchor)), 7, anchor.month, byDay, todayKey);
    }
    const first = { year: anchor.year, month: anchor.month, day: 1 };
    const span = mondayIndex(first) + daysInMonth(anchor.year, anchor.month);
    return buildCells(addDays(first, -mondayIndex(first)), Math.ceil(span / 7) * 7, anchor.month, byDay, todayKey);
  }, [events, view, anchor, now]);

  const visibleEvents = cells.reduce((sum, c) => sum + (c.inMonth || view === "week" ? c.events.length : 0), 0);
  const perCell = view === "month" ? 2 : 4;

  // A picked day only counts while it is on screen; otherwise fall back to the
  // first day with events so the mobile agenda is never blank.
  const pickedCell = cells.find((c) => c.key === pickedKey);
  const agendaCell = pickedCell ?? cells.find((c) => c.events.length > 0);

  return (
    <div className="rounded-3xl bg-white shadow-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <NavButton label={`Previous ${view}`} onClick={() => onNavigate(-1)}>
          ← Prev
        </NavButton>
        <h2 className="text-lg font-bold text-center">{title}</h2>
        <NavButton label={`Next ${view}`} onClick={() => onNavigate(1)}>
          Next →
        </NavButton>
      </div>

      {visibleEvents === 0 && (
        <p className="mb-4 rounded-2xl bg-ink/5 px-4 py-3 text-sm text-muted flex flex-wrap items-center justify-between gap-2">
          <span>No events in {title}.</span>
          {jump && (
            <button
              type="button"
              onClick={jump.onJump}
              className="btn btn-primary btn-sm"
            >
              Jump to {jump.label}
            </button>
          )}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-bold uppercase tracking-wide text-muted">
            <span className="sm:hidden" aria-hidden="true">{w[0]}</span>
            <span className="hidden sm:inline">{w}</span>
            <span className="sr-only sm:hidden">{w}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((cell) => {
          const hasEvents = cell.events.length > 0;
          const hidden = cell.events.length - perCell;
          return (
            <div
              key={cell.key}
              role="group"
              aria-label={dayLabel(cell)}
              aria-current={cell.isToday ? "date" : undefined}
              className={`relative min-h-14 sm:min-h-32 min-w-0 rounded-xl border p-1 sm:p-2 flex flex-col items-center sm:items-stretch gap-1 ${
                cell.isToday
                  ? "border-primary"
                  : cell.inMonth
                    ? "border-ink/10"
                    : "border-transparent"
              } ${hasEvents ? "bg-primary/5" : cell.inMonth ? "bg-white" : "bg-ink/[0.02]"} ${
                agendaCell?.key === cell.key ? "ring-2 ring-primary/40" : ""
              }`}
            >
              <span className="flex items-center justify-center gap-1 sm:justify-start">
                <span
                  className={`text-xs font-bold ${
                    cell.isToday
                      ? "rounded-full bg-primary px-1.5 py-0.5 text-white"
                      : cell.inMonth
                        ? "text-ink"
                        : "text-muted"
                  }`}
                >
                  {cell.parts.day}
                </span>
                {hasEvents && <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-primary sm:block" />}
              </span>

              {/* <sm: one coloured dot per event; tapping the cell opens the agenda below. */}
              {hasEvents && (
                <>
                  <span aria-hidden="true" className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                    {cell.events.slice(0, 4).map((e) => (
                      <span key={e.id} className={`size-2 rounded-full ${CATEGORY_BY_KEY[e.category].dot}`} />
                    ))}
                  </span>
                  <button
                    type="button"
                    aria-label={`Show agenda for ${dayLabel(cell)}`}
                    onClick={() => setPickedKey(cell.key)}
                    className="absolute inset-0 rounded-xl sm:hidden"
                  />
                </>
              )}

              <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                {cell.events.slice(0, perCell).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelectEvent(e)}
                    title={e.name}
                    className={`min-h-7 w-full truncate rounded-md px-1.5 py-1 text-left text-xs font-semibold leading-tight ${CATEGORY_BY_KEY[e.category].className}`}
                  >
                    {e.name}
                  </button>
                ))}
                {hidden > 0 && (
                  <button
                    type="button"
                    onClick={() => setPickedKey(cell.key)}
                    className="min-h-7 rounded-md px-1 py-1 text-left text-xs font-bold text-primary hover:bg-primary/10"
                  >
                    +{hidden} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {agendaCell && (
        <DayAgenda
          cell={agendaCell}
          explicit={pickedCell !== undefined}
          onSelectEvent={onSelectEvent}
        />
      )}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="btn btn-sm"
    >
      {children}
    </button>
  );
}

/** Day list shown under the grid: the only way to read events on <sm, and the target of "+N more". */
function DayAgenda({
  cell,
  explicit,
  onSelectEvent,
}: {
  cell: DayCell;
  explicit: boolean;
  onSelectEvent: (event: LumaEvent) => void;
}) {
  return (
    <section
      aria-label={`Agenda for ${dayLabel(cell)}`}
      className={`mt-4 rounded-2xl bg-paper p-4 ${explicit ? "" : "sm:hidden"}`}
    >
      <h3 className="text-sm font-bold text-ink">{dayLabel(cell)}</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {cell.events.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onSelectEvent(e)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl bg-white px-3 py-2 text-left shadow-card"
            >
              <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${CATEGORY_BY_KEY[e.category].dot}`} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{e.name}</span>
              <span className="shrink-0 text-xs font-bold text-muted">{formatEventTime(e.startAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
