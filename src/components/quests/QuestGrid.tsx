import type { Quest } from "@/lib/types";
import QuestCard from "./QuestCard";

export default function QuestGrid({ quests }: { quests: Quest[] }) {
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
