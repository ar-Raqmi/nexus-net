export type Country = "MY" | "SG" | "ID" | "VN" | "TH" | "PH";

export type QuestType =
  | "connect"
  | "meeting"
  | "programme"
  | "poc"
  | "partnership"
  | "funding";

export type Stage = "pre-seed" | "seed" | "series-a";

export interface Startup {
  id: string;
  name: string;
  country: Country;
  sector: string;
  stage: Stage;
  description: string;
  xp: number;
}

export interface Verdict {
  decision: "approved" | "rejected" | "unclear";
  confidence: number;
  documentType: string;
  parties: string[];
  date?: string;
  reason: string;
}

export type QuestStatus = "open" | "submitted" | "verified" | "rejected";

export interface Quest {
  id: string;
  startupId: string;
  eventId?: string;
  title: string;
  why: string;
  type: QuestType;
  targetCountry: Country;
  xp: number;
  proofRequired: string;
  status: QuestStatus;
  verdict?: Verdict;
  completedAt?: string;
}

export interface Event {
  id: string;
  name: string;
  country: Country;
  date: string;
}

export interface Programme {
  id: string;
  name: string;
  country: Country;
  type: QuestType;
  description: string;
}

/** A category we bucket Luma events into for the startup-facing calendar. */
export type EventCategory =
  | "startup"
  | "tech"
  | "meetup"
  | "workshop"
  | "social"
  | "other";

/** Normalised public event pulled from the Luma Kuala Lumpur discovery feed. */
export interface LumaEvent {
  id: string;
  name: string;
  url: string;
  startAt: string;
  endAt: string | null;
  timezone: string;
  coverUrl: string | null;
  hosts: string[];
  city: string | null;
  address: string | null;
  locationType: string;
  registration: string;
  isFree: boolean;
  priceLabel: string | null;
  guestCount: number;
  category: EventCategory;
  /** Keyword score against the startup profile; 0 when nothing matches. */
  relevance: number;
  /** Why this event matched the startup, e.g. "fintech", "seed-stage". */
  reasons: string[];
}
