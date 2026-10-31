import { COUNTRY_NAMES, getLevel, getLevelProgress, getNextLevel } from "@/lib/game";
import type { Country, Event, Quest, QuestType, Startup } from "@/lib/types";

// Pure selectors. In components, read raw slices from the store and wrap these
// in useMemo so derived arrays aren't recreated on every render.

export function selectStartup(startups: Startup[], id: string | null) {
  return startups.find((s) => s.id === id) ?? null;
}

export function selectLevelInfo(xp: number) {
  return {
    level: getLevel(xp),
    next: getNextLevel(xp),
    progress: getLevelProgress(xp),
  };
}

export function selectQuestsFor(quests: Quest[], startupId: string) {
  return quests.filter((q) => q.startupId === startupId);
}

export function selectVerified(quests: Quest[]) {
  return quests.filter((q) => q.status === "verified");
}

/** Event IDs a startup has subscribed to. */
export function selectSubscriptions(
  subscriptions: Record<string, string[]>,
  startupId: string | null,
): string[] {
  if (!startupId) return [];
  return subscriptions[startupId] ?? [];
}

/** Event IDs that have already granted XP for a startup. */
export function selectCreditedEvents(
  creditedEvents: Record<string, string[]>,
  startupId: string | null,
): string[] {
  if (!startupId) return [];
  return creditedEvents[startupId] ?? [];
}

// --- Leaderboards ---

export interface LeaderboardRow {
  id: string;
  name: string;
  score: number; // XP
  outcomes: number; // verified quests
  subtitle: string;
}

const byScore = (a: LeaderboardRow, b: LeaderboardRow) =>
  b.score - a.score || b.outcomes - a.outcomes || a.name.localeCompare(b.name);

export function selectStartupLeaderboard(
  startups: Startup[],
  quests: Quest[],
): LeaderboardRow[] {
  const verified = selectVerified(quests);
  return startups
    .map((s) => ({
      id: s.id,
      name: s.name,
      score: s.xp,
      outcomes: verified.filter((q) => q.startupId === s.id).length,
      subtitle: `${s.sector} · ${getLevel(s.xp).name}`,
    }))
    .sort(byScore);
}

export function selectCountryLeaderboard(
  startups: Startup[],
  quests: Quest[],
): LeaderboardRow[] {
  const verified = selectVerified(quests);
  const countries = Object.keys(COUNTRY_NAMES) as Country[];
  return countries
    .map((country) => {
      const members = startups.filter((s) => s.country === country);
      const ids = new Set(members.map((s) => s.id));
      return {
        id: country,
        name: COUNTRY_NAMES[country],
        score: members.reduce((sum, s) => sum + s.xp, 0),
        outcomes: verified.filter((q) => ids.has(q.startupId)).length,
        subtitle: `${members.length} startup${members.length === 1 ? "" : "s"}`,
      };
    })
    .sort(byScore);
}

export function selectEventLeaderboard(
  events: Event[],
  quests: Quest[],
): LeaderboardRow[] {
  const verified = selectVerified(quests);
  return events
    .map((e) => {
      const fromEvent = verified.filter((q) => q.eventId === e.id);
      return {
        id: e.id,
        name: e.name,
        score: fromEvent.reduce((sum, q) => sum + q.xp, 0),
        outcomes: fromEvent.length,
        subtitle: `${COUNTRY_NAMES[e.country]} · ${e.date}`,
      };
    })
    .sort(byScore);
}

// --- Cradle funnel ---

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
}

// Each verified quest counts toward every stage it has reached, so the funnel
// is always monotonic: a POC implies a connection and a meeting.
const STAGE_RANK: Record<QuestType, number> = {
  connect: 0,
  meeting: 1,
  programme: 1,
  poc: 2,
  partnership: 3,
  funding: 4,
};

const FUNNEL_LABELS = [
  { key: "connections", label: "Connections" },
  { key: "meetings", label: "Meetings" },
  { key: "pocs", label: "POCs" },
  { key: "partnerships", label: "Partnerships" },
  { key: "investments", label: "Investments" },
];

export const FUNNEL_STAGES = FUNNEL_LABELS;

/** Monotonic per-stage counts for already-verified quests. */
function countStages(verified: Quest[]): number[] {
  return FUNNEL_LABELS.map(
    (_, rank) => verified.filter((q) => STAGE_RANK[q.type] >= rank).length,
  );
}

/** Share of connections that reached POC or beyond, as a 0-100 percentage. */
function pocConversion(stages: number[]): number {
  return stages[0] === 0 ? 0 : Math.round((stages[2] / stages[0]) * 100);
}

export function selectFunnel(quests: Quest[]): FunnelStage[] {
  const counts = countStages(selectVerified(quests));
  return FUNNEL_LABELS.map((stage, rank) => ({ ...stage, count: counts[rank] }));
}

/** Share of connections that reached POC or beyond, as a 0-100 percentage. */
export function selectConversionRate(quests: Quest[]): number {
  return pocConversion(countStages(selectVerified(quests)));
}

export interface OutcomeBreakdown {
  id: string;
  name: string;
  outcomes: number;
  xp: number;
  /** Count per funnel stage, same order as FUNNEL_STAGES. */
  stages: number[];
  /** Connection-to-POC conversion, 0-100. */
  conversion: number;
}

function breakdown(id: string, name: string, verified: Quest[]): OutcomeBreakdown {
  const stages = countStages(verified);
  return {
    id,
    name,
    outcomes: verified.length,
    xp: verified.reduce((sum, q) => sum + q.xp, 0),
    stages,
    conversion: pocConversion(stages),
  };
}

const byOutcomes = (a: OutcomeBreakdown, b: OutcomeBreakdown) =>
  b.outcomes - a.outcomes || b.xp - a.xp || a.name.localeCompare(b.name);

/** Verified outcomes grouped by the country the outcome happened in. */
export function selectOutcomesByCountry(
  quests: Quest[],
): (OutcomeBreakdown & { country: Country })[] {
  const verified = selectVerified(quests);
  return (Object.keys(COUNTRY_NAMES) as Country[])
    .map((country) => ({
      country,
      ...breakdown(
        country,
        COUNTRY_NAMES[country],
        verified.filter((q) => q.targetCountry === country),
      ),
    }))
    .sort(byOutcomes);
}

export const NO_EVENT_ID = "no-event";

/**
 * Verified outcomes grouped by the event that sparked them. Outcomes without a
 * known event are collected in a trailing "No event" row when there are any.
 */
export function selectOutcomesByEvent(
  events: Event[],
  quests: Quest[],
): (OutcomeBreakdown & { event: Event | null })[] {
  const verified = selectVerified(quests);
  const known = new Set(events.map((e) => e.id));
  const rows = events
    .map((event) => ({
      event,
      ...breakdown(event.id, event.name, verified.filter((q) => q.eventId === event.id)),
    }))
    .sort(byOutcomes);
  const unattributed = verified.filter((q) => !q.eventId || !known.has(q.eventId));
  if (unattributed.length === 0) return rows;
  return [...rows, { event: null, ...breakdown(NO_EVENT_ID, "No event", unattributed) }];
}
