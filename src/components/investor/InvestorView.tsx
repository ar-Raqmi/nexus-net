"use client";

import { useMemo, useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import Flag from "@/components/Flag";
import PixelIcon from "@/components/PixelIcon";
import Card from "@/components/cradle/Card";
import { useCountUp } from "@/components/useCountUp";
import { getLevel } from "@/lib/game";
import { TIER_STYLE } from "@/lib/tiers";
import type { Country } from "@/lib/types";
import { seedQuests, seedStartups } from "@/seed";
import { selectVerified } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";

type SortKey = "traction" | "outcomes" | "reach";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "traction", label: "Traction" },
  { key: "outcomes", label: "Outcomes" },
  { key: "reach", label: "Reach" },
];

function Stat({ label, value, delay }: { label: string; value: number; delay: number }) {
  const shown = useCountUp(value, 800);
  return (
    <div
      className="rounded-3xl bg-white p-5 shadow-card transition-transform hover:-translate-y-0.5 motion-safe:animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-score text-4xl font-bold text-primary">{shown}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

function InterestButton() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <span className="btn btn-success btn-sm gap-1.5 motion-safe:animate-pop pointer-events-none">
        <PixelIcon name="check" size={16} />
        Interest sent
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setSent(true)}
      className="btn btn-primary btn-sm"
    >
      Express interest
    </button>
  );
}

export default function InvestorView() {
  const hydrated = useHasHydrated();
  const storeQuests = useGameStore((s) => s.quests);
  const storeStartups = useGameStore((s) => s.startups);
  const quests = hydrated ? storeQuests : seedQuests;
  const startups = hydrated ? storeStartups : seedStartups;
  const [sort, setSort] = useState<SortKey>("traction");

  const rows = useMemo(() => {
    const verified = selectVerified(quests);
    const maxXp = Math.max(1, ...startups.map((s) => s.xp));
    return startups
      .map((s) => {
        const mine = verified.filter((q) => q.startupId === s.id);
        const reach = [...new Set(mine.map((q) => q.targetCountry))] as Country[];
        return { s, outcomes: mine.length, reach, pct: Math.round((s.xp / maxXp) * 100) };
      })
      .sort((a, b) => {
        const d =
          sort === "outcomes"
            ? b.outcomes - a.outcomes
            : sort === "reach"
              ? b.reach.length - a.reach.length
              : b.s.xp - a.s.xp;
        return d || b.s.xp - a.s.xp || a.s.name.localeCompare(b.s.name);
      });
  }, [startups, quests, sort]);

  const stats = useMemo(() => {
    const verified = selectVerified(quests);
    return {
      tracked: startups.length,
      outcomes: verified.length,
      countries: new Set(verified.map((q) => q.targetCountry)).size,
      funding: startups.filter((s) => s.stage !== "pre-seed").length,
    };
  }, [startups, quests]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Startups tracked" value={stats.tracked} delay={0} />
        <Stat label="Verified outcomes" value={stats.outcomes} delay={60} />
        <Stat label="Countries reached" value={stats.countries} delay={120} />
        <Stat label="Seed or later stage" value={stats.funding} delay={180} />
      </div>

      <Card title="Deal flow" subtitle="Ranked by verified traction. Re-sort to change the lens.">
        <div role="group" aria-label="Sort deal flow" className="-mt-2 mb-5 seg">
          {SORTS.map((o) => (
            <button
              key={o.key}
              type="button"
              aria-pressed={sort === o.key}
              onClick={() => setSort(o.key)}
                          >
              {o.label}
            </button>
          ))}
        </div>
        <ol className="flex flex-col gap-3">
          {rows.map((r, i) => {
            const level = getLevel(r.s.xp);
            const tier = TIER_STYLE[level.name];
            return (
              <li
                key={r.s.id}
                className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-2xl border border-black/5 p-4 transition-transform hover:-translate-y-0.5 motion-safe:animate-fade-up lg:grid-cols-[auto_minmax(0,1.6fr)_auto_auto_auto_minmax(0,1fr)_auto]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="font-score text-xl font-bold text-muted">{i + 1}</span>
                <div className="flex min-w-0 items-center gap-3">
                  <CompanyLogo id={r.s.id} name={r.s.name} size={40} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-bold text-ink">
                      {r.s.name}
                      <Flag country={r.s.country} size={14} />
                    </p>
                    <p className="truncate text-sm text-muted">
                      {r.s.sector} · {r.s.stage}
                    </p>
                  </div>
                </div>
                <span
                  className={`${tier?.bg ?? ""} col-span-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-ink lg:col-span-1`}
                >
                  {tier && <PixelIcon name={tier.icon} size={16} />}
                  {level.name}
                </span>
                <div className="text-sm text-muted">
                  <span className="font-score text-lg font-bold text-ink">{r.outcomes}</span> verified
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  {r.reach.length === 0 ? (
                    <span>No reach yet</span>
                  ) : (
                    r.reach.map((c) => <Flag key={c} country={c} size={14} />)
                  )}
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <p className="flex items-baseline justify-between text-xs text-muted">
                    <span>Traction</span>
                    <span className="font-score text-base font-bold text-primary">{r.s.xp} XP</span>
                  </p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <InterestButton />
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="motion-safe:animate-fade-up">
        <div className="flex items-start gap-4">
          <PixelIcon name="lock" size={32} className="shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-ink">Why this signal</h2>
            <p className="mt-1 text-sm text-muted">
              Every outcome behind these numbers is backed by uploaded proof that Gemma, our AI verifier, checks
              for document type, parties and approval. Unverified claims earn nothing, so traction can&apos;t be
              faked with a good pitch deck.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
