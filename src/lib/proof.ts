import type { CompanyProfile, Verdict } from "./types";

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

export function parseCompanyProfile(value: unknown): CompanyProfile {
  if (!value || typeof value !== "object") throw new Error("Complete your company details first.");
  const p = value as Record<string, unknown>;
  for (const [key, max] of Object.entries({ startupId: 100, legalName: 160, registrationNumber: 80, website: 300, sector: 80, description: 2000 })) {
    if (typeof p[key] !== "string" || !(p[key] as string).trim() || (p[key] as string).length > max) throw new Error("Complete all company fields with valid details.");
  }
  if (!["MY", "SG", "ID", "VN", "TH", "PH"].includes(p.country as string) || !["pre-seed", "seed", "series-a"].includes(p.stage as string)) throw new Error("Choose a supported country and company stage.");
  let website: URL;
  try { website = new URL(p.website as string); } catch { throw new Error("Enter a valid company website, including https://."); }
  if (!["https:", "http:"].includes(website.protocol) || website.username || website.password) throw new Error("Enter a valid public company website.");
  return {
    startupId: (p.startupId as string).trim(), legalName: (p.legalName as string).trim(),
    registrationNumber: (p.registrationNumber as string).trim(), website: website.href,
    country: p.country as CompanyProfile["country"], sector: (p.sector as string).trim(),
    stage: p.stage as CompanyProfile["stage"], description: (p.description as string).trim(),
  };
}
