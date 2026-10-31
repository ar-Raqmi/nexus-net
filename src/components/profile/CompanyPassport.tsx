import type { CompanyProfile, CompanyVerification } from "@/lib/types";
import { COUNTRY_NAMES } from "@/lib/game";

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <circle cx="16" cy="16" r="12" />
      <ellipse cx="16" cy="16" rx="5.5" ry="12" />
      <path d="M4 16h24M6.5 9.5h19M6.5 22.5h19" />
    </svg>
  );
}

function Seal({ checked = false }: { checked?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 2 3 2 3.5.5.5 3.5 2 4-2 3-.5 3.5-3.5.5-3 3-3-3-3.5-.5L5 15l-2-3 2-4 .5-3.5L9 4Z" />
      {checked ? <path d="m8 12 2.5 2.5L16 9" /> : <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

export default function CompanyPassport({ profile, verification }: { profile: CompanyProfile; verification: CompanyVerification }) {
  const demo = verification.mode === "demo";
  const initials = profile.legalName.split(/\s+/).map(word => word[0]).slice(0, 2).join("");
  const issuedOn = verification.checkedAt.slice(0, 10);

  return (
    <section id="company-passport" aria-labelledby="passport-title" className="company-passport">
      <header className="passport-heading">
        <div>
          <p className="passport-eyebrow">Your company identity</p>
          <h2 id="passport-title">Company passport</h2>
          <p className="passport-intro">Your company profile, backed by reviewed registration evidence.</p>
        </div>
        <span className={`passport-status ${demo ? "is-pending" : "is-checked"}`}>
          <span aria-hidden="true" />{demo ? "Demo passport" : "AI document reviewed"}
        </span>
      </header>

      <div className="passport-layout">
        <div className="passport-cover-stack">
          <article className="passport-cover" aria-label={`${profile.legalName} company identity`}>
            <div className="passport-cover-top">
              <span className="passport-wordmark"><Globe /> Nexus Net</span>
              <span className="passport-cover-label">ASEAN<br />NETWORK</span>
            </div>

            <div className="passport-company">
              <div className="passport-monogram" aria-hidden="true">{initials}</div>
              <p className="passport-cover-kicker">Company identity / {profile.country}</p>
              <h3>{profile.legalName}</h3>
              <p>{COUNTRY_NAMES[profile.country]}<span aria-hidden="true"> / </span>{profile.sector}</p>
            </div>

            <dl className="passport-fields">
              <div><dt>Passport ID</dt><dd>{verification.passportId}</dd></div>
              <div><dt>Company stage</dt><dd className="passport-stage">{profile.stage}</dd></div>
              <div><dt>Registration number</dt><dd>{profile.registrationNumber}</dd></div>
              <div><dt>Issued on</dt><dd>{formatDate(issuedOn)}</dd></div>
            </dl>

            <div className="passport-cover-bottom">
              <span className="passport-cover-seal"><Seal checked={!demo} /></span>
              <div><p>{demo ? "Demonstration identity." : "Ready for the network."}</p><span>Company onboarding completed.</span></div>
              <span className="passport-country-code" aria-hidden="true">{profile.country}</span>
            </div>
          </article>
        </div>

        <div className="passport-register">
          <div className="passport-register-heading">
            <div><p className="passport-eyebrow">Identity & credentials</p><h3>Company verification</h3></div>
            <span className="passport-register-count"><Seal checked={!demo} /></span>
          </div>
          <dl className="passport-stats">
            <div><dt>Review result</dt><dd className="passport-date">{demo ? "Demo approval" : "Approved"}</dd></div>
            <div><dt>AI confidence</dt><dd>{Math.round(verification.verdict.confidence * 100)}%</dd></div>
            <div><dt>Reviewed on</dt><dd className="passport-date">{formatDate(issuedOn)}</dd></div>
          </dl>
          <div className="passport-stamps">
            <div className="passport-stamp">
              <div className="passport-stamp-top">
                <span className="passport-destination">{profile.country}</span>
                <div><p>{COUNTRY_NAMES[profile.country]}</p><span>Company registration evidence</span></div>
              </div>
              <h4>{profile.legalName}</h4>
              <div className="passport-stamp-meta"><span><Seal checked />{demo ? "Sample approval · not AI checked" : "Registration document reviewed"}</span></div>
              <details className="passport-evidence">
                <summary>View verification details <span aria-hidden="true">+</span></summary>
                <dl><div><dt>Document</dt><dd>{verification.verdict.documentType}</dd></div><div><dt>Company named</dt><dd>{verification.verdict.parties.join(" · ") || "Not specified"}</dd></div></dl>
                <p>{verification.verdict.reason}</p>
              </details>
            </div>
            <dl className="company-profile-summary">
              <div><dt>Company website</dt><dd><a href={profile.website} target="_blank" rel="noreferrer">{new URL(profile.website).hostname} ↗</a></dd></div>
              <div><dt>About the company</dt><dd>{profile.description}</dd></div>
            </dl>
          </div>
          <div className="passport-register-footer"><span aria-hidden="true">↳</span>{demo ? "Demo passport · no AI check performed" : "Issued after company onboarding and document review."}</div>
        </div>
      </div>
      <footer className="passport-note"><span>About this passport</span><p>AI review of supplied company evidence, saved in this browser. No official registry lookup or ownership verification.</p></footer>
    </section>
  );
}
