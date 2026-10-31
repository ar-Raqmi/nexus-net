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
import { useQuestGenerator } from "./useQuestGenerator";

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
  const generator = useQuestGenerator(startup);

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

      <section>
        <SectionTitle
          title="Active quests"
          subtitle="Complete a quest, upload proof, and Gemma verifies it for XP."
        />
        <div className="flex flex-col items-center gap-3 mb-6">
          <button
            type="button"
            onClick={generator.generate}
            disabled={generator.status === "loading"}
            className="rounded-full bg-primary px-8 py-3.5 font-bold text-white shadow-card transition hover:brightness-110 disabled:opacity-60 disabled:cursor-wait"
          >
            {generator.status === "loading"
              ? "Gemma is crafting your quests…"
              : active.some((q) => q.status === "open")
                ? "✨ Regenerate open quests"
                : "✨ Generate my quests"}
          </button>
          {generator.usedFallback && generator.status === "idle" && (
            <span className="rounded-full bg-yellow px-3 py-1 text-xs font-bold">
              Demo mode: Gemma was unreachable, showing a saved quest list
            </span>
          )}
        </div>

        {generator.status === "error" && (
          <div
            role="alert"
            className="mb-6 rounded-3xl bg-[#FFEBEB] border border-[#FFB2B3] p-5 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <span className="text-2xl" aria-hidden>
              ⚠️
            </span>
            <div className="flex-1">
              <p className="font-bold">Couldn&apos;t generate quests</p>
              <p className="text-sm text-muted">{generator.error}</p>
            </div>
            <button
              type="button"
              onClick={generator.generate}
              className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white hover:bg-primary"
            >
              Try again
            </button>
          </div>
        )}

        {generator.status === "loading" ? (
          <QuestSkeletons />
        ) : active.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-ink/10 bg-white/60 p-10 text-center text-muted">
            No active quests yet. Hit the button and Gemma 4 will plan 5 cross-border quests for{" "}
            {startup.name}.
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

function QuestSkeletons() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Generating quests">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="rounded-3xl bg-white shadow-card overflow-hidden animate-pulse">
          <div className="h-24 bg-signature opacity-40" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-1/3 rounded-full bg-ink/10" />
            <div className="h-5 w-4/5 rounded-full bg-ink/10" />
            <div className="h-4 w-full rounded-full bg-ink/5" />
            <div className="h-4 w-2/3 rounded-full bg-ink/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}
