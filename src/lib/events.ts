import type { EventCategory, LumaEvent, Startup } from "./types";

// Kuala Lumpur discovery place on Luma. Public events feed, no auth required.
export const LUMA_KL_PLACE_API_ID = "discplace-O15L1VZiYe0GYGm";

// Malaysian timezone. Luma returns UTC timestamps; we display them in KL time.
export const EVENT_TIMEZONE = "Asia/Kuala_Lumpur";

// XP boosted for subscribing to an event calendar, keyed off relevance.
export const EVENT_SUBSCRIBE_XP = 50;
export const EVENT_RELEVANT_XP = 100;

export interface CategoryMeta {
  key: EventCategory;
  label: string;
  icon: string;
  className: string;
  /** Solid colour used for the compact dot markers on small screens. */
  dot: string;
}

export const EVENT_CATEGORIES: CategoryMeta[] = [
  { key: "startup", label: "Startup", icon: "🚀", className: "bg-primary text-white", dot: "bg-primary" },
  { key: "tech", label: "Tech", icon: "💻", className: "bg-purple-dark text-white", dot: "bg-purple-dark" },
  { key: "meetup", label: "Meetup", icon: "🤝", className: "bg-green text-white", dot: "bg-green" },
  { key: "workshop", label: "Workshop", icon: "🛠️", className: "bg-yellow text-ink", dot: "bg-yellow" },
  { key: "social", label: "Social", icon: "🎉", className: "bg-ink text-white", dot: "bg-ink" },
  { key: "other", label: "Other", icon: "📌", className: "bg-ink/10 text-ink", dot: "bg-muted" },
];

export const CATEGORY_BY_KEY: Record<EventCategory, CategoryMeta> = EVENT_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c }),
  {} as Record<EventCategory, CategoryMeta>,
);

const CATEGORY_KEYWORDS: Record<Exclude<EventCategory, "other">, RegExp> = {
  startup:
    /\b(startup|founder|venture|vc\b|investor|pitch|demo day|accelerat|incubat|funding|raise|entrepreneur|scale[- ]?up|growt)\w*/i,
  workshop:
    /\b(workshop|bootcamp|training|class|course|masterclass|hands[- ]?on|hackathon|build (?:your|an|a)|certif|tutorial|learn)\w*/i,
  tech: /\b(ai\b|a\.i\.|agent|llm|software|developer|dev\b|code|coding|tech|data|cloud|cyber|blockchain|web3|crypto|robotics|engineer)\w*/i,
  meetup:
    /\b(meetup|networking|mixer|connect|community|gathering|talks?|panel|forum|summit|conference|conference)\w*/i,
  social: /\b(social|party|dinner|brunch|drinks|mixer|games?|music|art|wellness|yoga|run|hike|market|screening)\w*/i,
};

/** Best-effort category for an event based on its name, host and description. */
export function inferCategory(...parts: (string | null | undefined)[]): EventCategory {
  const haystack = parts.filter(Boolean).join(" ");
  // Order matters: startup and workshop are the most useful signals for founders.
  const order: Exclude<EventCategory, "other">[] = [
    "startup",
    "workshop",
    "tech",
    "meetup",
    "social",
  ];
  for (const key of order) {
    if (CATEGORY_KEYWORDS[key].test(haystack)) return key;
  }
  return "other";
}

