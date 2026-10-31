"use client";

import { useState } from "react";
import Link from "next/link";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import { selectStartup } from "@/store/selectors";
import { isApproved, COUNTRY_NAMES } from "@/lib/game";
import { getDemoEvidence } from "@/lib/demoCompany";
import CompanyPassport from "./CompanyPassport";
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
  const profile = startupId ? profiles[startupId] : undefined;
  const verification = startupId ? verifications[startupId] : undefined;
  const sampleEvidence = profile ? getDemoEvidence(profile) : null;
  const approved = verification && isApproved(verification.verdict) && !!verification.passportId;
  if (!startup) return <section className="onboarding-shell onboarding-welcome"><p className="passport-eyebrow">Company identity</p><h1>A home for your company.</h1><p>Register your company details, complete a document review, and get your Nexus Net passport.</p><Link className="onboarding-primary" href="/register">Register company →</Link><Link href="/#startups" className="text-sm text-primary">Or select a demo startup</Link></section>;
  return <div className="onboarding-shell profile-shell">
    <header className="profile-page-heading"><div><p className="passport-eyebrow">Your company workspace</p><h1>Company profile</h1><p>Registration details, verification and your company passport.</p></div><Link href="/register" className="onboarding-secondary">{profile ? "Edit company details" : "Complete company details"}</Link></header>
    <ol className="onboarding-steps" aria-label="Company onboarding progress"><li className={profile ? "step-done" : ""}><b>01</b> Company details</li><li className={approved ? "step-done" : ""} aria-current={profile && !approved ? "step" : undefined}><b>02</b> Document review</li><li className={approved ? "step-done" : ""} aria-current={approved ? "step" : undefined}><b>03</b> Company passport</li></ol>
    {approved && profile ? <CompanyPassport profile={profile} verification={verification} /> : <section className="onboarding-review">
      <div className="onboarding-review-main"><span className="onboarding-document-icon" aria-hidden>↗</span><p className="passport-eyebrow">{profile ? "Step 02 / Document review" : "Step 01 / Company details"}</p><h2>{profile ? "Verify your company." : "Let’s complete your company profile."}</h2><p>{profile ? "Upload an official registration certificate or registry extract. We’ll compare the company name, registration number and country with your profile." : "Add your legal company name, registration number and website before submitting a company document."}</p>
        {verification && <div className="onboarding-notice" role="status"><strong>{verification.verdict.decision === "rejected" ? "Document rejected" : "More evidence needed"}</strong><p>{verification.verdict.reason}</p><p>Confidence: {Math.round(verification.verdict.confidence * 100)}%</p></div>}
        {profile ? <button type="button" onClick={() => setShowVerification(true)} className="onboarding-primary">{verification ? "Upload new company document" : "Verify company"} →</button> : <Link className="onboarding-primary" href="/register">Complete company details →</Link>}
        {sampleEvidence && <div className="company-sample-download"><span className="passport-eyebrow">Presentation evidence</span><a href={sampleEvidence} download>Download sample company record ↗</a><p>Fictional evidence for your simulation. <a href="/demo-evidence/README.md" target="_blank" rel="noreferrer">View all sample cases</a></p></div>}
        <p className="onboarding-review-footnote">Your company passport is issued once the document review is approved.</p>
      </div>
      <aside className="onboarding-review-aside"><p className="passport-eyebrow">Company record</p><h3>{profile?.legalName ?? startup.name}</h3><dl><div><dt>Country</dt><dd>{COUNTRY_NAMES[startup.country]}</dd></div><div><dt>Registration number</dt><dd>{profile?.registrationNumber ?? "Not provided"}</dd></div><div><dt>Sector</dt><dd>{startup.sector}</dd></div><div><dt>Passport</dt><dd>Not issued</dd></div></dl><p>Use a clear image with the full company name, registration number and jurisdiction visible.</p></aside>
    </section>}
    {approved && verification.mode === "demo" && <div className="onboarding-notice"><strong>Demo passport</strong><p>This is a sample result, not an AI-checked company identity.</p><Link href="/profile" className="text-primary underline">Leave demo mode</Link><button type="button" className="onboarding-secondary ml-3" onClick={() => setShowVerification(true)}>Review another document</button></div>}
    {showVerification && profile && <ProofDialog profile={profile} onClose={() => { setShowVerification(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
  </div>;
}
