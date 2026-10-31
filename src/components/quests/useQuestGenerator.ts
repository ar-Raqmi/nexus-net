"use client";

import { useState } from "react";
import type { Quest, Startup } from "@/lib/types";
import { seedCatalog, seedEvents } from "@/seed";
import { useGameStore } from "@/store/useGameStore";

type Status = "idle" | "loading" | "error";

export function useQuestGenerator(startup: Startup | null) {
  const replaceOpenQuests = useGameStore((s) => s.replaceOpenQuests);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  async function generate() {
    if (!startup || status === "loading") return;
    setStatus("loading");
    setError(null);

    // Pass ?demo=1 through from the page URL so the API can fall back to canned quests.
    const demo = new URLSearchParams(window.location.search).get("demo") === "1";

    try {
      const res = await fetch(`/api/quests/generate${demo ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup,
          catalog: { programmes: seedCatalog, events: seedEvents },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        quests?: Quest[];
        source?: "gemma" | "fallback";
        error?: string;
      };
      if (!res.ok || !data.quests) {
        throw new Error(data.error ?? `Quest generation failed (${res.status}).`);
      }
      replaceOpenQuests(startup.id, data.quests);
      setUsedFallback(data.source === "fallback");
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quest generation failed.");
      setStatus("error");
    }
  }

  return { generate, status, error, usedFallback };
}
