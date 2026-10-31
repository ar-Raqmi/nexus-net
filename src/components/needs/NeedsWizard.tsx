"use client";

import Link from "next/link";
import PixelIcon from "@/components/PixelIcon";
import { useState } from "react";
import { QUESTIONS, type NeedsAnswers } from "@/lib/needs";
import { selectStartup } from "@/store/selectors";
import { useGameStore, useHasHydrated } from "@/store/useGameStore";
import GemmaLoader from "./GemmaLoader";
import NeedsProgress from "./NeedsProgress";
import NeedsResults from "./NeedsResults";
import QuestionStep from "./QuestionStep";
import { useNeedsAnalysis } from "./useNeedsAnalysis";

const BLOCKER_STEP = QUESTIONS.length;

export default function NeedsWizard() {
  const hydrated = useHasHydrated();
  const startups = useGameStore((s) => s.startups);
  const quests = useGameStore((s) => s.quests);
  const addQuests = useGameStore((s) => s.addQuests);
  const currentStartupId = useGameStore((s) => s.currentStartupId);
  const startup = selectStartup(startups, currentStartupId);

  const analysis = useNeedsAnalysis(startup);
  const [answers, setAnswers] = useState<Partial<NeedsAnswers>>({});
  const [step, setStep] = useState(0);
  const [blocker, setBlocker] = useState("");

  if (!hydrated) return <p className="py-20 text-center text-subtle">Loading…</p>;

  if (!startup) {
    return (
      <section className="mx-auto max-w-md py-16 text-center">
        <div className="rounded-3xl bg-white shadow-card p-10 flex flex-col items-center gap-4">
          <PixelIcon name="compass" size={56} />
          <h1 className="font-display text-2xl">Pick a startup first</h1>
          <p className="text-muted">Choose a startup to play as, then we find what it is missing.</p>
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

  function restart() {
    analysis.reset();
    setAnswers({});
    setBlocker("");
    setStep(0);
  }

  if (analysis.status === "done") {
    return (
      <NeedsResults
        startup={startup}
        options={analysis.options}
        quests={quests}
        source={analysis.source}
        demo={analysis.demo}
        onAdd={(quest) => addQuests([quest])}
        onRestart={restart}
      />
    );
  }

  if (analysis.status === "loading") {
    return <GemmaLoader startupName={startup.name} />;
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl">What is {startup.name} missing?</h1>
        <p className="mt-2 text-muted">Seven quick taps. We find the gaps and offer ways to close them.</p>
      </div>

      {analysis.status === "error" && (
        <div role="alert" className="rounded-3xl bg-[#FFEBEB] border border-[#FFB2B3] p-5">
          <p className="font-bold">Couldn&apos;t analyse your answers</p>
          <p className="text-sm text-muted">{analysis.error}</p>
        </div>
      )}

      <NeedsProgress step={step} total={QUESTIONS.length + 1} />

      {step < BLOCKER_STEP ? (
        <QuestionStep
          question={QUESTIONS[step]}
          selected={answers[QUESTIONS[step].id]}
          onSelect={(value) => {
            setAnswers((prev) => ({ ...prev, [QUESTIONS[step].id]: value }));
            setStep(step + 1);
          }}
        />
      ) : (
        <section className="rounded-3xl bg-white shadow-card p-6 sm:p-10 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Anything else blocking you? (optional)</h2>
          <textarea
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="e.g. Distributors in Vietnam never reply to our emails"
            className="w-full rounded-2xl border-2 border-ink/10 bg-paper p-4 outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => analysis.analyze(answers as NeedsAnswers, blocker)}
            className="rounded-full bg-primary px-6 py-3 font-bold text-white hover:brightness-110"
          >
            <PixelIcon name="sparkle" size={20} className="mr-2 inline-block align-text-bottom" />Find my gaps
          </button>
        </section>
      )}

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="self-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-muted shadow-card transition hover:text-ink hover:-translate-y-0.5"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
