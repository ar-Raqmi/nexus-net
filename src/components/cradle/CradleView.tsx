"use client";

import { useMemo } from "react";
import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import { seedEvents } from "@/seed";
import {
  FUNNEL_STAGES,
  selectConversionRate,
  selectFunnel,
  selectOutcomesByCountry,
  selectOutcomesByEvent,
  selectVerified,
  type OutcomeBreakdown,
} from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

// Visual style per funnel stage, in FUNNEL_STAGES order.
const STAGE_STYLE = [
  { icon: "🔗", tier: "tier-silver", color: "#bcc6d4" },
  { icon: "💬", tier: "tier-blue", color: "#a9bbff" },
  { icon: "🧪", tier: "tier-lavender", color: "#6e68ff" },
  { icon: "🤝", tier: "tier-peach", color: "#ff8d22" },
  { icon: "💰", tier: "tier-yellow", color: "#01c16b" },
];

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function CradleView() {
  const hydrated = useHasHydrated();
  const quests = useGameStore((s) => s.quests);
  const startups = useGameStore((s) => s.startups);

  const data = useMemo(() => {
    const verified = selectVerified(quests);
    return {
      verified,
      funnel: selectFunnel(quests),
      conversion: selectConversionRate(quests),
      byCountry: selectOutcomesByCountry(quests),
      byEvent: selectOutcomesByEvent(seedEvents, quests),
      activeStartups: new Set(verified.map((q) => q.startupId)).size,
      countriesReached: new Set(verified.map((q) => q.targetCountry)).size,
    };
  }, [quests]);

  if (!hydrated) {
    return <p className="py-20 text-center text-subtle">Loading the cradle…</p>;
  }

  const total = data.verified.length;
  const maxCountry = Math.max(1, ...data.byCountry.map((c) => c.outcomes));
  const maxEvent = Math.max(1, ...data.byEvent.map((e) => e.outcomes));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="bg-signature rounded-full px-4 py-1 text-xs font-bold text-ink">
          Cradle outcomes
        </span>
        <h1 className="text-4xl font-bold">Cradle view</h1>
        <p className="max-w-xl text-muted">
          The live conversion funnel from connections to investments, built from every
          verified quest in the network.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Verified outcomes" value={total} />
        <Stat
          label="Startups with outcomes"
          value={`${data.activeStartups}/${startups.length}`}
        />
        <Stat label="Countries reached" value={`${data.countriesReached}/${Object.keys(COUNTRY_NAMES).length}`} />
        <Stat label="Connection → POC" value={`${data.conversion}%`} highlight />
      </dl>

      {total === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-ink/10 bg-white/60 p-10 text-center text-muted">
          No verified outcomes yet. Completed quests show up here as they are verified.
        </div>
      ) : (
        <>
          <Funnel stages={data.funnel.map((s) => s.count)} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Outcomes by country"
              subtitle="Where verified outcomes happened."
            >
              <ul className="flex flex-col gap-4">
                {data.byCountry.map((row) => (
                  <BreakdownRow
                    key={row.id}
                    row={row}
                    max={maxCountry}
                    lead={<Flag country={row.country} size={18} />}
                    meta={row.outcomes === 0 ? "No outcomes yet" : undefined}
                  />
                ))}
              </ul>
            </Panel>

            <Panel
              title="Outcomes by event"
              subtitle="Which rooms turned into results."
            >
              <ul className="flex flex-col gap-4">
                {data.byEvent.map((row) => (
                  <BreakdownRow
                    key={row.id}
                    row={row}
                    max={maxEvent}
                    lead={
                      row.event ? (
                        <Flag country={row.event.country} size={18} />
                      ) : (
                        <span className="flex h-[18px] w-[27px] items-center justify-center rounded-sm bg-ink/10 text-[10px]" aria-hidden>
                          –
                        </span>
                      )
                    }
                    meta={
                      row.event
                        ? `${COUNTRY_NAMES[row.event.country]} · ${formatDate(row.event.date)}`
                        : "Outcomes not linked to an event"
                    }
                  />
                ))}
              </ul>
            </Panel>
          </div>

          <Legend />
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</dt>
      <dd
        className={`mt-2 font-score text-3xl font-bold ${highlight ? "text-primary" : "text-ink"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Funnel({ stages }: { stages: number[] }) {
  const top = stages[0];
  return (
    <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8" aria-labelledby="funnel-title">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="funnel-title" className="text-2xl font-bold">
            Conversion funnel
          </h2>
          <p className="text-sm text-muted">
            Each outcome counts toward every stage it reached, so a POC also counts as a
            connection and a meeting. Programme acceptances count as meetings.
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-3">
        {FUNNEL_STAGES.map((stage, i) => {
          const count = stages[i];
          const style = STAGE_STYLE[i];
          const width = pct(count, top);
          return (
            <li key={stage.key} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr_7rem]">
              <span className="flex items-center gap-2 text-sm font-bold">
                <span aria-hidden>{style.icon}</span>
                {stage.label}
              </span>
              <div className="h-11 rounded-2xl bg-ink/5">
                <div
                  className={`${style.tier} flex h-full min-w-12 items-center justify-end rounded-2xl px-3 transition-[width] duration-700`}
                  style={{ width: `${Math.max(width, 0)}%` }}
                >
                  <span className="font-score text-lg font-bold text-ink">{count}</span>
                </div>
              </div>
              <span className="col-start-2 text-xs font-semibold text-muted sm:col-start-auto sm:text-right">
                {i === 0 ? (
                  "Top of funnel"
                ) : (
                  <>
                    <span className="font-score text-ink">{pct(count, stages[i - 1])}%</span> of{" "}
                    {FUNNEL_STAGES[i - 1].label.toLowerCase()}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mb-6 text-sm text-muted">{subtitle}</p>
      {children}
    </section>
  );
}

/** One row: label, a bar split by the deepest stage each outcome reached, and totals. */
function BreakdownRow({
  row,
  max,
  lead,
  meta,
}: {
  row: OutcomeBreakdown;
  max: number;
  lead: React.ReactNode;
  meta?: string;
}) {
  // Deepest stage per outcome: stage i minus those that went further.
  const deepest = row.stages.map((count, i) => count - (row.stages[i + 1] ?? 0));
  const empty = row.outcomes === 0;

  return (
    <li className={empty ? "opacity-50" : ""}>
      <div className="flex items-center gap-3">
        <span className="shrink-0">{lead}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{row.name}</p>
          {meta && <p className="truncate text-xs text-subtle">{meta}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-score text-lg font-bold leading-none">{row.outcomes}</p>
          <p className="text-[11px] text-subtle">
            {empty ? "outcomes" : `${row.xp.toLocaleString("en-US")} XP · ${row.conversion}% to POC`}
          </p>
        </div>
      </div>
      <div
        className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-ink/5"
        role="img"
        aria-label={FUNNEL_STAGES.map((s, i) => `${deepest[i]} reached ${s.label.toLowerCase()}`).join(", ")}
      >
        {deepest.map((count, i) =>
          count === 0 ? null : (
            <span
              key={FUNNEL_STAGES[i].key}
              className="h-full"
              style={{ width: `${(count / max) * 100}%`, backgroundColor: STAGE_STYLE[i].color }}
            />
          ),
        )}
      </div>
    </li>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted">
      <li className="font-semibold">Bars show the furthest stage each outcome reached:</li>
      {FUNNEL_STAGES.map((stage, i) => (
        <li key={stage.key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: STAGE_STYLE[i].color }} />
          {stage.label}
        </li>
      ))}
    </ul>
  );
}
