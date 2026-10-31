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
