"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Quest } from "@/lib/types";
import { selectQuestsFor, selectStartup } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import LevelTrack from "./LevelTrack";
import QuestCard from "./QuestCard";
import StartupHeader from "./StartupHeader";
import TierCards from "./TierCards";

export default function QuestsView() {
  const hydrated = useHasHydrated();
  const startups = useGameStore((s) => s.startups);
  const quests = useGameStore((s) => s.quests);
  const currentStartupId = useGameStore((s) => s.currentStartupId);

  const startup = selectStartup(startups, currentStartupId);
  const { active, completed } = useMemo(() => {
    const mine = startup ? selectQuestsFor(quests, startup.id) : [];
    return {
      active: mine.filter((q) => q.status !== "verified"),
      completed: mine
        .filter((q) => q.status === "verified")
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    };
  }, [quests, startup]);

  if (!hydrated) {
    return <p className="py-20 text-center text-subtle">Loading your quests…</p>;
  }

  if (!startup) {
    return (
      <section className="mx-auto max-w-md py-16 text-center">
        <div className="rounded-3xl bg-white shadow-card p-10 flex flex-col items-center gap-4">
          <span className="text-5xl" aria-hidden>
            🎮
          </span>
          <h1 className="text-2xl font-bold">Pick a startup first</h1>
          <p className="text-muted">Choose a startup to play as, then your quests show up here.</p>
          <Link
            href="/#startups"
            className="rounded-full bg-primary px-6 py-3 font-bold text-white hover:brightness-110"
          >
            Choose a startup
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StartupHeader startup={startup} />
      <LevelTrack xp={startup.xp} />
      <TierCards xp={startup.xp} />

      <section id="active-quests">
        <SectionTitle
          title="Active quests"
          subtitle="Your next steps toward cross-border growth."
        />
        {active.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-ink/10 bg-white/60 p-10 text-center text-muted">
            No active quests yet. Personalised quest generation is coming separately.
          </div>
        ) : (
          <QuestGrid quests={active} />
        )}
      </section>

      <section>
        <SectionTitle
          title="Completed"
          subtitle={`${completed.length} verified outcome${completed.length === 1 ? "" : "s"} so far.`}
        />
        {completed.length === 0 ? (
          <p className="text-center text-subtle">Nothing verified yet. Your first outcome is one quest away.</p>
        ) : (
          <QuestGrid quests={completed} />
        )}
      </section>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-3xl sm:text-4xl font-bold">{title}</h2>
      <p className="mt-2 text-muted">{subtitle}</p>
    </div>
  );
}

function QuestGrid({ quests }: { quests: Quest[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <li key={quest.id}>
          <QuestCard quest={quest} />
        </li>
      ))}
    </ul>
  );
}
