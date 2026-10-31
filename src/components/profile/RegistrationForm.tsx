"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COUNTRY_NAMES } from "@/lib/game";
import type { CompanyProfile, Startup } from "@/lib/types";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { selectStartup } from "@/store/selectors";
import demoCompany from "../../../public/demo-evidence/profile-values.json";

export default function RegistrationForm() {
  const hydrated = useHasHydrated();
  const currentId = useGameStore(s => s.currentStartupId);
  const startups = useGameStore(s => s.startups);
  const profiles = useGameStore(s => s.companyProfiles);
  if (!hydrated) return <p className="py-16 text-center text-muted">Loading company registration…</p>;
  return <CompanyForm key={currentId ?? "new-company"} startup={selectStartup(startups, currentId)} profile={currentId ? profiles[currentId] : undefined} />;
}

function CompanyForm({ startup, profile }: { startup: Startup | null; profile?: CompanyProfile }) {
  const router = useRouter();
  const save = useGameStore(s => s.saveCompanyProfile);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [sampleMode, setSampleMode] = useState(false);
  function useSample() {
    for (const [name, value] of Object.entries(demoCompany)) {
      const field = formRef.current?.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) field.value = value;
    }
    setSampleMode(true);
    setError("");
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      save({
        startupId: startup?.id ?? `company-${crypto.randomUUID()}`,
        legalName: String(data.get("legalName") ?? ""), registrationNumber: String(data.get("registrationNumber") ?? ""),
        website: String(data.get("website") ?? ""), country: data.get("country") as CompanyProfile["country"],
        sector: String(data.get("sector") ?? ""), stage: data.get("stage") as CompanyProfile["stage"], description: String(data.get("description") ?? ""),
      });
      const demo = sampleMode || new URLSearchParams(window.location.search).get("demo") === "1";
      router.push(`/profile${demo ? "?demo=1" : ""}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save your company profile."); }
  }
  return <div className="onboarding-shell">
    <div className="onboarding-heading"><p className="passport-eyebrow">Nexus Net / Company onboarding</p><h1>{profile ? "Update company details" : "Introduce your company."}</h1><p>Create your company profile, verify your registration evidence, and receive your network passport.</p></div>
    <ol className="onboarding-steps" aria-label="Company registration progress"><li aria-current="step"><b>01</b> Company details</li><li><b>02</b> Document review</li><li><b>03</b> Company passport</li></ol>
    <form ref={formRef} onSubmit={submit} className="company-form">
      <div className="company-form-heading"><h2>Company details</h2><p>Use the details shown on your official company document.</p></div>
      {(!startup || startup.id === "paylah-lite") && <div className="company-demo-shortcut"><div><strong>Presenting the demo?</strong><p>Fill a fictional company profile and use labelled sample approval.</p></div><button type="button" className="onboarding-secondary" onClick={useSample}>Use sample company</button></div>}
      {sampleMode && <p className="onboarding-notice" role="status">Demo simulation enabled. Document approval is a sample result without an AI call.</p>}
      <div className="company-form-grid">
        <label>Legal company name<input name="legalName" required maxLength={160} defaultValue={profile?.legalName ?? startup?.name ?? ""} autoComplete="organization" placeholder="Company name as registered" /></label>
        <label>Registration number<input name="registrationNumber" required maxLength={80} defaultValue={profile?.registrationNumber ?? ""} placeholder="Business registration number" /></label>
        <label>Country of registration<select name="country" defaultValue={profile?.country ?? startup?.country ?? "MY"}>{Object.entries(COUNTRY_NAMES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label>Company website<input name="website" required type="url" maxLength={300} defaultValue={profile?.website ?? ""} placeholder="https://yourcompany.com" autoComplete="url" /></label>
        <label>Sector<input name="sector" required maxLength={80} defaultValue={profile?.sector ?? startup?.sector ?? ""} placeholder="e.g. Fintech" /></label>
        <label>Company stage<select name="stage" defaultValue={profile?.stage ?? startup?.stage ?? "pre-seed"}><option value="pre-seed">Pre-seed</option><option value="seed">Seed</option><option value="series-a">Series A</option></select></label>
        <label className="company-form-wide">What does your company do?<textarea name="description" required maxLength={2000} rows={4} defaultValue={profile?.description ?? startup?.description ?? ""} placeholder="Describe your products, services and the market you serve." /></label>
      </div>
      {profile && <p className="onboarding-notice">Changing company details requires a new document review before a passport can be issued again.</p>}
      {error && <p role="alert" className="text-sm text-red-700 mt-4">{error}</p>}
      <div className="company-form-actions"><Link href="/profile">Cancel</Link><button type="submit">Save and continue <span aria-hidden>→</span></button></div>
    </form>
    <p className="onboarding-local-note">Prototype registration: your company profile is saved in this browser. No password or live user account is created.</p>
  </div>;
}
