"use client";

import { useMemo, useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import Flag from "@/components/Flag";
import PixelIcon, { ICON_FOR_QUEST_TYPE } from "@/components/PixelIcon";
import { seedQuests, seedStartups, seedTalent } from "@/seed";
import { seedGigs } from "@/seed/gigs";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

const TIERS = ["tier-blue", "tier-lavender", "tier-peach", "tier-yellow", "tier-silver", "tier-red"];
const card = "rounded-3xl bg-white p-6 shadow-card sm:p-8";
const lift = "transition-transform duration-200 hover:-translate-y-1";
const fade = "motion-safe:animate-fade-up";

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function Kpi({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className={`${card} ${lift} ${fade} !p-5`} style={{ animationDelay: `${delay}ms` }}>
      <p className="font-score text-4xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

function OfferButton() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green/15 px-4 py-2 text-sm font-bold text-ink motion-safe:animate-pop">
        <PixelIcon name="check" size={16} />
        Offer sent
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setSent(true)}
      className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
    >
      Offer help
    </button>
  );
}

export default function TalentView() {
  const hydrated = useHasHydrated();
  const storeQuests = useGameStore((s) => s.quests);
  const storeStartups = useGameStore((s) => s.startups);
  const quests = hydrated ? storeQuests : seedQuests;
  const startups = hydrated ? storeStartups : seedStartups;
  const [filter, setFilter] = useState<string | null>(null);

  const roles = useMemo(() => Array.from(new Set(seedTalent.map((t) => t.role))), []);

  const gigs = useMemo(() => {
    const withRole = quests.filter((q) => q.status === "open" && q.talentRole);
    const base = [...withRole, ...seedGigs];
    return base
      .map((q) => ({ q, s: startups.find((s) => s.id === q.startupId) }))
      .filter((g): g is { q: typeof g.q; s: NonNullable<typeof g.s> } => !!g.s);
  }, [quests, startups]);

  const avg = seedTalent.reduce((a, t) => a + t.rating, 0) / (seedTalent.length || 1);
  const shownGigs = filter ? gigs.filter((g) => g.q.talentRole === filter) : gigs;
  const shownTalent = filter ? seedTalent.filter((t) => t.role === filter) : seedTalent;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Open gigs" value={String(gigs.length)} delay={0} />
        <Kpi label="Talent in network" value={String(seedTalent.length)} delay={80} />
        <Kpi label="Average rating" value={avg.toFixed(1)} delay={160} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by role">
        {[null, ...roles].map((r) => (
          <button
            key={r ?? "all"}
            type="button"
            aria-pressed={filter === r}
            onClick={() => setFilter(r)}
            className={`rounded-full px-4 py-2 text-sm font-bold shadow-card transition-transform hover:-translate-y-0.5 ${
              filter === r ? "bg-primary text-white" : "bg-white text-ink"
            }`}
          >
            {r ?? "All roles"}
          </button>
        ))}
      </div>

      <section className={`${card} ${fade}`} style={{ animationDelay: "240ms" }}>
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Open now</p>
          <h2 className="text-xl font-bold text-ink">Gig board</h2>
        </header>
        {shownGigs.length === 0 ? (
          <p className="text-sm text-muted">No open gigs for this role right now.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shownGigs.map(({ q, s }, i) => (
              <li
                key={q.id}
                className={`${fade} ${lift} flex flex-col gap-3 rounded-2xl bg-paper p-4 sm:flex-row sm:items-center`}
                style={{ animationDelay: `${300 + i * 50}ms` }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <CompanyLogo id={s.id} name={s.name} size={44} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm text-muted">
                      <span className="truncate font-bold text-ink">{s.name}</span>
                      <Flag country={s.country} size={14} />
                    </p>
                    <p className="flex items-center gap-2 font-bold text-ink">
                      <PixelIcon name={ICON_FOR_QUEST_TYPE[q.type]} size={18} />
                      <span>{q.title}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-card">{q.talentRole}</span>
                  <span className="font-score text-xl font-bold text-primary">{q.xp} XP</span>
                  <OfferButton />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${card} ${fade}`} style={{ animationDelay: "320ms" }}>
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Network</p>
          <h2 className="text-xl font-bold text-ink">Talent directory</h2>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shownTalent.map((t, i) => (
            <li
              key={t.id}
              className={`${fade} ${lift} flex flex-col gap-3 rounded-2xl bg-paper p-4`}
              style={{ animationDelay: `${380 + i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className={`${TIERS[i % TIERS.length]} grid size-12 shrink-0 place-items-center rounded-2xl font-score text-lg font-bold text-ink`}>
                  {initials(t.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{t.name}</p>
                  <p className="flex items-center gap-2 text-sm text-muted">
                    {t.role} <Flag country={t.country} size={14} />
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.skills.map((k) => (
                  <span key={k} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-ink">{k}</span>
                ))}
              </div>
              <p className="flex items-center gap-2 text-sm text-muted">
                <PixelIcon name="star" size={16} />
                <span className="font-score font-bold text-ink">{t.rating.toFixed(1)}</span>
                <span>{t.gigsDone} gigs done</span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
