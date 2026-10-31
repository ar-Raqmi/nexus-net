"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  EVENT_RELEVANT_XP,
  EVENT_SUBSCRIBE_XP,
  addDays,
  isEventRelevant,
  klParts,
  mondayIndex,
  selectRelevantEvents,
  type DateParts,
} from "@/lib/events";
import type { LumaEvent } from "@/lib/types";
import { seedStartups } from "@/seed";
import { selectCreditedEvents, selectStartup, selectSubscriptions } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import BrowsingPanel from "./BrowsingPanel";
import EventCalendar from "./EventCalendar";
import EventCard from "./EventCard";
import EventControls, { type Filter, type Mode } from "./EventControls";
import EventModal from "./EventModal";
import EventsHero from "./EventsHero";
import NextUpStrip from "./NextUpStrip";

const FALLBACK_TODAY: DateParts = { year: 2026, month: 10, day: 31 };
const MONTH_FMT = new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const toDate = (p: DateParts) => new Date(Date.UTC(p.year, p.month - 1, p.day));

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

  const [mode, setMode] = useState<Mode>("month");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<LumaEvent | null>(null);
  const closeModal = useCallback(() => setSelected(null), []);
  const [showPast, setShowPast] = useState(false);

  // Captured from the client clock without an impure call during render. Null on
  // the server / first render, so prerender never evaluates the current time.
  const now = useSyncExternalStore(subscribeNow, getNow, () => null);

  // Date the user navigated to; null means "follow the default" (today, or the next event).
  const [pickedAnchor, setPickedAnchor] = useState<DateParts | null>(null);

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

  const relevant = useMemo(() => selectRelevantEvents(events, startup), [events, startup]);

  // XP earned from event subscriptions (recomputed from loaded events).
  const boosterXp = useMemo(() => {
    return creditedIds.reduce((sum, id) => {
      const event = events.find((e) => e.id === id);
      if (!event) return sum;
      return sum + (isEventRelevant(event, startup) ? EVENT_RELEVANT_XP : EVENT_SUBSCRIBE_XP);
    }, 0);
  }, [creditedIds, events, startup]);

  const matchesFilter = useCallback(
    (e: LumaEvent) => filter === "all" || e.category === filter,
    [filter],
  );

  const upcomingAll = useMemo(() => {
    if (now === null) return [];
    return events
      .filter((e) => new Date(e.startAt).getTime() / 1000 >= now)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [events, now]);

  const upcoming = useMemo(() => upcomingAll.filter(matchesFilter), [upcomingAll, matchesFilter]);

  const past = useMemo(() => {
    if (now === null) return [];
    return events
      .filter((e) => new Date(e.startAt).getTime() / 1000 < now)
      .filter(matchesFilter)
      .sort((a, b) => b.startAt.localeCompare(a.startAt));
  }, [events, matchesFilter, now]);

  const calendarEvents = useMemo(() => events.filter(matchesFilter), [events, matchesFilter]);

  const today = now === null ? FALLBACK_TODAY : klParts(new Date(now * 1000));
  const nextEvent = upcoming[0];

  // Open on today, unless nothing is left this month: then on the next event.
  const nextParts = nextEvent ? klParts(nextEvent.startAt) : null;
  const defaultAnchor =
    nextParts && (nextParts.year !== today.year || nextParts.month !== today.month) ? nextParts : today;
  const anchor = pickedAnchor ?? defaultAnchor;
  const calView = mode === "week" ? "week" : "month";

  function navigate(delta: -1 | 1) {
    if (calView === "week") {
      setPickedAnchor(addDays(anchor, 7 * delta));
      return;
    }
    const first = { year: anchor.year, month: anchor.month + delta, day: 1 };
    const normalised = klParts(new Date(Date.UTC(first.year, first.month - 1, 1)));
    const isCurrent = normalised.year === today.year && normalised.month === today.month;
    setPickedAnchor(isCurrent ? today : normalised);
  }

  const weekStart = addDays(anchor, -mondayIndex(anchor));
  const title =
    calView === "week"
      ? `${DAY_FMT.format(toDate(weekStart))} – ${DAY_FMT.format(toDate(addDays(weekStart, 6)))}`
      : MONTH_FMT.format(toDate(anchor));
  const jump =
    nextEvent && nextParts
      ? {
          label: calView === "week" ? DAY_FMT.format(toDate(nextParts)) : MONTH_FMT.format(toDate(nextParts)),
          onJump: () => setPickedAnchor(nextParts),
        }
      : null;

  return (
    <div className="flex flex-col gap-8">
      <EventsHero />

      {hydrated && startup ? (
        <BrowsingPanel startup={startup} subscribedCount={subscribedIds.length} boosterXp={boosterXp} />
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

      <EventControls filter={filter} mode={mode} onFilter={setFilter} onMode={setMode} />

      {!loading && !error && mode !== "list" && (
        <NextUpStrip events={upcomingAll.slice(0, 3)} cardProps={cardProps} />
      )}

      {loading && <p className="py-12 text-center text-muted">Loading events from Luma…</p>}

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
          {mode !== "list" ? (
            <EventCalendar
              events={calendarEvents}
              view={calView}
              anchor={anchor}
              title={title}
              now={now}
              jump={jump}
              onNavigate={navigate}
              onSelectEvent={setSelected}
            />
          ) : (
            <section>
              <SectionTitle
                title="Upcoming events"
                subtitle={`${upcoming.length} event${upcoming.length === 1 ? "" : "s"} ahead in Kuala Lumpur.`}
              />
              {upcoming.length === 0 ? (
                <p className="text-center text-muted">No upcoming events match your filter.</p>
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
                aria-expanded={showPast}
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

      {selected && <EventModal event={selected} onClose={closeModal} />}

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