// Words too generic to indicate that an event is relevant to a startup.
const STOPWORDS = new Set([
  "and", "the", "for", "with", "from", "your", "our", "this", "that", "of", "in", "to", "a",
  "an", "at", "on", "by", "or", "is", "be", "as", "it", "we", "my",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

export interface RelevanceResult {
  score: number;
  reasons: string[];
}

/**
 * Score how relevant an event is to a startup. Higher means a stronger match.
 * Signals: shared vocabulary between the event text and the startup's sector /
 * description, plus sector-family boosts (e.g. a fintech startup and a payments
 * meetup) and a small boost for startup/tech/workshop categories.
 */
export function scoreRelevance(event: LumaEvent, startup: Startup): RelevanceResult {
  const eventTerms = new Set(
    tokenize(`${event.name} ${event.hosts.join(" ")} ${event.category}`),
  );
  const startupTerms = tokenize(`${startup.sector} ${startup.description} ${startup.name}`);

  let score = 0;
  const reasons = new Set<string>();

  for (const term of startupTerms) {
    if (eventTerms.has(term)) {
      score += 2;
      reasons.add(term);
    }
  }

  // Sector-family signals: match a startup sector against event keywords.
  const sector = startup.sector.toLowerCase();
  const helpText = `${event.name} ${event.hosts.join(" ")}`.toLowerCase();
  const SECTOR_HINTS: Record<string, RegExp> = {
    fintech: /(fintech|payment|banking|wallet|qr|lending|insurtech|finance)/i,
    agritech: /(agri|farm|crop|harvest|food|plantation)/i,
    healthtech: /(health|medic|clinic|care|telehealth|healthtech)/i,
    logistics: /(logistics|delivery|supply chain|courier|freight|fleet)/i,
    edtech: /(edu|learning|school|upskill|training|edtech|bpo)/i,
    "e-commerce": /(commerce|retail|sme|seller|shop|marketplace|bnpl)/i,
    cleantech: /(clean|energy|solar|battery|climate|green|sustainab)/i,
    saas: /(saas|software|platform|b2b|cloud|automat)/i,
    "supply chain": /(supply chain|logistics|certif|trace|manufactur)/i,
  };
  for (const [key, re] of Object.entries(SECTOR_HINTS)) {
    if (sector.includes(key) && re.test(helpText)) {
      score += 4;
      reasons.add(startup.sector);
      break;
    }
  }

  // Category affinity: founder-facing categories are more useful by default.
  const CATEGORY_BOOST: Partial<Record<EventCategory, number>> = {
    startup: 3,
    tech: 2,
    workshop: 2,
    meetup: 1,
  };
  const boost = CATEGORY_BOOST[event.category] ?? 0;
  if (boost > 0) {
    score += boost;
    reasons.add(CATEGORY_LABEL_SHORT[event.category]);
  }

  return { score, reasons: [...reasons].slice(0, 3) };
}

const CATEGORY_LABEL_SHORT: Record<EventCategory, string> = {
  startup: "startup",
  tech: "tech",
  meetup: "networking",
  workshop: "workshop",
  social: "social",
  other: "event",
};

/** Minimum relevance score for an event to count as relevant to a startup. */
export const RELEVANT_MIN_SCORE = 6;

/** XP awarded when a startup subscribes to an event calendar. */
export function subscribeXpFor(event: LumaEvent, startup: Startup | null): number {
  return isEventRelevant(event, startup) ? EVENT_RELEVANT_XP : EVENT_SUBSCRIBE_XP;
}

/** True when an event matches the startup strongly enough to earn bonus XP. */
export function isEventRelevant(event: LumaEvent, startup: Startup | null): boolean {
  if (!startup) return false;
  return scoreRelevance(event, startup).score >= RELEVANT_MIN_SCORE;
}

export interface RelevanceOptions {
  /** Minimum score for an event to count as relevant to the startup. */
  minScore?: number;
  /** Maximum number of relevant events to return. */
  limit?: number;
}

/** Rank events by relevance to a startup, filtering out weak matches. */
export function selectRelevantEvents(
  events: LumaEvent[],
  startup: Startup | null,
  { minScore = RELEVANT_MIN_SCORE, limit = 6 }: RelevanceOptions = {},
): LumaEvent[] {
  if (!startup) return [];
  return events
    .map((e) => ({ e, ...scoreRelevance(e, startup) }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ e }) => e);
}

// --- Date helpers (all display in Kuala Lumpur time) ---

const KL_DATE_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** ISO date (YYYY-MM-DD) of an instant, in Kuala Lumpur time. */
export function klDateKey(iso: string | Date): string {
  return KL_DATE_FMT.format(typeof iso === "string" ? new Date(iso) : iso);
}

/** Year/month/day parts of an instant in Kuala Lumpur time. */
export function klParts(iso: string | Date): { year: number; month: number; day: number } {
  const key = klDateKey(iso);
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

export function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: EVENT_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatEventDay(iso: string): string {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: EVENT_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function isSameKlDay(iso: string, key: string): boolean {
  return klDateKey(iso) === key;
}

export function isPast(iso: string, now = Date.now()): boolean {
  return new Date(iso).getTime() < now;
}

// --- Calendar date arithmetic (pure calendar dates, no timezone involved) ---

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

function fromUtc(d: Date): DateParts {
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function partsKey({ year, month, day }: DateParts): string {
  const d = fromUtc(new Date(Date.UTC(year, month - 1, day)));
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

export function addDays(p: DateParts, n: number): DateParts {
  return fromUtc(new Date(Date.UTC(p.year, p.month - 1, p.day + n)));
}

/** Monday-first weekday index (0 = Monday .. 6 = Sunday). */
export function mondayIndex(p: DateParts): number {
  return (new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Bucket events by their KL-time day key. */
export function groupEventsByDay(events: LumaEvent[]): Map<string, LumaEvent[]> {
  const byDay = new Map<string, LumaEvent[]>();
  for (const e of events) {
    const key = klDateKey(e.startAt);
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }
  return byDay;
}
