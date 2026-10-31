"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import Flag from "@/components/Flag";
import PixelIcon from "@/components/PixelIcon";
import { ASEAN_VIEW, arcBetween, COUNTRY_CENTERS, QUEST_TYPE_COLOR, spreadAround } from "@/lib/geo";
import { COUNTRY_NAMES, getLevel } from "@/lib/game";
import { QUEST_TYPE_STYLE } from "@/lib/tiers";
import type { Country, LumaEvent, Quest, QuestType } from "@/lib/types";
import { seedEvents, seedQuests, seedStartups } from "@/seed";
import { selectVerified } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import type { MapArc, MapFocus, MapLayerMode, MapPin, MapStartup } from "./types";

const OutcomeMap = dynamic(() => import("./OutcomeMap"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-white/60 text-sm font-semibold text-muted">Loading the map…</div>
  ),
});

const COUNTRY_ZOOM = 5.6;
const MAX_CORRIDORS = 8;
const CORRIDOR_COLOR = "#405CEE";
const QUEST_TYPES = Object.keys(QUEST_TYPE_COLOR) as QuestType[];

function useLumaPins(): MapPin[] {
  const [events, setEvents] = useState<LumaEvent[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/events", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data: { events?: LumaEvent[] }) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
    return () => controller.abort();
  }, []);
  return useMemo(
    () =>
      events
        .filter((e): e is LumaEvent & { lat: number; lng: number } => e.lat !== null && e.lng !== null)
        .map((e) => ({
          id: e.id,
          name: e.name,
          position: [e.lng, e.lat],
          kind: "luma" as const,
          subtitle: `${new Date(e.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" })} · ${e.city ?? "Kuala Lumpur"}`,
        })),
    [events],
  );
}

type CrossBorderQuest = Quest & { startupId: string };

function lanesFor(
  quests: CrossBorderQuest[],
  keyOf: (q: CrossBorderQuest) => string,
  byId: Map<string, MapStartup>,
  kind: "startup" | "corridor",
): MapArc[] {
  const groups = new Map<string, CrossBorderQuest[]>();
  quests.forEach((q) => groups.set(keyOf(q), [...(groups.get(keyOf(q)) ?? []), q]));
  return [...groups.entries()].map(([key, group], i) => {
    const top = group.reduce((best, q) => (QUEST_TYPES.indexOf(q.type) > QUEST_TYPES.indexOf(best.type) ? q : best));
    const home = byId.get(top.startupId)!;
    const from = kind === "startup" ? home.position : COUNTRY_CENTERS[home.country];
    return {
      id: `${kind}:${key}`,
      startupId: top.startupId,
      type: top.type,
      color: kind === "startup" ? QUEST_TYPE_COLOR[top.type] : CORRIDOR_COLOR,
      xp: group.reduce((sum, q) => sum + q.xp, 0),
      count: group.length,
      coordinates: arcBetween(from, COUNTRY_CENTERS[top.targetCountry], 0.16 + (i % 3) * 0.05),
    };
  });
}

