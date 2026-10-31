"use client";

import { useMemo } from "react";
import { CATEGORY_BY_KEY, klDateKey, klParts } from "@/lib/events";
import type { LumaEvent } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type CalendarView = "month" | "week";

interface DayCell {
  key: string; // YYYY-MM-DD in KL time
  day: number;
  inMonth: boolean;
  isToday: boolean;
  events: LumaEvent[];
}

/** Monday-first weekday index (0 = Monday .. 6 = Sunday). */
function mondayIndex(year: number, month: number, day: number): number {
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

function buildMonthGrid(
  year: number,
  month: number,
  events: LumaEvent[],
  todayKey: string,
): DayCell[] {
  const firstWeekday = mondayIndex(year, month, 1);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: DayCell[] = [];

  const byDay = new Map<string, LumaEvent[]>();
  for (const e of events) {
    const key = klDateKey(e.startAt);
    const list = byDay.get(key);
    if (list) list.push(e);
    else byDay.set(key, [e]);
  }

  // Leading days from the previous month.
  const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const daysInPrevMonth = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const key = `${pad(prevMonthDate.getUTCFullYear())}-${pad(prevMonthDate.getUTCMonth() + 1)}-${pad(day)}`;
    cells.push({ key, day, inMonth: false, isToday: key === todayKey, events: byDay.get(key) ?? [] });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${pad(year)}-${pad(month)}-${pad(day)}`;
    cells.push({
      key,
      day,
      inMonth: true,
      isToday: key === todayKey,
      events: byDay.get(key) ?? [],
    });
  }

  // Trailing days so the grid is a whole number of weeks.
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const nextMonthDate = new Date(Date.UTC(year, month, nextDay));
    const key = `${pad(nextMonthDate.getUTCFullYear())}-${pad(nextMonthDate.getUTCMonth() + 1)}-${pad(nextMonthDate.getUTCDate())}`;
    cells.push({
      key,
      day: nextDay,
      inMonth: false,
      isToday: key === todayKey,
      events: byDay.get(key) ?? [],
    });
    nextDay++;
  }

  return cells;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function buildWeekGrid(
  anchor: { year: number; month: number; day: number },
  events: LumaEvent[],
  todayKey: string,
): DayCell[] {
  const base = new Date(Date.UTC(anchor.year, anchor.month - 1, anchor.day));
  const start = new Date(base);
  start.setUTCDate(base.getUTCDate() - mondayIndex(anchor.year, anchor.month, anchor.day));

  const byDay = new Map<string, LumaEvent[]>();
  for (const e of events) {
    const key = klDateKey(e.startAt);
    const list = byDay.get(key);
    if (list) list.push(e);
    else byDay.set(key, [e]);
  }

  const cells: DayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = `${pad(d.getUTCFullYear())}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    cells.push({
      key,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() + 1 === anchor.month,
      isToday: key === todayKey,
      events: byDay.get(key) ?? [],
    });
  }
  return cells;
}

interface Props {
  events: LumaEvent[];
  view: CalendarView;
  cursor: { year: number; month: number };
  /** Epoch seconds for "today" in KL time. Null before client hydration. */
  now: number | null;
  onSelectEvent: (event: LumaEvent) => void;
}

export default function EventCalendar({ events, view, cursor, now, onSelectEvent }: Props) {
  const cells = useMemo(() => {
    const todayDate = now === null ? null : new Date(now * 1000);
    const today = todayDate === null ? null : klParts(todayDate);
    const todayKey = todayDate === null ? "" : klDateKey(todayDate);
    if (view === "week") {
      const anchor =
        today !== null && cursor.year === today.year && cursor.month === today.month
          ? today
          : { year: cursor.year, month: cursor.month, day: 1 };
      return buildWeekGrid(anchor, events, todayKey);
    }
    return buildMonthGrid(cursor.year, cursor.month, events, todayKey);
  }, [events, view, cursor, now]);

  const compact = view === "month";

  return (
    <div className="rounded-3xl bg-white shadow-card p-4 sm:p-6">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-bold uppercase tracking-wide text-subtle">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((cell) => (
          <div
            key={cell.key}
            className={`min-h-20 sm:min-h-24 rounded-xl border p-1.5 sm:p-2 flex flex-col gap-1 ${
              cell.isToday
                ? "border-primary bg-primary/5"
                : cell.inMonth
                  ? "border-ink/10 bg-white"
                  : "border-transparent bg-ink/[0.02]"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                cell.isToday ? "text-primary" : cell.inMonth ? "text-ink" : "text-subtle"
              }`}
            >
              {cell.day}
            </span>

            <div className="flex flex-col gap-1 overflow-hidden">
              {cell.events.slice(0, compact ? 2 : 4).map((e) => {
                const cat = CATEGORY_BY_KEY[e.category];
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelectEvent(e)}
                    title={e.name}
                    className={`w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight ${cat.className}`}
                  >
                    {e.name}
                  </button>
                );
              })}
              {cell.events.length > (compact ? 2 : 4) && (
                <span className="px-1 text-[10px] font-bold text-subtle">
                  +{cell.events.length - (compact ? 2 : 4)} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}