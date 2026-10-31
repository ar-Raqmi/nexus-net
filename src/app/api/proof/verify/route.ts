import { isApproved } from "@/lib/game";
import { GemmaError, generateJson } from "@/lib/gemma";
import { parseVerdict } from "@/lib/proof";
import type { Quest, Startup, Verdict } from "@/lib/types";

// Quest proof (F3): checks evidence for an outcome and decides XP. Separate from
// company identity verification at /api/company/verify, which never grants XP.

const MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BASE64_LENGTH = 8_000_000;

function buildPrompt(quest: Quest, startup: Startup, today: string) {
  return `You verify proof for a Startup ASEAN quest. Look at the attached image and decide if it reasonably proves the quest was completed.
Quest: ${quest.title}
Quest type: ${quest.type}
Proof required: ${quest.proofRequired}
Startup: ${startup.name} (${startup.country})
Today's date: ${today}
Check: correct document type for the proof required; names the startup or founder and a counterpart organisation; counterpart country matches the target country if visible; has a recent date; red flags (blank templates, unrelated images, obvious edits).
Return ONLY JSON, no prose, no code fences:
{"decision":"approved|rejected|unclear","confidence":0.0,"documentType":"...","parties":["..."],"date":"YYYY-MM-DD or null","reason":"one sentence a founder would understand"}`;
}

/**
 * Gemma's confidence is uncalibrated (usually ~1.0), so approval also needs the
 * verdict to name at least one party and a document type, not just clear 0.7.
 */
function countsAsApproved(verdict: Verdict) {
  return isApproved(verdict) && verdict.parties.length > 0 && verdict.documentType.trim().length > 0;
}

export async function POST(request: Request) {
  let body: { quest?: Quest; startup?: Startup; imageBase64?: unknown; mimeType?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid upload request." }, { status: 400 });
  }
  const { quest, startup, imageBase64, mimeType } = body ?? {};
  if (!quest?.title || !quest?.type || !startup?.name) {
    return Response.json({ error: "Missing quest or startup." }, { status: 400 });
  }
  if (
    typeof mimeType !== "string" ||
    !MIME_TYPES.includes(mimeType) ||
    typeof imageBase64 !== "string" ||
    !imageBase64 ||
    imageBase64.length > MAX_BASE64_LENGTH ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)
  ) {
    return Response.json({ error: "Choose a PNG, JPEG or WebP image under 6 MB." }, { status: 400 });
  }

  // Clearly-labelled simulation for demos: no AI call is made.
  if (new URL(request.url).searchParams.get("demo") === "1") {
    const verdict: Verdict = {
      decision: "approved",
      confidence: 0.86,
      documentType: "Simulated proof",
      parties: [startup.name],
      reason: "Simulation only. This proof was not checked by AI.",
    };
    return Response.json({ verdict, approved: true, mode: "demo" });
  }

  const today = new Date().toISOString().slice(0, 10);
  try {
    const verdict = await generateJson(
      [buildPrompt(quest, startup, today), { inlineData: { data: imageBase64, mimeType } }],
      (value) => parseVerdict(JSON.stringify(value)),
      { fast: true },
    );
    return Response.json({ verdict, approved: countsAsApproved(verdict), mode: "live" });
  } catch (error) {
    const message =
      error instanceof GemmaError ? error.message : "Something went wrong checking your proof.";
    return Response.json({ error: message }, { status: 502 });
  }
}
