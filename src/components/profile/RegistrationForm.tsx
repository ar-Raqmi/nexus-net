"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PixelIcon from "@/components/PixelIcon";
import { COUNTRY_NAMES } from "@/lib/game";
import type { CompanyProfile, Startup } from "@/lib/types";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { selectStartup } from "@/store/selectors";
import { getDemoCompany } from "@/lib/demoCompany";
import OnboardingSteps from "./OnboardingSteps";
import PassportCover, { type PassportData } from "./PassportCover";

const FIELD =
  "w-full min-w-0 rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-[15px] font-normal text-ink transition placeholder:text-subtle hover:border-ink/20 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15";
const LABEL = "flex flex-col gap-2 text-sm font-bold text-ink";
const REQUIRED = ["legalName", "registrationNumber", "website", "sector", "description"] as const;

export default function RegistrationForm() {
  const hydrated = useHasHydrated();
  const currentId = useGameStore(s => s.currentStartupId);
  const startups = useGameStore(s => s.startups);
  const profiles = useGameStore(s => s.companyProfiles);
  if (!hydrated) return <p className="py-16 text-center text-muted">Loading company registration…</p>;
  return <CompanyForm key={currentId ?? "new-company"} startup={selectStartup(startups, currentId)} profile={currentId ? profiles[currentId] : undefined} />;
}

function readForm(form: HTMLFormElement) {
  const data = new FormData(form);
  return Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)])) as Record<string, string>;
}

function CompanyForm({ startup, profile }: { startup: Startup | null; profile?: CompanyProfile }) {
  const router = useRouter();
  const demoCompany = getDemoCompany(startup?.id ?? "paylah-lite");
  const seededCompany = startup ? getDemoCompany(startup.id) : undefined;
  const save = useGameStore(s => s.saveCompanyProfile);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [sampleFilled, setSampleFilled] = useState(false);

  const defaults = {
    legalName: profile?.legalName ?? startup?.name ?? "",
    registrationNumber: profile?.registrationNumber ?? seededCompany?.registrationNumber ?? "",
    country: profile?.country ?? startup?.country ?? "MY",
    website: profile?.website ?? seededCompany?.website ?? "",
    sector: profile?.sector ?? startup?.sector ?? "",
    stage: profile?.stage ?? startup?.stage ?? "pre-seed",
    description: profile?.description ?? startup?.description ?? "",
  };
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const sync = () => formRef.current && setValues(readForm(formRef.current));

  const ready = REQUIRED.filter(name => values[name]?.trim()).length;
  const preview: PassportData = {
    startupId: startup?.id ?? "",
    legalName: values.legalName ?? "",
    registrationNumber: values.registrationNumber ?? "",
    country: (values.country as PassportData["country"]) ?? "MY",
    sector: values.sector ?? "",
    stage: (values.stage as PassportData["stage"]) ?? "pre-seed",
  };

  function useSample() {
    if (!demoCompany) return;
    for (const [name, value] of Object.entries(demoCompany)) {
      const field = formRef.current?.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) field.value = value;
    }
    sync();
    setSampleFilled(true);
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
      const demo = new URLSearchParams(window.location.search).get("demo") === "1";
      router.push(`/profile${demo ? "?demo=1" : ""}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save your company profile."); }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-up">
        <p className="eyebrow">Nexus Net · Company onboarding</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          {profile ? "Update company details" : "Introduce your company."}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Create your company profile, verify your registration evidence, and receive your network passport. Your passport preview updates as you type.
        </p>
      </header>

      <OnboardingSteps current={1} completed={0} />

      <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr]">
        <form ref={formRef} onSubmit={submit} onChange={sync} className="animate-fade-up rounded-[28px] bg-white p-6 shadow-card sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Company details</h2>
              <p className="mt-1 text-sm text-muted">Use the details shown on your official company document.</p>
            </div>
            <span className="font-score text-sm font-bold text-muted">
              <span className="text-primary">{ready}</span>/{REQUIRED.length} required fields
            </span>
          </div>
          <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-ink/5" aria-hidden="true">
            <span className="block h-full rounded-full bg-signature transition-[width] duration-500" style={{ width: `${(ready / REQUIRED.length) * 100}%` }} />
          </span>

          {demoCompany && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
              <PixelIcon name="sparkle" size={26} />
              <div className="flex-1">
                <strong className="text-sm">Presenting the demo?</strong>
                <p className="mt-0.5 text-xs text-muted">Fill the fictional profile for {demoCompany.legalName}. Choose the verification mode at upload.</p>
              </div>
              <button type="button" className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-primary" onClick={useSample}>
                Use sample company
              </button>
            </div>
          )}
          {sampleFilled && (
            <p className="mt-4 rounded-2xl bg-[#fff9e3] px-4 py-3 text-sm" role="status">
              Sample details filled. Live Gemma is the default; choose Instant simulation at upload for a canned result.
            </p>
          )}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className={LABEL}>Legal company name<input className={FIELD} name="legalName" required maxLength={160} defaultValue={defaults.legalName} autoComplete="organization" placeholder="Company name as registered" /></label>
            <label className={LABEL}>Registration number<input className={`${FIELD} font-score`} name="registrationNumber" required maxLength={80} defaultValue={defaults.registrationNumber} placeholder="Business registration number" /></label>
            <label className={LABEL}>Country of registration<select className={FIELD} name="country" defaultValue={defaults.country}>{Object.entries(COUNTRY_NAMES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
            <label className={LABEL}>Company website<input className={FIELD} name="website" required type="url" maxLength={300} defaultValue={defaults.website} placeholder="https://yourcompany.com" autoComplete="url" /></label>
            <label className={LABEL}>Sector<input className={FIELD} name="sector" required maxLength={80} defaultValue={defaults.sector} placeholder="e.g. Fintech" /></label>
            <label className={LABEL}>Company stage<select className={FIELD} name="stage" defaultValue={defaults.stage}><option value="pre-seed">Pre-seed</option><option value="seed">Seed</option><option value="series-a">Series A</option></select></label>
            <label className={`${LABEL} sm:col-span-2`}>What does your company do?<textarea className={`${FIELD} resize-y`} name="description" required maxLength={2000} rows={4} defaultValue={defaults.description} placeholder="Describe your products, services and the market you serve." /></label>
          </div>

          {profile && (
            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-[#fff9e3] px-4 py-3 text-sm">
              <PixelIcon name="warning" size={18} />
              Changing company details requires a new document review before a passport can be issued again.
            </p>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

          <div className="mt-7 flex items-center justify-between gap-4 border-t border-ink/5 pt-6">
            <Link href="/profile" className="text-sm font-bold text-muted hover:text-ink">Cancel</Link>
            <button type="submit" className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark">
              Save and continue <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <p className="eyebrow">Live preview</p>
          <PassportCover data={preview} state="draft" className="animate-fade-up [animation-delay:120ms]" />
          <p className="text-center text-xs text-muted">
            Prototype registration: your company profile is saved in this browser. No password or live user account is created.
          </p>
        </aside>
      </div>
    </div>
  );
}
