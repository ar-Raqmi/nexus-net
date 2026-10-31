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
