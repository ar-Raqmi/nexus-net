"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { CompanyProfile, CompanyVerification } from "@/lib/types";
import { isApproved } from "@/lib/game";
import { resizeProof } from "@/lib/resizeProof";
import { useGameStore } from "@/store/useGameStore";

export default function ProofDialog({ profile, onClose }: { profile: CompanyProfile; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const selection = useRef(0);
  const [image, setImage] = useState<Awaited<ReturnType<typeof resizeProof>> | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
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
    setBusy(true); setError("");
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 65_000);
    try {
      const demo = new URLSearchParams(window.location.search).get("demo") === "1";
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
  return (
    <dialog ref={dialog} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] overflow-y-auto rounded-3xl bg-paper p-6 sm:p-8 shadow-xl backdrop:bg-ink/60" aria-labelledby="proof-title">
      <div className="flex justify-between items-start gap-4">
        <div><p className="text-xs uppercase tracking-widest font-bold text-primary">Company registration</p><h2 id="proof-title" className="text-2xl font-bold mt-2">{result ? "Company review result" : "Verify your company"}</h2></div>
        <button type="button" onClick={onClose} aria-label="Close company verification" className="rounded-full bg-white px-3 py-2">✕</button>
      </div>
      <p className="mt-4 font-semibold">{profile.legalName}</p>
      {!result ? <>
        <p className="mt-2 text-sm text-muted">Upload an incorporation certificate or business registry extract showing your legal company name, registration number and country.</p>
        <label className="block mt-5 rounded-2xl border-2 border-dashed border-primary/30 bg-white p-5 text-sm font-semibold">Company document image
          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => void choose(e.target.files?.[0])} className="block mt-3 w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary" />
          <span className="block mt-2 text-xs font-normal text-muted">PNG, JPEG or WebP · up to 10 MB</span>
        </label>
        {image && <div className="mt-4 rounded-xl bg-white p-2"><Image unoptimized src={image.preview} width={1280} height={900} alt="Selected company document preview" className="max-h-64 w-full object-contain" /></div>}
        {profile.registrationNumber === "MY-DEMO-2026-001" && <a className="block mt-3 text-xs text-primary underline" href="/demo-evidence/01-matching-company-record.png" download>Download sample company record</a>}
        <p className="mt-4 text-xs text-muted">Your image is sent to Google AI for this check. Only the verdict is saved in this browser.</p>
        {preparing && <p role="status" className="mt-3 text-sm">Preparing image…</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <button type="button" onClick={() => void verify()} disabled={!image || preparing || busy} className="mt-5 w-full rounded-full bg-primary px-6 py-3 font-bold text-white disabled:opacity-40">{busy ? "Checking your evidence…" : "Verify company"}</button>
        {busy && <p role="status" className="text-center text-xs text-muted mt-3">This can take up to a minute.</p>}
      </> : <div className="mt-5 space-y-4" aria-live="polite">
        {result.mode === "demo" && <p className="rounded-xl bg-yellow p-3 text-sm font-bold">Demo result · image was not checked by AI</p>}
        <div className={`rounded-2xl p-5 ${approved ? "bg-green/10" : "bg-yellow/25"}`}>
          <h3 className="text-xl font-bold">{approved ? "Company document approved ✓" : result.verdict.decision === "rejected" ? "Document rejected" : "More evidence needed"}</h3>
          <p className="mt-2 text-sm">{result.verdict.reason}</p>
          <p className="mt-3 text-xs text-muted">Confidence: {Math.round(result.verdict.confidence * 100)}% · {result.verdict.documentType}</p>
        </div>
        <p className="text-sm">{approved ? "Your onboarding is complete. Your company passport is ready." : "Upload a clearer or matching registration document to continue onboarding."}</p>
        <button onClick={onClose} className="w-full rounded-full bg-primary py-3 text-white font-bold">{approved ? "View company passport" : "Back to company profile"}</button>
      </div>}
    </dialog>
  );
}
