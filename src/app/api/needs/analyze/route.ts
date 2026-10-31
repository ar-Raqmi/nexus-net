import { GemmaError, generateJson } from "@/lib/gemma";
import { detectNeeds, isValidAnswers, type GapId, type NeedOption } from "@/lib/needs";
import type { Startup } from "@/lib/types";

interface AnalyzeBody {
  startup: Startup;
  answers: unknown;
  blocker?: string;
}

interface Copy {
  gapId: GapId;
  title: string;
  why: string;
}

const MAX_TITLE = 80;
const MAX_WHY = 220;
const MAX_BLOCKER = 300;

function buildPrompt(startup: Startup, needs: NeedOption[], blocker: string) {
  const gaps = needs.map((n) => ({
    gapId: n.gapId,
    urgency: n.urgency,
    youSaid: n.evidence,
    doneBy: n.talentRole ?? "the founder",
    targetCountry: n.targetCountry,
  }));
  return `You help a startup close gaps that block its expansion into another ASEAN country.
The gaps and their urgency are already decided. Your job is only to word one option per gap.
Rules:
- title: imperative, specific to this startup's sector, at most 70 characters.
- why: one sentence tying this gap to winning customers or partners in the target country.
- Do not invent company names, people, prices or numbers.
- Keep each gapId exactly as given.
- Do not use emoji.
Return ONLY a JSON array, no prose, no code fences:
[{"gapId":"website","title":"...","why":"..."}]
Startup: ${JSON.stringify({ name: startup.name, sector: startup.sector, stage: startup.stage, description: startup.description, country: startup.country })}
Founder's own words about their biggest blocker: ${JSON.stringify(blocker || "none given")}
Gaps: ${JSON.stringify(gaps)}`;
}

function validateCopy(value: unknown, allowed: Set<string>): Copy[] {
  if (!Array.isArray(value)) throw new Error("Expected a JSON array.");
  const copies: Copy[] = [];
  for (const item of value) {
    const c = item as Record<string, unknown>;
    if (typeof c?.gapId !== "string" || !allowed.has(c.gapId)) continue;
    if (typeof c.title !== "string" || typeof c.why !== "string") continue;
    if (!c.title.trim() || !c.why.trim()) continue;
    copies.push({
      gapId: c.gapId as GapId,
      title: c.title.trim().slice(0, MAX_TITLE),
      why: c.why.trim().slice(0, MAX_WHY),
    });
  }
  if (copies.length === 0) throw new Error("No usable copy in the reply.");
  return copies;
}

function applyCopy(needs: NeedOption[], copies: Copy[]): NeedOption[] {
  const byGap = new Map(copies.map((c) => [c.gapId, c]));
  return needs.map((n) => {
    const copy = byGap.get(n.gapId);
    return copy ? { ...n, title: copy.title, why: copy.why } : n;
  });
}

export async function POST(request: Request) {
  let body: AnalyzeBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const { startup, answers, blocker } = body ?? {};
  if (!startup?.id || !startup?.name || !isValidAnswers(answers)) {
    return Response.json({ error: "Missing startup or incomplete answers." }, { status: 400 });
  }

  const needs = detectNeeds(answers);
  const allowed = new Set<string>(needs.map((n) => n.gapId));
  const note = typeof blocker === "string" ? blocker.slice(0, MAX_BLOCKER) : "";

  try {
    const copies = await generateJson([buildPrompt(startup, needs, note)], (v) => validateCopy(v, allowed));
    return Response.json({ options: applyCopy(needs, copies), source: "gemma" });
  } catch (error) {
    // The rules already produced complete options, so a model failure degrades to template wording.
    const reason = error instanceof GemmaError ? error.message : "Gemma was unreachable.";
    return Response.json({ options: needs, source: "template", reason });
  }
}
