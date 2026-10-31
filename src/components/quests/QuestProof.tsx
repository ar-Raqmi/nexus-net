"use client";

import { useState } from "react";
import { getLevel } from "@/lib/game";
import { resizeProof } from "@/lib/resizeProof";
import type { Quest, Verdict } from "@/lib/types";
import { selectStartup } from "@/store/selectors";
import { useGameStore } from "@/store/useGameStore";

type Result = { verdict: Verdict; approved: boolean; mode: "live" | "demo"; levelUp?: string };

/** "Submit proof" button + modal: upload image → Gemma verdict → XP if approved. */
export default function QuestProof({ quest }: { quest: Quest }) {
  const [open, setOpen] = useState(false);

  if (quest.status === "verified") return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
      >
        {quest.status === "rejected" ? "Try new proof" : "Submit proof"}
      </button>
      {open && <ProofModal quest={quest} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProofModal({ quest, onClose }: { quest: Quest; onClose: () => void }) {
  const startups = useGameStore((s) => s.startups);
  const completeQuest = useGameStore((s) => s.completeQuest);
  const updateQuest = useGameStore((s) => s.updateQuest);
  const startup = selectStartup(startups, quest.startupId);

  const [image, setImage] = useState<Awaited<ReturnType<typeof resizeProof>> | null>(null);
  const [simulate, setSimulate] = useState(
    () => new URLSearchParams(window.location.search).get("demo") === "1",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function choose(file: File | undefined) {
    if (!file) return;
    setError("");
    setResult(null);
    try {
      setImage(await resizeProof(file));
    } catch (err) {
      setImage(null);
      setError(err instanceof Error ? err.message : "Could not read that image.");
    }
  }

  async function submit() {
    if (!image || !startup) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/proof/verify${simulate ? "?demo=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quest, startup, imageBase64: image.imageBase64, mimeType: image.mimeType }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.verdict) throw new Error(data.error ?? `Proof check failed (${res.status}).`);

      const verdict = data.verdict as Verdict;
      let levelUp: string | undefined;
      if (data.approved) {
        // XP is credited on "Collect": completing moves the card, which would unmount this modal.
        const before = getLevel(startup.xp).name;
        const after = getLevel(startup.xp + quest.xp).name;
        if (after !== before) levelUp = after;
      } else {
        updateQuest(quest.id, {
          verdict,
          status: verdict.decision === "rejected" ? "rejected" : "open",
        });
      }
      setResult({ verdict, approved: data.approved, mode: data.mode, levelUp });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proof check failed.");
    } finally {
      setBusy(false);
    }
  }

  function close() {
    if (result?.approved) completeQuest(quest.id, { verdict: result.verdict });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`proof-${quest.id}`}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-subtle">Submit proof</p>
            <h2 id={`proof-${quest.id}`} className="text-xl font-bold leading-snug">
              {quest.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-ink">Needed:</span> {quest.proofRequired}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full px-2 text-2xl leading-none text-subtle hover:text-ink"
          >
            ×
          </button>
        </div>

        {result ? (
          <>
            <VerdictPanel result={result} xp={quest.xp} />
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-primary px-6 py-3 font-bold text-white hover:brightness-110"
            >
              {result.approved ? `Collect +${quest.xp} XP` : "Close"}
            </button>
          </>
        ) : (
          <>
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-paper p-5 text-center text-sm text-muted hover:border-primary">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                <img src={image.preview} alt="Proof preview" className="max-h-56 rounded-lg object-contain" />
              ) : (
                <span className="text-3xl" aria-hidden>
                  📎
                </span>
              )}
              <span className="font-semibold text-ink">
                {image ? "Choose a different image" : "Choose a screenshot or photo"}
              </span>
              <span>PNG, JPEG or WebP</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => choose(e.target.files?.[0])}
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={simulate} onChange={(e) => setSimulate(e.target.checked)} />
              <span>
                <span className="font-semibold">Simulation (no AI)</span>{" "}
                <span className="text-muted">for demos when Gemma is unavailable</span>
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-2xl bg-[#FFEBEB] px-4 py-3 text-sm">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={!image || busy}
              className="rounded-full bg-primary px-6 py-3 font-bold text-white hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Gemma is checking your proof…" : simulate ? "Submit (simulation)" : "Check with Gemma"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const DECISION_STYLE = {
  approved: { label: "Approved", className: "bg-green text-white", icon: "✅" },
  rejected: { label: "Rejected", className: "bg-[#FFB2B3] text-ink", icon: "❌" },
  unclear: { label: "Unclear", className: "bg-yellow text-ink", icon: "🤔" },
};

function VerdictPanel({ result, xp }: { result: Result; xp: number }) {
  const { verdict, approved, mode, levelUp } = result;
  const style = DECISION_STYLE[verdict.decision];

  return (
    <div className="flex flex-col gap-3">
      {mode === "demo" && (
        <p className="rounded-full bg-yellow px-3 py-1 text-center text-xs font-bold">
          Simulation: this proof was not checked by AI
        </p>
      )}
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${style.className}`}>
          {style.icon} {style.label}
        </span>
        <span className="font-score text-sm text-muted">
          confidence {Math.round(verdict.confidence * 100)}%
        </span>
      </div>
      <p className="text-ink">{verdict.reason}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-subtle">Document</dt>
        <dd>{verdict.documentType}</dd>
        <dt className="text-subtle">Parties</dt>
        <dd>{verdict.parties.join(", ") || "None found"}</dd>
        {verdict.date && (
          <>
            <dt className="text-subtle">Date</dt>
            <dd>{verdict.date}</dd>
          </>
        )}
      </dl>

      {approved ? (
        <div className="mt-2 flex flex-col items-center gap-1 rounded-2xl bg-signature p-4 text-center">
          <span className="font-pixel text-6xl leading-none motion-safe:animate-float">+{xp} XP</span>
          {levelUp && <span className="font-display text-xl">Level up: {levelUp}!</span>}
          <span className="text-sm font-semibold">Counted as a verified outcome</span>
        </div>
      ) : (
        <p className="rounded-2xl bg-paper p-3 text-sm text-muted">
          {verdict.decision === "approved"
            ? "Gemma leaned towards approving, but the proof didn't name a party or document clearly enough to count. Try a clearer image."
            : "No XP this time. Upload a clearer or more relevant document to try again."}
        </p>
      )}
    </div>
  );
}
