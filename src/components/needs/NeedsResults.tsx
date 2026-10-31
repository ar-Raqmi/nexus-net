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
  demo?: boolean;
  onAdd: (quest: Quest) => void;
  onRestart: () => void;
}

export default function NeedsResults({ startup, options, quests, source, demo, onAdd, onRestart }: Props) {
  const isAdded = (option: NeedOption) =>
    quests.some((q) => q.id === needQuestId(startup.id, option.gapId));

  const availableXp = options.reduce((sum, o) => sum + (isAdded(o) ? 0 : o.xp), 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl">Your top gaps, with a way to close each</h1>
        <p className="mt-2 text-muted">
          Pick the options that fit {startup.name}. Each becomes a quest you can finish for XP.
        </p>
        {!demo && <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
            source === "gemma" ? "bg-purple-dark text-white" : "bg-yellow text-ink"
          }`}
        >
          {source === "gemma" ? "Worded by Gemma 4" : "Template wording: Gemma was unreachable"}
        </span>}
      </div>

      <p className="self-center rounded-3xl bg-ink px-6 py-3 text-white">
        <span className="font-score font-bold">{options.length}</span> gaps found ·{" "}
        <span className="font-score font-bold text-yellow">+{availableXp} XP</span> available
      </p>

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
          className="btn btn-primary"
        >
          View my quests
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="btn"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
