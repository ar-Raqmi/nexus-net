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
  /** Set when a talent (not the founder) does the work, e.g. "Web developer". */
  talentRole?: string;
  status: QuestStatus;
  verdict?: Verdict;
  completedAt?: string;
  verificationMode?: "live" | "demo";
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

export interface Talent {
  id: string;
  name: string;
  role: string;
  country: Country;
  skills: string[];
  rating: number;
  gigsDone: number;
}

/** Company onboarding is separate from quests and never awards XP. */
export interface CompanyProfile {
  startupId: string;
  legalName: string;
  registrationNumber: string;
  website: string;
  country: Country;
  sector: string;
  stage: Stage;
  description: string;
}

export interface CompanyVerification {
  profile: CompanyProfile;
  verdict: Verdict;
  mode: "live" | "demo";
  checkedAt: string;
  passportId?: string;
  model?: string;
  durationMs?: number;
}

/** A category we bucket Luma events into for the startup-facing calendar. */
export type EventCategory =
  | "hackathon"
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
  /** Small, CDN-resized cover for grid cards. */
  coverUrl: string | null;
  /** Larger CDN-resized cover for the detail modal. */
  coverUrlLarge: string | null;
  hosts: string[];
  city: string | null;
  address: string | null;
  /** Venue coordinates from Luma; null for online or unlocated events. */
  lat: number | null;
  lng: number | null;
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
