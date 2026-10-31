import CompanyLogo from "@/components/CompanyLogo";
import Flag from "@/components/Flag";
import Logo from "@/components/Logo";
import { COUNTRY_NAMES } from "@/lib/game";
import type { Country, Stage } from "@/lib/types";

/** draft = live form preview, pending = awaiting review, issued = approved, demo = canned approval. */
export type PassportState = "draft" | "pending" | "issued" | "demo";

export interface PassportData {
  startupId: string;
  legalName: string;
  registrationNumber: string;
  country: Country;
  sector: string;
  stage: Stage;
}

const ISO3: Record<Country, string> = { MY: "MYS", SG: "SGP", ID: "IDN", VN: "VNM", TH: "THA", PH: "PHL" };

export const STAGE_LABEL: Record<Stage, string> = { "pre-seed": "Pre-seed", seed: "Seed", "series-a": "Series A" };

const STAMP: Record<PassportState, string> = {
  draft: "Draft",
  pending: "Awaiting review",
  issued: "Verified",
  demo: "Sample",
};

/** Machine-readable-zone style line: uppercase, separators become "<", padded to a fixed width. */
function mrz(text: string, length = 44) {
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, "<").padEnd(length, "<").slice(0, length);
}

export function formatPassportDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export default function PassportCover({
  data,
  state,
  passportId,
  issuedOn,
  className = "",
}: {
  data: PassportData;
  state: PassportState;
  passportId?: string;
  issuedOn?: string;
  className?: string;
}) {
  const name = data.legalName.trim() || "Your company";
  const issued = state === "issued" || state === "demo";
  const line1 = mrz(`P<${ISO3[data.country]}<${name}`);
  const line2 = mrz(`${issued && passportId ? passportId : "NN<PENDING"}<${data.registrationNumber || "REG"}<${data.stage}<${ISO3[data.country]}`);

  return (
    <article className={`passport-book is-${state} ${className}`} aria-label={`${name} company passport`}>
      <span className="passport-foil" aria-hidden="true" />

      <header className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          <Logo size={22} /> Nexus Net
        </span>
        <span className="font-pixel text-2xl leading-none tracking-[0.18em] text-white/90">PASSPORT</span>
      </header>

      <div className="mt-7 flex items-center gap-4">
        <span className="rounded-[18px] bg-white/15 p-1.5 ring-1 ring-white/25">
          <CompanyLogo id={data.startupId} name={name} size={60} className="rounded-xl" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Company identity · {ISO3[data.country]}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight [overflow-wrap:anywhere] sm:text-[28px]">{name}</h3>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-white/80">
            <Flag country={data.country} size={13} />
            {COUNTRY_NAMES[data.country]}
            <span className="text-white/40">/</span>
            <span className="truncate">{data.sector.trim() || "Sector"}</span>
          </p>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/15 pt-5">
        <Field label="Passport ID" value={issued && passportId ? passportId : "Not issued"} muted={!issued} />
        <Field label="Company stage" value={STAGE_LABEL[data.stage] ?? data.stage} />
        <Field label="Registration no." value={data.registrationNumber.trim() || "—"} />
        <Field label="Issued on" value={issued ? formatPassportDate(issuedOn) : "—"} muted={!issued} />
      </dl>

      <span className="passport-stamp-mark" aria-hidden="true">
        <span className="block text-[9px] tracking-[0.3em] opacity-80">Nexus Net</span>
        {STAMP[state]}
      </span>

      <div className="passport-mrz" aria-hidden="true">
        <p>{line1}</p>
        <p>{line2}</p>
      </div>
    </article>
  );
}

function Field({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-white/60">{label}</dt>
      <dd className={`mt-1 font-score text-sm [overflow-wrap:anywhere] ${muted ? "text-white/50" : "text-white"}`}>{value}</dd>
    </div>
  );
}