export default function MapView() {
  const hydrated = useHasHydrated();
  const storeStartups = useGameStore((s) => s.startups);
  const storeQuests = useGameStore((s) => s.quests);
  const currentId = useGameStore((s) => s.currentStartupId);
  const lumaPins = useLumaPins();

  const [mode, setMode] = useState<MapLayerMode>("outcomes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<QuestType | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);

  const startups = hydrated ? storeStartups : seedStartups;
  const quests = hydrated ? storeQuests : seedQuests;

  const data = useMemo(() => {
    const perCountry: Partial<Record<Country, number>> = {};
    const mapStartups: MapStartup[] = startups.map((s) => {
      const index = perCountry[s.country] ?? 0;
      perCountry[s.country] = index + 1;
      return {
        id: s.id,
        name: s.name,
        country: s.country,
        position: spreadAround(COUNTRY_CENTERS[s.country], index),
        isCurrent: s.id === currentId,
      };
    });
    const byId = new Map(mapStartups.map((s) => [s.id, s]));
    const verified = selectVerified(quests).filter((q) => !typeFilter || q.type === typeFilter);
    const crossBorder = verified.filter((q) => {
      const home = byId.get(q.startupId);
      return home && home.country !== q.targetCountry;
    });
    // Default view shows the biggest country-to-country corridors in one calm colour; picking a startup swaps in its own lanes, coloured by outcome type.
    const arcs: MapArc[] = selectedId
      ? lanesFor(crossBorder.filter((q) => q.startupId === selectedId), (q) => q.targetCountry, byId, "startup")
      : lanesFor(crossBorder, (q) => `${byId.get(q.startupId)!.country}>${q.targetCountry}`, byId, "corridor")
          .sort((x, y) => y.count - x.count)
          .slice(0, MAX_CORRIDORS);
    const countryTotals = (Object.keys(COUNTRY_NAMES) as Country[])
      .map((country) => ({
        country,
        inbound: crossBorder.filter((q) => q.targetCountry === country).length,
        hosted: mapStartups.filter((s) => s.country === country).length,
      }))
      .sort((a, b) => b.inbound - a.inbound);
    return { mapStartups, arcs, crossBorder, countryTotals };
  }, [startups, quests, currentId, typeFilter, selectedId]);

  const pins = useMemo<MapPin[]>(() => {
    const seeded = seedEvents.map((e, i) => ({
      id: e.id,
      name: e.name,
      position: spreadAround(COUNTRY_CENTERS[e.country], i % 4 === 0 ? 0 : (i % 4) + 1, 0.28),
      kind: "seed" as const,
      subtitle: `${new Date(`${e.date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${COUNTRY_NAMES[e.country]}`,
    }));
    return [...seeded, ...lumaPins];
  }, [lumaPins]);

  const selected = startups.find((s) => s.id === selectedId) ?? null;
  const selectedQuests = selected ? data.crossBorder.filter((q) => q.startupId === selected.id) : [];
  const flyTo = (position: [number, number], zoom = COUNTRY_ZOOM) =>
    setFocus((prev) => ({ position, zoom, nonce: (prev?.nonce ?? 0) + 1 }));
  const resetView = () => {
    setSelectedId(null);
    flyTo(ASEAN_VIEW.center, ASEAN_VIEW.zoom);
  };

  return (
    <section className="flex flex-col gap-6 py-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">ASEAN map</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-card">
            <span className="size-2 rounded-full bg-green animate-pulse-ring" />
            Live
          </span>
        </div>
        <p className="max-w-2xl text-muted">
          Every line is a verified cross-border outcome: a startup turning a connection abroad into a real result.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="relative h-[28rem] overflow-hidden rounded-3xl border-2 border-ink bg-white shadow-[4px_4px_0_#222] sm:h-[34rem] lg:h-[40rem]">
          <OutcomeMap
            startups={data.mapStartups}
            arcs={data.arcs}
            pins={pins}
            mode={mode}
            selectedId={selectedId}
            focus={focus}
            onSelect={setSelectedId}
          />
          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
            <div className="pointer-events-auto inline-flex rounded-full bg-white p-1 shadow-card" role="group" aria-label="Map layer">
              {(["outcomes", "events"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => {
                    setMode(value);
                    setSelectedId(null);
                  }}
                  className={`min-h-9 rounded-full px-4 text-sm font-bold transition ${
                    mode === value ? "bg-ink text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {value === "outcomes" ? "Outcomes" : "Events"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={resetView}
              className="pointer-events-auto min-h-9 rounded-full bg-white px-4 text-sm font-bold text-ink shadow-card transition hover:-translate-y-0.5"
            >
              Reset view
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Cross-border outcomes" value={data.crossBorder.length} icon="rocket" />
            <Stat label="Startups on the map" value={data.mapStartups.length} icon="star" />
          </div>

          {mode === "events" ? (
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <p className="eyebrow">Upcoming events</p>
              <p className="mt-1 text-xs text-muted">
                <span className="mr-1 inline-block size-2.5 rounded-full bg-primary align-middle" /> Live from Luma KL
                <span className="mx-1 ml-3 inline-block size-2.5 rounded-full bg-yellow align-middle" /> ASEAN programme
              </p>
              <ul className="mt-3 flex max-h-80 flex-col gap-1 overflow-y-auto">
                {pins.map((pin) => (
                  <li key={pin.id}>
                    <button
                      type="button"
                      onClick={() => flyTo(pin.position, 11)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-1 text-left transition hover:bg-paper"
                    >
                      <span className={`size-3 shrink-0 rounded-full border-2 border-ink ${pin.kind === "luma" ? "bg-primary" : "bg-yellow"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{pin.name}</span>
                        <span className="block text-xs text-muted">{pin.subtitle}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : selected ? (
            <div className="rounded-3xl bg-white p-5 shadow-card motion-safe:animate-fade-up">
              <div className="flex items-center gap-3">
                <CompanyLogo id={selected.id} name={selected.name} size={48} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{selected.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {COUNTRY_NAMES[selected.country]} · {getLevel(selected.xp).name}
                  </p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {selectedQuests.length === 0 && <li className="text-sm text-muted">No cross-border outcomes verified yet.</li>}
                {selectedQuests.map((q) => (
                  <li key={q.id} className="flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 text-sm">
                    <PixelIcon name={QUEST_TYPE_STYLE[q.type].icon} size={20} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{q.title}</span>
                    <Flag country={q.targetCountry} size={16} />
                    <span className="font-score text-xs font-bold text-primary">+{q.xp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-5 shadow-card">
              <p className="eyebrow">Outcome type</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <TypeChip active={typeFilter === null} onClick={() => setTypeFilter(null)} color="#222222" label="All" />
                {QUEST_TYPES.map((type) => (
                  <TypeChip
                    key={type}
                    active={typeFilter === type}
                    onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                    color={QUEST_TYPE_COLOR[type]}
                    label={QUEST_TYPE_STYLE[type].label}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white p-5 shadow-card">
            <p className="eyebrow">Outcomes by destination</p>
            <ul className="mt-3 flex flex-col gap-1">
              {data.countryTotals.map(({ country, inbound, hosted }) => (
                <li key={country}>
                  <button
                    type="button"
                    onClick={() => flyTo(COUNTRY_CENTERS[country])}
                    className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left transition hover:bg-paper"
                  >
                    <Flag country={country} size={22} />
                    <span className="flex-1 text-sm font-semibold">{COUNTRY_NAMES[country]}</span>
                    <span className="text-xs text-muted">{hosted} HQ</span>
                    <span className="min-w-8 rounded-full bg-primary/10 px-2 py-0.5 text-center font-score text-sm font-bold text-primary-dark">
                      {inbound}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: "rocket" | "star" }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card">
      <PixelIcon name={icon} size={24} />
      <p className="mt-2 font-score text-3xl font-bold text-primary">{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}

function TypeChip({ active, onClick, color, label }: { active: boolean; onClick: () => void; color: string; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-8 items-center gap-2 rounded-full border-2 px-3 text-xs font-bold transition ${
        active ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink hover:border-ink/30"
      }`}
    >
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </button>
  );
}
