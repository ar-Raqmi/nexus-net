// Server-only helpers for calling Gemma via the Gemini API. Never import from client components.
import { GoogleGenAI, type PartUnion } from "@google/genai";

const TIMEOUT_MS = 45_000;

export class GemmaError extends Error {}

function getConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMMA_MODEL;
  if (!apiKey) throw new GemmaError("GEMINI_API_KEY is not set on the server.");
  if (!model) throw new GemmaError("GEMMA_MODEL is not set on the server.");
  return { apiKey, model };
}

/** Strip ``` fences and any prose around the first JSON array/object, then parse. */
export function parseJsonLoose(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = unfenced.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model output.");
  const close = unfenced[start] === "[" ? "]" : "}";
  const end = unfenced.lastIndexOf(close);
  if (end <= start) throw new Error("Unterminated JSON in model output.");
  return JSON.parse(unfenced.slice(start, end + 1));
}

/**
 * Send a prompt (text and optional inline image parts) to Gemma and parse a JSON reply.
 * `validate` turns the parsed value into the typed result or throws. One retry on any failure.
 */
export async function generateJson<T>(
  parts: PartUnion[],
  validate: (value: unknown) => T,
): Promise<T> {
  const { apiKey, model } = getConfig();
  const ai = new GoogleGenAI({ apiKey });

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: parts.map((p) => (typeof p === "string" ? { text: p } : p)) }],
        config: { abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemma.");
      return validate(parseJsonLoose(text));
    } catch (error) {
      lastError = error;
      console.error(`[gemma] attempt ${attempt + 1} failed:`, error);
    }
  }
  throw new GemmaError(
    `Gemma didn't return a usable answer${
      lastError instanceof Error ? ` (${lastError.message.slice(0, 160)})` : ""
    }. Please try again.`,
  );
}
