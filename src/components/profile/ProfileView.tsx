"use client";

import { useState } from "react";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import Flag from "@/components/Flag";
import PixelIcon, { type PixelIconName } from "@/components/PixelIcon";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { selectStartup } from "@/store/selectors";
import { isApproved, COUNTRY_NAMES } from "@/lib/game";
import { getDemoEvidence } from "@/lib/demoCompany";
import type { CompanyVerification } from "@/lib/types";
import CompanyPassport from "./CompanyPassport";
import OnboardingSteps from "./OnboardingSteps";
import PassportCover, { STAGE_LABEL } from "./PassportCover";
import ProofDialog from "./ProofDialog";

export default function ProfileView() {
  const hydrated = useHasHydrated();
  const startupId = useGameStore(s => s.currentStartupId);
  const startups = useGameStore(s => s.startups);
  const profiles = useGameStore(s => s.companyProfiles);
  const verifications = useGameStore(s => s.companyVerifications);
  const [showVerification, setShowVerification] = useState(false);
  if (!hydrated) return <p className="py-16 text-center text-muted">Loading company profile…</p>;

  const startup = selectStartup(startups, startupId);
  if (!startup) return <Welcome />;

  const profile = startupId ? profiles[startupId] : undefined;
  const verification = startupId ? verifications[startupId] : undefined;
  const sampleEvidence = profile ? getDemoEvidence(profile) : null;
  const approved = verification && isApproved(verification.verdict) && !!verification.passportId;
  const status = approved
    ? verification.mode === "demo" ? { label: "Demo approval", tone: "bg-yellow text-ink" } : { label: "Passport issued", tone: "bg-green text-white" }
    : verification
      ? { label: "Review needs attention", tone: "bg-[#FFB2B3] text-ink" }
      : profile
        ? { label: "Ready for review", tone: "bg-primary/10 text-primary" }
        : { label: "Profile incomplete", tone: "bg-ink/5 text-muted" };
  const draft = profile ?? {
    startupId: startup.id, legalName: startup.name, registrationNumber: "", country: startup.country,
    sector: startup.sector, stage: startup.stage,
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="animate-fade-up flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <CompanyLogo id={startup.id} name={profile?.legalName ?? startup.name} size={68} className="rounded-2xl shadow-card" />
          <div className="min-w-0">
            <p className="eyebrow">Company workspace</p>
            <h1 className="mt-1 truncate font-display text-3xl sm:text-4xl">{profile?.legalName ?? startup.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-card">
                <Flag country={startup.country} size={12} /> {COUNTRY_NAMES[startup.country]}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 shadow-card">{startup.sector}</span>
              <span className="rounded-full bg-white px-2.5 py-1 shadow-card">{STAGE_LABEL[startup.stage]}</span>
              <span className={`rounded-full px-2.5 py-1 ${status.tone}`}>{status.label}</span>
            </div>
          </div>
        </div>
        <Link
          href="/register"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-bold text-ink shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          {profile ? "Edit company details" : "Complete company details"}
        </Link>
      </header>

      <OnboardingSteps current={approved ? 3 : profile ? 2 : 1} completed={approved ? 3 : profile ? 1 : 0} />

      {approved && profile ? (
        <>
          <CompanyPassport profile={profile} verification={verification} />
          {verification.mode === "demo" && (
            <div className="flex flex-col gap-3 rounded-3xl border border-yellow bg-[#fff9e3] p-5 sm:flex-row sm:items-center">
              <PixelIcon name="warning" size={28} />
              <div className="flex-1 text-sm">
                <strong>Demo passport</strong>
                <p className="text-muted">This is a sample result, not an AI-checked company identity.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link href="/profile" className="font-bold text-primary underline">Leave demo mode</Link>
                <button type="button" className="rounded-full border border-ink/10 bg-white px-4 py-2 font-bold hover:border-primary" onClick={() => setShowVerification(true)}>
                  Review another document
                </button>
              </div>
            </div>
          )}
          <NextSteps />
        </>
      ) : (
        <section className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="onboarding-review-main animate-fade-up rounded-[28px] bg-white p-6 shadow-card sm:p-9">
            <p className="eyebrow">{profile ? "Step 02 · Document review" : "Step 01 · Company details"}</p>
            <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
              {!profile ? "Let’s complete your company profile." : verification ? "Let’s try another document." : "Verify your company."}
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              {profile
                ? "Upload an official registration certificate or registry extract. Gemma compares three fields on the document with your profile."
                : "Add your legal company name, registration number and website before submitting a company document."}
            </p>

            {profile && (
              <ul className="mt-6 grid gap-2.5">
                <CheckRow icon="pin" label="Legal company name" value={profile.legalName} />
                <CheckRow icon="target" label="Registration number" value={profile.registrationNumber} />
                <CheckRow icon="compass" label="Country of registration" value={COUNTRY_NAMES[profile.country]} />
              </ul>
            )}

            {verification && <VerdictNotice verification={verification} />}

            <div className="mt-7">
              {profile ? (
                <button
                  type="button"
                  onClick={() => setShowVerification(true)}
                  className="onboarding-primary inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  {verification ? "Upload new company document" : "Verify company"} →
                </button>
              ) : (
                <Link
                  className="onboarding-primary inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark"
                  href="/register"
                >
                  Complete company details →
                </Link>
              )}
            </div>

            {sampleEvidence && (
              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
                <PixelIcon name="bulb" size={26} />
                <div className="text-sm">
                  <p className="font-bold">Presenting the demo?</p>
                  <a className="mt-1 inline-block font-bold text-primary hover:underline" href={sampleEvidence} download>
                    Download sample company record ↗
                  </a>
                  <p className="mt-1 text-xs text-muted">
                    Fictional evidence for your simulation.{" "}
                    <a className="underline" href="/demo-evidence/README.md" target="_blank" rel="noreferrer">View all sample cases</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <PassportCover data={draft} state={profile ? "pending" : "draft"} className="animate-fade-up [animation-delay:120ms]" />
            <div className="rounded-2xl bg-white/80 p-4 text-xs text-muted shadow-card">
              <p className="font-bold text-ink">Your passport, once approved</p>
              <p className="mt-1">
                Use a clear image with the full company name, registration number and jurisdiction visible. Your company passport is issued once the document review is approved.
              </p>
            </div>
          </aside>
        </section>
      )}

      {showVerification && profile && (
        <ProofDialog
          profile={profile}
          onClose={() => {
            setShowVerification(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

function Welcome() {
  return (
    <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="animate-fade-up">
        <p className="eyebrow">Company identity</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] sm:text-5xl">
          A passport for your <span className="text-primary">company.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted">
          Register your company details, pass an AI document review, and get your Nexus Net passport for cross-border quests.
        </p>
        <ol className="mt-7 grid max-w-lg gap-3 text-sm">
          {[
            ["pin", "Tell us who you are", "Legal name, registration number, website."],
            ["target", "Upload one document", "Gemma checks it against your profile."],
            ["gem", "Collect your passport", "Show the network you are verified."],
          ].map(([icon, title, text], i) => (
            <li key={title} className="animate-fade-up flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card" style={{ animationDelay: `${150 + i * 100}ms` }}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper">
                <PixelIcon name={icon as PixelIconName} size={24} />
              </span>
              <span>
                <span className="font-bold">{title}</span>
                <span className="block text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link className="rounded-full bg-primary px-7 py-3.5 font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-primary-dark" href="/register">
            Register company →
          </Link>
          <Link href="/#startups" className="text-sm font-bold text-primary hover:underline">
            Or select a demo startup
          </Link>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-md">
        <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-[28px] bg-signature opacity-60" />
        <PassportCover
          data={{ startupId: "", legalName: "Your company", registrationNumber: "", country: "MY", sector: "Your sector", stage: "seed" }}
          state="draft"
          className="animate-float"
        />
      </div>
    </section>
  );
}

function CheckRow({ icon, label, value }: { icon: PixelIconName; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-paper/70 px-4 py-3">
      <PixelIcon name={icon} size={22} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted">{label}</span>
        <span className="block truncate font-score text-sm font-bold">{value}</span>
      </span>
      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-muted">To check</span>
    </li>
  );
}

function VerdictNotice({ verification }: { verification: CompanyVerification }) {
  const rejected = verification.verdict.decision === "rejected";
  const confidence = Math.round(verification.verdict.confidence * 100);
  return (
    <div role="status" className={`mt-6 rounded-2xl border p-5 ${rejected ? "border-[#FFB2B3] bg-[#FFEBEB]" : "border-yellow bg-[#fff9e3]"}`}>
      <div className="flex items-start gap-3">
        <PixelIcon name={rejected ? "close" : "warning"} size={26} />
        <div className="min-w-0 flex-1">
          <strong>{rejected ? "Document rejected" : "More evidence needed"}</strong>
          <p className="mt-1 text-sm">{verification.verdict.reason}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted">
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white">
              <span className={`block h-full ${rejected ? "bg-[#ef4444]" : "bg-[#ff8d22]"}`} style={{ width: `${confidence}%` }} />
            </span>
            <span>Confidence: {confidence}%</span>
          </div>
          <p className="mt-3 text-xs text-muted">
            Check that the document is a registration certificate and that the name, number and country match your profile exactly.
          </p>
        </div>
      </div>
    </div>
  );
}

const NEXT_STEPS: { href: string; icon: PixelIconName; title: string; text: string }[] = [
  { href: "/needs", icon: "bulb", title: "Map your needs", text: "Tell Gemma what your company needs next." },
  { href: "/quests", icon: "rocket", title: "Generate quests", text: "Cross-border moves that earn XP." },
  { href: "/events", icon: "pin", title: "Find events", text: "Rooms where connections become outcomes." },
];

function NextSteps() {
  return (
    <section aria-labelledby="next-steps-title">
      <h2 id="next-steps-title" className="font-display text-2xl">Where to next?</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {NEXT_STEPS.map((step, i) => (
          <li key={step.href} className="animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
            <Link href={step.href} className="group flex h-full flex-col gap-3 rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-xl">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-paper transition group-hover:rotate-6">
                <PixelIcon name={step.icon} size={26} />
              </span>
              <span className="font-bold">{step.title} <span className="text-primary transition group-hover:translate-x-1 inline-block">→</span></span>
              <span className="text-sm text-muted">{step.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
