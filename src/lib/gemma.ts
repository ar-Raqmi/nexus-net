// Server-only helpers for calling Gemma. Never import from client components.
// Default provider is the Gemini API; set GEMMA_PROVIDER=openrouter to test through OpenRouter.
import { GoogleGenAI, ThinkingLevel, type PartUnion } from "@google/genai";

const TIMEOUT_MS = 45_000;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export class GemmaError extends Error {}

/** Default cap for JSON API request bodies (1 MB). */
export const MAX_JSON_BODY_BYTES = 1_000_000;

export class RequestBodyError extends Error {}

/**
 * Read and parse a JSON request body with a hard size limit, so an oversized or
 * unbounded body cannot exhaust memory. Throws RequestBodyError with a safe
 * message; callers map that to a 400/413 response.
 */
export async function readJsonBody(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestBodyError("Request body is too large.");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("Request body must be JSON.");

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError("Request body is too large.");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError("Request body must be JSON.");
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RequestBodyError("Request body must be JSON.");
  }
}

export interface GemmaOptions {
  /** Temperature 0 for steadier answers on vision checks. */
  fast?: boolean;
}

type Completer = (parts: PartUnion[]) => Promise<string>;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new GemmaError(`${name} is not set on the server.`);
  return value;
}

function geminiCompleter({ fast }: GemmaOptions): Completer {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = requireEnv("GEMMA_MODEL");
  return async (parts) => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: parts.map((p) => (typeof p === "string" ? { text: p } : p)) }],
      config: {
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
        // Default Gemma 4 thinking takes ~40s for a quest list, close to the timeout;
        // minimal thinking returns the same JSON in ~10s.
        ...(model.startsWith("gemma-4-") ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } } : {}),
        ...(fast ? { temperature: 0 } : {}),
      },
    });
    return response.text ?? "";
  };
}

function toOpenRouterPart(part: PartUnion) {
  if (typeof part === "string") return { type: "text", text: part };
  if (part.inlineData?.data) {
    const { mimeType, data } = part.inlineData;
    return { type: "image_url", image_url: { url: `data:${mimeType};base64,${data}` } };
  }
  if (part.text) return { type: "text", text: part.text };
  throw new Error("Unsupported part for OpenRouter.");
}

function openRouterCompleter(): Completer {
  const apiKey = requireEnv("OPENROUTER_API_KEY");
  const model = requireEnv("GEMMA_MODEL");
  return async (parts) => {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [{ role: "user", content: parts.map(toOpenRouterPart) }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}.`);
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  };
}

function createCompleter(options: GemmaOptions): Completer {
  return process.env.GEMMA_PROVIDER === "openrouter" ? openRouterCompleter() : geminiCompleter(options);
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
  options: GemmaOptions = {},
): Promise<T> {
  const complete = createCompleter(options);

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await complete(parts);
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
