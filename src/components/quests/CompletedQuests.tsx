"use client";

import { useState } from "react";
import type { Quest } from "@/lib/types";
import QuestGrid from "./QuestGrid";

const PREVIEW_COUNT = 3;

/** `quests` must already be sorted newest first. */
export default function CompletedQuests({ quests }: { quests: Quest[] }) {
  const [showAll, setShowAll] = useState(false);
  const overflow = quests.length > PREVIEW_COUNT;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full">
        <QuestGrid quests={showAll ? quests : quests.slice(0, PREVIEW_COUNT)} />
      </div>
      {overflow && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          aria-expanded={showAll}
          className="btn btn-sm"
        >
          {showAll ? "Show fewer" : `Show all ${quests.length}`}
        </button>
      )}
    </div>
  );
}
