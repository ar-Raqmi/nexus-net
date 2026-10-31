"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PixelIcon from "@/components/PixelIcon";
import type { CompanyProfile, CompanyVerification } from "@/lib/types";
import { isApproved } from "@/lib/game";
import { getDemoEvidence } from "@/lib/demoCompany";
import { resizeProof } from "@/lib/resizeProof";
import { useGameStore } from "@/store/useGameStore";

export default function ProofDialog({ profile, onClose }: { profile: CompanyProfile; onClose: () => void }) {
  const sampleEvidence = getDemoEvidence(profile);
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const selection = useRef(0);
  const [image, setImage] = useState<Awaited<ReturnType<typeof resizeProof>> | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "demo">(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1" ? "demo" : "live");
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [busy]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompanyVerification | null>(null);
  const recordVerification = useGameStore(s => s.recordCompanyVerification);
  useEffect(() => {
    dialog.current?.showModal();
    return () => { controller.current?.abort(); };
  }, []);

  async function choose(file?: File) {
    const id = ++selection.current;
    setImage(null); setError(""); setPreparing(!!file);
    if (!file) return;
    try { const prepared = await resizeProof(file); if (id === selection.current) setImage(prepared); }
    catch (e) { if (id === selection.current) setError(e instanceof Error ? e.message : "Could not read this image."); }
    finally { if (id === selection.current) setPreparing(false); }
  }

  async function verify() {
    if (!image || busy) return;
    setBusy(true); setError(""); setElapsed(0);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 30_000);
    try {
      const demo = mode === "demo";
      const response = await fetch(`/api/company/verify${demo ? "?demo=1" : ""}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, imageBase64: image.imageBase64, mimeType: image.mimeType }),
        signal: controller.current.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Company verification failed.");
      recordVerification(data.verification);
      setResult(data.verification);
    } catch (e) {
      if (dialog.current?.open) setError(e instanceof Error && e.name !== "AbortError" ? e.message : "The check timed out. Please try again.");
    } finally { clearTimeout(timeout); setBusy(false); }
  }

  const approved = result && isApproved(result.verdict);
  const step = result ? 3 : image ? 2 : 1;
  const confidence = result ? Math.round(result.verdict.confidence * 100) : 0;

  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-[28px] bg-paper p-0 shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
      aria-labelledby="proof-title"
    >
      <div className="bg-grid-dark px-6 pb-6 pt-6 text-white sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow">Company registration</p>
            <h2 id="proof-title" className="mt-2 font-display text-2xl">{result ? "Company review result" : "Verify your company"}</h2>
            <p className="mt-1 truncate font-semibold text-white/80">{profile.legalName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close company verification" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
            <PixelIcon name="close" size={18} />
          </button>
        </div>
        <ol className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-bold uppercase tracking-wider" aria-label="Verification steps">
          {["Choose mode", "Add document", "Result"].map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? "step" : undefined} className="flex flex-col gap-1.5">
              <span className={`h-1 rounded-full ${i + 1 <= step ? "bg-signature" : "bg-white/15"}`} />
              <span className={i + 1 <= step ? "text-white" : "text-white/40"}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="p-6 sm:p-8">
        {!result ? <>
          <p className="text-sm text-muted">Upload an incorporation certificate or business registry extract showing your legal company name, registration number and country.</p>

          <fieldset className="mt-5 grid gap-3 sm:grid-cols-2" disabled={busy}>
            <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Verification mode</legend>
            <ModeOption checked={mode === "live"} onChange={() => setMode("live")} label="Live Gemma AI" text="Sends your document to the configured Gemma model." icon="sparkle" />
            <ModeOption checked={mode === "demo"} onChange={() => setMode("demo")} label="Instant simulation (no AI)" text="Returns a labelled canned approval for your presentation." icon="gamepad" />
          </fieldset>

          <label className="mt-5 block rounded-2xl border-2 border-dashed border-primary/30 bg-white p-5 text-sm font-bold transition hover:border-primary">
            Company document image
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => void choose(e.target.files?.[0])} className="mt-3 block w-full text-sm font-normal file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-bold file:text-white" />
            <span className="mt-2 block text-xs font-normal text-muted">PNG, JPEG or WebP · up to 10 MB</span>
          </label>

          {image && (
            <div className="relative mt-4 overflow-hidden rounded-2xl bg-white p-2 shadow-card">
              <Image unoptimized src={image.preview} width={1280} height={900} alt="Selected company document preview" className="max-h-64 w-full object-contain" />
              {busy && <span className="doc-scan-line" aria-hidden="true" />}
            </div>
          )}
          {sampleEvidence && <a className="mt-3 inline-block text-xs font-bold text-primary underline" href={sampleEvidence} download>Download sample company record</a>}
          <p className="mt-4 text-xs text-muted">{mode === "live" ? "Your image is sent to Gemma for this check. Only the verdict is saved in this browser." : "Simulation only. Your image is not sent to Gemma."}</p>
          {preparing && <p role="status" className="mt-3 text-sm">Preparing image…</p>}
          {error && <p role="alert" className="mt-4 rounded-2xl bg-[#FFEBEB] px-4 py-3 text-sm text-red-800">{error}</p>}
          <button type="button" onClick={() => void verify()} disabled={!image || preparing || busy} className="mt-5 w-full rounded-full bg-primary px-6 py-3.5 font-bold text-white shadow-card transition hover:bg-primary-dark disabled:opacity-40">
            {busy ? mode === "live" ? "Gemma is checking your document…" : "Creating simulation result…" : "Verify company"}
          </button>
          {busy && <p role="status" className="mt-3 text-center text-xs text-muted">{mode === "live" ? `Live Gemma request · ${elapsed}s elapsed` : "Instant simulation · no AI call"}</p>}
        </> : <div className="space-y-4" aria-live="polite">
          {result.mode === "demo" && <p className="rounded-xl bg-yellow p-3 text-sm font-bold">Demo result · image was not checked by AI</p>}
          {result.mode === "live" && <p className="text-xs font-semibold text-primary">Gemma AI response{result.model ? ` · ${result.model}` : ""}{result.durationMs != null ? ` · ${(result.durationMs / 1000).toFixed(1)}s` : ""}</p>}
          <div className={`relative overflow-hidden rounded-2xl border p-5 ${approved ? "border-green/30 bg-green/10" : "border-yellow bg-yellow/25"}`}>
            <span className={`result-stamp ${approved ? "is-approved" : "is-rejected"}`} aria-hidden="true">{approved ? "Approved" : result.verdict.decision === "rejected" ? "Rejected" : "Unclear"}</span>
            <h3 className="pr-24 text-xl font-bold">{approved ? "Company document approved ✓" : result.verdict.decision === "rejected" ? "Document rejected" : "More evidence needed"}</h3>
            <p className="mt-2 pr-4 text-sm">{result.verdict.reason}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white" aria-hidden="true">
                <span className={`block h-full ${approved ? "bg-green" : "bg-[#ff8d22]"}`} style={{ width: `${confidence}%` }} />
              </span>
              Confidence: {confidence}% · {result.verdict.documentType}
            </div>
          </div>
          <p className="text-sm">{approved ? "Your onboarding is complete. Your company passport is ready." : "Upload a clearer or matching registration document to continue onboarding."}</p>
          <button onClick={onClose} className="w-full rounded-full bg-primary py-3.5 font-bold text-white shadow-card transition hover:bg-primary-dark">{approved ? "View company passport" : "Back to company profile"}</button>
        </div>}
      </div>
    </dialog>
  );
}

function ModeOption({ checked, onChange, label, text, icon }: { checked: boolean; onChange: () => void; label: string; text: string; icon: "sparkle" | "gamepad" }) {
  return (
    <label className={`flex cursor-pointer flex-col gap-2 rounded-2xl border-2 bg-white p-4 transition ${checked ? "border-primary shadow-[0_0_0_4px_rgb(64_92_238/0.12)]" : "border-ink/5 hover:border-ink/15"}`}>
      <span className="flex items-center gap-2 text-sm font-bold">
        <input type="radio" name="verification-mode" aria-label={label} checked={checked} onChange={onChange} className="accent-primary" />
        <PixelIcon name={icon} size={18} />
        {label}
      </span>
      <span className="text-xs text-muted">{text}</span>
    </label>
  );
}
