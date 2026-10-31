import type { Quest, Startup, Verdict } from "./types";

export function parseVerdict(text: string): Verdict {
  const value = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
  if (!value || !["approved", "rejected", "unclear"].includes(value.decision) ||
    typeof value.confidence !== "number" || !Number.isFinite(value.confidence) ||
    value.confidence < 0 || value.confidence > 1 ||
    typeof value.documentType !== "string" || !value.documentType.trim() ||
    typeof value.reason !== "string" || !value.reason.trim() ||
    !Array.isArray(value.parties) || !value.parties.every((p: unknown) => typeof p === "string") ||
    (value.date != null && (typeof value.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)))) {
    throw new Error("Invalid verification response");
  }
  return { decision: value.decision, confidence: value.confidence,
    documentType: value.documentType, parties: value.parties,
    reason: value.reason, ...(value.date ? { date: value.date } : {}) };
}

/** A sample task makes F3 usable before the quest generator is available. */
export function sampleProofQuest(startup: Startup): Quest {
  const targetCountry = startup.country === "VN" ? "MY" : "VN";
  return {
    id: `proof-sample-${startup.id}`, startupId: startup.id,
    title: `Agree a cross-border pilot with a partner in ${targetCountry === "VN" ? "Vietnam" : "Malaysia"}`,
    why: "Turn a regional connection into a concrete pilot agreement.",
    type: "poc", targetCountry, xp: 150, status: "open",
    proofRequired: `A signed POC agreement or LOI naming ${startup.name} and a partner in ${targetCountry === "VN" ? "Vietnam" : "Malaysia"}, with a recent date and pilot scope.`,
  };
}
