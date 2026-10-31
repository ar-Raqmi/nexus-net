import type { Country, QuestType, Verdict } from "./types";

export const XP_BY_TYPE: Record<QuestType, number> = {
  connect: 20,
  meeting: 50,
  programme: 75,
  poc: 150,
  partnership: 250,
  funding: 400,
};

export const MIN_APPROVAL_CONFIDENCE = 0.7;

export interface Level {
  index: number; // 1-based, for the numbered track nodes
  name: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { index: 1, name: "Connected", minXp: 0 },
  { index: 2, name: "Engaged", minXp: 100 },
  { index: 3, name: "POC", minXp: 300 },
  { index: 4, name: "Partnership", minXp: 600 },
  { index: 5, name: "Funded", minXp: 1000 },
];

export const COUNTRY_NAMES: Record<Country, string> = {
  MY: "Malaysia",
  SG: "Singapore",
  ID: "Indonesia",
  VN: "Vietnam",
  TH: "Thailand",
  PH: "Philippines",
};

export function getLevel(xp: number): Level {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level;
  }
  return current;
}

export function getNextLevel(xp: number): Level | null {
  return LEVELS.find((level) => level.minXp > xp) ?? null;
}

/** 0..1 progress from the current level's floor to the next level's floor (1 at max level). */
export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  return (xp - current.minXp) / (next.minXp - current.minXp);
}

/** A verdict only counts when approved with enough confidence. */
export function isApproved(verdict: Verdict): boolean {
  return (
    verdict.decision === "approved" &&
    verdict.confidence >= MIN_APPROVAL_CONFIDENCE
  );
}
