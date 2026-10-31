import { XP_BY_TYPE, COUNTRY_NAMES } from "@/lib/game";
import { GemmaError, generateJson } from "@/lib/gemma";
import type { Country, Event, Programme, Quest, QuestType, Startup } from "@/lib/types";
import { fallback } from "@/seed";

interface GenerateBody {
  startup: Startup;
  catalog: { programmes: Programme[]; events: Event[] };
}

type QuestDraft = Omit<Quest, "id" | "startupId" | "status">;

const QUEST_COUNT = 5;

function buildPrompt(startup: Startup, catalog: GenerateBody["catalog"]) {
  return `You are the quest engine for Startup ASEAN, a platform that helps startups turn ecosystem connections into measurable outcomes across the 10 ASEAN countries.
Given a startup profile and a list of available programmes and events, create exactly 5 quests that move this startup toward real cross-border outcomes.
Rules:
- Do not use emoji anywhere in the output.
- At least 3 quests must target a country other than the startup's home country.
- Mix types so the 5 quests climb the ladder: connect, meeting, programme, poc, partnership, funding. Include at least one poc or partnership.
- Each quest must be specific and doable in 2-4 weeks.
- Use these exact XP values: connect 20, meeting 50, programme 75, poc 150, partnership 250, funding 400.
- proofRequired = the one screenshot or document that proves completion.
- Only reference programmes/events from the list provided.
Return ONLY a JSON array, no prose, no code fences:
[{"title":"...","why":"one sentence on the outcome it creates","type":"poc","targetCountry":"VN","xp":150,"proofRequired":"...","eventId":"optional id from list"}]
Startup: ${JSON.stringify(startup)}
Programmes and events: ${JSON.stringify(catalog)}`;
}

/** Keep only well-formed quests; XP always comes from our table, not the model. */
function validateQuests(value: unknown, eventIds: Set<string>): QuestDraft[] {
  if (!Array.isArray(value)) throw new Error("Expected a JSON array of quests.");

  const quests: QuestDraft[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const type = String(q.type ?? "").toLowerCase() as QuestType;
    const country = String(q.targetCountry ?? "").toUpperCase() as Country;
    if (!(type in XP_BY_TYPE) || !(country in COUNTRY_NAMES)) continue;
    if (typeof q.title !== "string" || !q.title.trim()) continue;

    quests.push({
      title: q.title.trim(),
      why: typeof q.why === "string" ? q.why.trim() : "",
      type,
      targetCountry: country,
      xp: XP_BY_TYPE[type],
      proofRequired:
        typeof q.proofRequired === "string" && q.proofRequired.trim()
          ? q.proofRequired.trim()
          : "Screenshot or document proving completion",
      eventId: typeof q.eventId === "string" && eventIds.has(q.eventId) ? q.eventId : undefined,
    });
  }

  if (quests.length < 3) throw new Error(`Only ${quests.length} valid quests in the reply.`);
  return quests.slice(0, QUEST_COUNT);
}

function withIds(startup: Startup, drafts: QuestDraft[]): Quest[] {
  return drafts.map((draft) => ({
    ...draft,
    id: `${startup.id}-${crypto.randomUUID().slice(0, 8)}`,
    startupId: startup.id,
    status: "open",
  }));
}

export async function POST(request: Request) {
  const demo = new URL(request.url).searchParams.get("demo") === "1";

  let body: GenerateBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const { startup, catalog } = body ?? {};
  if (!startup?.id || !startup?.name || !catalog) {
    return Response.json({ error: "Missing startup or catalog." }, { status: 400 });
  }

  // ?demo=1: skip Gemma entirely and return the canned quest list instantly.
  if (demo) {
    return Response.json({ quests: withIds(startup, fallback.quests), source: "demo" });
  }

  const eventIds = new Set((catalog.events ?? []).map((e) => e.id));

  try {
    const drafts = await generateJson([buildPrompt(startup, catalog)], (value) =>
      validateQuests(value, eventIds),
    );
    return Response.json({ quests: withIds(startup, drafts), source: "gemma" });
  } catch (error) {
    // ?demo=1: never fail on stage, fall back to the canned quest list.
    if (demo) {
      return Response.json({ quests: withIds(startup, fallback.quests), source: "fallback" });
    }
    const message =
      error instanceof GemmaError ? error.message : "Something went wrong generating quests.";
    return Response.json({ error: message }, { status: 502 });
  }
}
