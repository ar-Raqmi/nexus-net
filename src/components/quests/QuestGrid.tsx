import type { Quest } from "@/lib/types";
import QuestCard from "./QuestCard";

export default function QuestGrid({ quests }: { quests: Quest[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest, i) => (
        <li
          key={quest.id}
          className="transition duration-500 ease-out motion-safe:starting:translate-y-4 starting:opacity-0"
          style={{ transitionDelay: `${Math.min(i, 8) * 70}ms` }}
        >
          <QuestCard quest={quest} />
        </li>
      ))}
    </ul>
  );
}
