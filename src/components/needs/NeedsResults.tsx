"use client";

import Link from "next/link";
import { needQuestId, toQuest, type NeedOption } from "@/lib/needs";
import type { Quest, Startup } from "@/lib/types";
import OptionCard from "./OptionCard";

interface Props {
  startup: Startup;
  options: NeedOption[];
  quests: Quest[];
  source: "gemma" | "template";
  onAdd: (quest: Quest) => void;
  onRestart: () => void;
}

export default function NeedsResults({ startup, options, quests, source, onAdd, onRestart }: Props) {
  const isAdded = (option: NeedOption) =>
    quests.some((q) => q.id === needQuestId(startup.id, option.gapId));

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">Your top gaps, with a way to close each</h2>
        <p className="mt-2 text-muted">
          Pick the options that fit {startup.name}. Each becomes a quest you can finish for XP.
        </p>
        <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
            source === "gemma" ? "bg-purple-dark text-white" : "bg-yellow text-ink"
          }`}
        >
          {source === "gemma" ? "Worded by Gemma 4" : "Template wording: Gemma was unreachable"}
        </span>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2">
        {options.map((option) => (
          <li key={option.gapId}>
            <OptionCard
              option={option}
              added={isAdded(option)}
              onAdd={() => onAdd(toQuest(startup, option))}
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/quests"
          className="rounded-full bg-primary px-6 py-3 font-bold text-white hover:brightness-110"
        >
          View my quests
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full bg-ink px-6 py-3 font-bold text-white hover:bg-primary"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
