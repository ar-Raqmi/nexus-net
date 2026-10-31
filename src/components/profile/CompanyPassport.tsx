import PixelIcon from "@/components/PixelIcon";
import type { CompanyProfile, CompanyVerification } from "@/lib/types";
import { COUNTRY_NAMES } from "@/lib/game";
import PassportCover, { formatPassportDate } from "./PassportCover";

function hostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function CompanyPassport({ profile, verification }: { profile: CompanyProfile; verification: CompanyVerification }) {
  const demo = verification.mode === "demo";
  const issuedOn = verification.checkedAt.slice(0, 10);
  const confidence = Math.round(verification.verdict.confidence * 100);

  return (
    <section id="company-passport" aria-labelledby="passport-title" className="scroll-mt-24">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your company identity</p>
          <h2 id="passport-title" className="mt-2 font-display text-3xl">Company passport</h2>
          <p className="mt-2 text-muted">Your company profile, backed by reviewed registration evidence.</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-card ${
            demo ? "bg-yellow text-ink" : "bg-green text-white"
          }`}
        >
          <span className={`size-2 rounded-full ${demo ? "bg-ink/60" : "animate-pulse-ring bg-white"}`} aria-hidden="true" />
          {demo ? "Demo passport" : "AI document reviewed"}
        </span>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 -rotate-2 rounded-[28px] bg-signature opacity-50" />
          <PassportCover
            data={profile}
            state={demo ? "demo" : "issued"}
            passportId={verification.passportId}
            issuedOn={issuedOn}
            className="animate-fade-up"
          />
        </div>

        <div className="visa-page animate-fade-up [animation-delay:150ms]">
          <div className="flex items-start justify-between gap-4 p-6 pb-5 sm:p-7 sm:pb-5">
            <div>
              <p className="eyebrow">Visa page 01 · Identity</p>
              <h3 className="mt-2 text-xl font-bold">Company verification</h3>
            </div>
            <span className="visa-seal" aria-hidden="true">
              <PixelIcon name={demo ? "warning" : "check"} size={22} />
            </span>
          </div>

          <dl className="mx-6 grid grid-cols-3 gap-3 border-y border-dashed border-ink/15 py-5 sm:mx-7">
            <div>
              <dt className="text-xs text-muted">Review result</dt>
              <dd className="mt-1.5 text-sm font-bold">{demo ? "Demo approval" : "Approved"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">AI confidence</dt>
              <dd className="mt-1 font-score text-2xl font-bold text-primary">{confidence}%</dd>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ink/5" aria-hidden="true">
                <span className="block h-full rounded-full bg-signature" style={{ width: `${confidence}%` }} />
              </span>
            </div>
            <div>
              <dt className="text-xs text-muted">Reviewed on</dt>
              <dd className="mt-1.5 text-sm font-bold">{formatPassportDate(issuedOn)}</dd>
            </div>
          </dl>

          <div className="grid gap-5 p-6 sm:p-7">
            <div className="rounded-2xl border border-green/30 bg-green/5 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-10 -rotate-6 items-center justify-center rounded-md border-2 border-green/50 font-score text-sm font-bold text-[#167a4c]">
                  {profile.country}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{COUNTRY_NAMES[profile.country]}</p>
                  <p className="text-xs text-muted">Company registration evidence</p>
                </div>
              </div>
              <h4 className="mt-4 font-bold">{profile.legalName}</h4>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#167a4c]">
                <PixelIcon name="check" size={14} />
                {demo ? "Sample approval · not AI checked" : "Registration document reviewed"}
              </p>
              <details className="passport-evidence group mt-4 border-t border-dashed border-green/30 text-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between pt-3 font-semibold [&::-webkit-details-marker]:hidden">
                  View verification details
                  <span aria-hidden="true" className="text-lg transition group-open:rotate-45">+</span>
                </summary>
                <dl className="mt-3 grid gap-2.5 text-xs">
                  <div><dt className="text-muted">Document</dt><dd className="mt-0.5">{verification.verdict.documentType}</dd></div>
                  <div><dt className="text-muted">Company named</dt><dd className="mt-0.5">{verification.verdict.parties.join(" · ") || "Not specified"}</dd></div>
                  {verification.mode === "live" && verification.model && (
                    <div>
                      <dt className="text-muted">Reviewed by</dt>
                      <dd className="mt-0.5">
                        {verification.model}
                        {verification.durationMs != null ? ` · ${(verification.durationMs / 1000).toFixed(1)}s` : ""}
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="mt-3 text-xs leading-relaxed text-muted">{verification.verdict.reason}</p>
              </details>
            </div>

            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted">Company website</dt>
                <dd className="mt-1">
                  <a className="font-bold text-primary hover:underline" href={profile.website} target="_blank" rel="noreferrer">
                    {hostname(profile.website)} ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">About the company</dt>
                <dd className="mt-1 leading-relaxed">{profile.description}</dd>
              </div>
            </dl>
          </div>

          <p className="flex items-center gap-2 border-t border-ink/5 bg-paper/60 px-6 py-3 text-xs text-muted sm:px-7">
            <span aria-hidden="true">↳</span>
            {demo ? "Demo passport · no AI check performed" : "Issued after company onboarding and document review."}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs text-muted">
        <span className="font-bold text-ink">About this passport · </span>
        AI review of supplied company evidence, saved in this browser. No official registry lookup or ownership verification.
      </p>
    </section>
  );
}
