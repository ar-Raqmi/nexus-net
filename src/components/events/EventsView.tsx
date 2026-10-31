"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { COUNTRY_FLAGS, COUNTRY_NAMES } from "@/lib/game";
import {
  CATEGORY_BY_KEY,
  EVENT_CATEGORIES,
  EVENT_RELEVANT_XP,
  EVENT_SUBSCRIBE_XP,
  isEventRelevant,
  klParts,
  selectRelevantEvents,
} from "@/lib/events";
import type { EventCategory, LumaEvent } from "@/lib/types";
import { seedStartups } from "@/seed";
import { selectCreditedEvents, selectStartup, selectSubscriptions } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import EventCalendar, { type CalendarView } from "./EventCalendar";
import EventCard from "./EventCard";

type Filter = "all" | EventCategory;

interface FetchState {
  events: LumaEvent[];
  loading: boolean;
  error: string | null;
}

// Server snapshot is null so SSR and the first client render agree; the client
// snapshot gives the current epoch seconds for upcoming/past classification.
function subscribeNow(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
function getNow() {
  return Math.floor(Date.now() / 1000);
}

export default function EventsView() {
  const hydrated = useHasHydrated();
  const storeStartups = useGameStore((s) => s.startups);
  const currentStartupId = useGameStore((s) => s.currentStartupId);
  const subscriptions = useGameStore((s) => s.subscriptions);
  const creditedEventsMap = useGameStore((s) => s.creditedEvents);
  const subscribeToEvent = useGameStore((s) => s.subscribeToEvent);
  const unsubscribeFromEvent = useGameStore((s) => s.unsubscribeFromEvent);

  const startups = hydrated ? storeStartups : seedStartups;
  const startup = selectStartup(startups, currentStartupId);
  const subscribedIds = selectSubscriptions(subscriptions, currentStartupId);
  const creditedIds = selectCreditedEvents(creditedEventsMap, currentStartupId);

  const [{ events, loading, error }, setState] = useState<FetchState>({
    events: [],
    loading: true,
    error: null,
  });

  const [layout, setLayout] = useState<"list" | "calendar">("calendar");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<LumaEvent | null>(null);
  const [showPast, setShowPast] = useState(false);

  // Captured from the client clock without an impure call during render. Null on
  // the server / first render, so prerender never evaluates the current time.
  const now = useSyncExternalStore(subscribeNow, getNow, () => null);

  // User's month navigation, relative to the current month.
  const [monthOffset, setMonthOffset] = useState(0);

  // Fetching is done with promise callbacks so no setState runs during the
  // effect's synchronous body (React's set-state-in-effect guidance).
  const load = useCallback((signal?: AbortSignal) => {
    return fetch("/api/events", { signal })
      .then((res) =>
        res.json().then((data: { events?: LumaEvent[]; error?: string }) => {
          if (!res.ok) throw new Error(data.error ?? "Could not load events.");
          return data;
        }),
      )
      .then((data) => {
        setState({ events: data.events ?? [], loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          events: [],
          loading: false,
          error: err instanceof Error ? err.message : "Could not load events.",
        });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    void load();
  }, [load]);

  // Transient confirmation shown after subscribing / unsubscribing.
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (toast === null) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const toggleSubscribe = useCallback(
    (event: LumaEvent) => {
      if (!startup) return;
      const subscribed = subscribedIds.includes(event.id);
      if (subscribed) {
        unsubscribeFromEvent(startup.id, event.id);
        setToast(`Unsubscribed from ${event.name}.`);
        return;
      }
      const isRelevant = isEventRelevant(event, startup);
      const xp = isRelevant ? EVENT_RELEVANT_XP : EVENT_SUBSCRIBE_XP;
      subscribeToEvent(startup.id, event.id, xp);
      setToast(
        isRelevant
          ? `+${xp} XP · relevant to ${startup.sector}! Subscribed to ${event.name}.`
          : `+${xp} XP · subscribed to ${event.name}.`,
      );
    },
    [startup, subscribedIds, subscribeToEvent, unsubscribeFromEvent],
  );

  const cardProps = useCallback(
    (event: LumaEvent) => ({
      event,
      subscribed: subscribedIds.includes(event.id),
      relevant: isEventRelevant(event, startup),
      canSubscribe: hydrated && startup !== null,
      onToggleSubscribe: toggleSubscribe,
    }),
    [subscribedIds, startup, hydrated, toggleSubscribe],
  );

  // Current month (in the client clock) plus the user's navigation offset.
  const activeCursor = useMemo(() => {
    const base = now === null ? { year: 2026, month: 1 } : klParts(new Date(now * 1000));
    const d = new Date(Date.UTC(base.year, base.month - 1 + monthOffset, 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  }, [now, monthOffset]);

  const relevant = useMemo(() => selectRelevantEvents(events, startup), [events, startup]);

  // XP earned from event subscriptions (recomputed from loaded events).
  const boosterXp = useMemo(() => {
    return creditedIds.reduce((sum, id) => {
      const event = events.find((e) => e.id === id);
      if (!event) return sum;
      return sum + (isEventRelevant(event, startup) ? EVENT_RELEVANT_XP : EVENT_SUBSCRIBE_XP);
    }, 0);
  }, [creditedIds, events, startup]);

  const upcoming = useMemo(() => {
    if (now === null) return [];
    return events
      .filter((e) => new Date(e.startAt).getTime() / 1000 >= now)
      .filter((e) => filter === "all" || e.category === filter)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [events, filter, now]);

  const past = useMemo(() => {
    if (now === null) return [];
    return events
      .filter((e) => new Date(e.startAt).getTime() / 1000 < now)
      .filter((e) => filter === "all" || e.category === filter)
      .sort((a, b) => b.startAt.localeCompare(a.startAt));
  }, [events, filter, now]);

  const monthEvents = useMemo(() => {
    return events.filter((e) => filter === "all" || e.category === filter);
  }, [events, filter]);

  const monthLabel = new Intl.DateTimeFormat("en-MY", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(activeCursor.year, activeCursor.month - 1, 1)));

  function shiftMonth(delta: number) {
    setMonthOffset((o) => o + delta);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          Ecosystem events · Kuala Lumpur
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold">Event calendar</h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted">
          Browse networking, workshops and startup events happening around you. We pull the
          latest public events from Luma and surface the ones that match your startup.
        </p>
      </header>

      {/* Startup context + relevance explainer */}
      {hydrated && startup ? (
        <section className="rounded-3xl bg-white shadow-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Browsing as
            </p>
            <p className="text-xl font-bold">
              {COUNTRY_FLAGS[startup.country]} {startup.name}{" "}
              <span className="text-sm font-semibold text-muted">
                · {startup.sector} · {COUNTRY_NAMES[startup.country]}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted">
              XP Booster: subscribe to an event calendar for{" "}
              <span className="font-bold text-ink">+{EVENT_SUBSCRIBE_XP} XP</span>, or{" "}
              <span className="font-bold text-primary">+{EVENT_RELEVANT_XP} XP</span> when it
              matches your sector.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-ink/5 px-5 py-3 text-center">
              <p className="font-score text-2xl font-bold text-primary">
                {subscribedIds.length}
              </p>
              <p className="text-xs font-semibold text-subtle">subscribed</p>
            </div>
            <div className="rounded-2xl bg-signature px-5 py-3 text-center">
              <p className="font-score text-2xl font-bold text-ink">
                +{boosterXp}
              </p>
              <p className="text-xs font-bold text-ink/70">booster XP</p>
            </div>
            <Link
              href="/quests"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
            >
              Quests →
            </Link>
          </div>
        </section>
      ) : hydrated ? (
        <section className="rounded-3xl border-2 border-dashed border-ink/10 bg-white/60 p-6 text-center">
          <p className="text-muted">
            Pick a startup on the{" "}
            <Link href="/#startups" className="font-bold text-primary">
              home page
            </Link>{" "}
            to see events matched to your sector.
          </p>
        </section>
      ) : null}

      {/* Relevant to you */}
      {relevant.length > 0 && (
        <section>
          <SectionTitle
            title="Relevant to you"
            subtitle={`Picked for ${startup?.name} based on sector, stage and keywords.`}
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relevant.map((event) => (
              <li key={event.id}>
                <EventCard {...cardProps(event)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All Events
          </FilterChip>
          {EVENT_CATEGORIES.map((c) => (
            <FilterChip key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)}>
              {c.icon} {c.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex rounded-full bg-white shadow-card p-1">
            <ToggleButton active={layout === "calendar"} onClick={() => setLayout("calendar")}>
              📅 Calendar
            </ToggleButton>
            <ToggleButton active={layout === "list"} onClick={() => setLayout("list")}>
              ☰ List
            </ToggleButton>
          </div>
          {layout === "calendar" && (
            <div className="flex rounded-full bg-white shadow-card p-1">
              <ToggleButton active={calendarView === "week"} onClick={() => setCalendarView("week")}>
                Week
              </ToggleButton>
              <ToggleButton active={calendarView === "month"} onClick={() => setCalendarView("month")}>
                Month
              </ToggleButton>
            </div>
          )}
        </div>
      </div>

      {loading && <p className="py-12 text-center text-subtle">Loading events from Luma…</p>}

      {error && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-ink/10 bg-white/60 p-8 text-center">
          <p className="font-semibold text-ink">We couldn&apos;t load events right now.</p>
          <p className="mt-1 text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {layout === "calendar" ? (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="rounded-full bg-white shadow-card px-4 py-2 text-sm font-bold hover:bg-ink hover:text-white"
                >
                  ← Prev
                </button>
                <h2 className="text-lg font-bold">{monthLabel}</h2>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="rounded-full bg-white shadow-card px-4 py-2 text-sm font-bold hover:bg-ink hover:text-white"
                >
                  Next →
                </button>
              </div>
              <EventCalendar
                events={monthEvents}
                view={calendarView}
                cursor={activeCursor}
                now={now}
                onSelectEvent={setSelected}
              />
            </section>
          ) : (
            <section>
              <SectionTitle
                title="Upcoming events"
                subtitle={`${upcoming.length} event${upcoming.length === 1 ? "" : "s"} ahead in Kuala Lumpur.`}
              />
              {upcoming.length === 0 ? (
                <p className="text-center text-subtle">No upcoming events match your filter.</p>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event) => (
                    <li key={event.id}>
                      <EventCard {...cardProps(event)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Past events (collapsible) */}
          {past.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setShowPast((v) => !v)}
                className="mx-auto flex items-center gap-2 rounded-full bg-white shadow-card px-5 py-2.5 text-sm font-bold hover:bg-ink hover:text-white"
              >
                {showPast ? "Hide" : "Show"} past events ({past.length}) {showPast ? "▲" : "▼"}
              </button>
              {showPast && (
                <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((event) => (
                    <li key={event.id}>
                      <EventCard {...cardProps(event)} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-3xl sm:text-4xl font-bold">{title}</h2>
      <p className="mt-2 text-muted">{subtitle}</p>
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
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? "bg-primary text-white" : "bg-white shadow-card text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ToggleButton({
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
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        active ? "bg-ink text-white" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EventModal({ event, onClose }: { event: LumaEvent; onClose: () => void }) {
  const category = CATEGORY_BY_KEY[event.category];
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-36 bg-ink/5">
          {event.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className={`h-full w-full ${category.className} flex items-center justify-center text-5xl`}>
              {category.icon}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 size-8 rounded-full bg-white/90 text-lg font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3">
          <span className={`self-start rounded-full px-3 py-1 text-xs font-bold ${category.className}`}>
            {category.icon} {category.label}
          </span>
          <h2 className="text-xl font-bold">{event.name}</h2>
          <dl className="text-sm text-muted space-y-1">
            <div>
              <span className="font-semibold text-ink">When: </span>
              {new Date(event.startAt).toLocaleString("en-MY", {
                timeZone: "Asia/Kuala_Lumpur",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            {event.hosts.length > 0 && (
              <div>
                <span className="font-semibold text-ink">Hosts: </span>
                {event.hosts.join(", ")}
              </div>
            )}
            {event.address && (
              <div>
                <span className="font-semibold text-ink">Where: </span>
                {event.address}
              </div>
            )}
            <div>
              <span className="font-semibold text-ink">Price: </span>
              {event.isFree ? "Free" : (event.priceLabel ?? "Paid")}
            </div>
            <div>
              <span className="font-semibold text-ink">Going: </span>
              {event.guestCount}
            </div>
          </dl>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-primary px-5 py-3 text-center font-bold text-white hover:brightness-110"
          >
            View on Luma →
          </a>
        </div>
      </div>
    </div>
  );
}