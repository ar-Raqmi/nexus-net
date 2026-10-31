"use client";

import { useState } from "react";
import type { NeedOption, NeedsAnswers } from "@/lib/needs";
import type { Startup } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

export function useNeedsAnalysis(startup: Startup | null) {
  const [status, setStatus] = useState<Status>("idle");
  const [options, setOptions] = useState<NeedOption[]>([]);
  const [source, setSource] = useState<"gemma" | "template">("gemma");
  const [error, setError] = useState<string | null>(null);

  async function analyze(answers: NeedsAnswers, blocker: string) {
    if (!startup || status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/needs/analyze${isDemo() ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup, answers, blocker }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        options?: NeedOption[];
        source?: "gemma" | "template";
        error?: string;
      };
      if (!res.ok || !data.options) throw new Error(data.error ?? `Analysis failed (${res.status}).`);
      setOptions(data.options);
      setSource(data.source ?? "gemma");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setOptions([]);
    setError(null);
  }

  return { analyze, reset, status, options, source, error, demo: isDemo() };
}

// Pass ?demo=1 through from the page URL so the API skips Gemma.
function isDemo() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1";
}
