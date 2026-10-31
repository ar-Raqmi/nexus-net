import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import { QUEST_TYPE_STYLE, STATUS_STYLE } from "@/lib/tiers";
import type { Quest } from "@/lib/types";
import { seedEvents } from "@/seed";

export default function QuestCard({ quest }: { quest: Quest }) {
  const type = QUEST_TYPE_STYLE[quest.type];
  const status = STATUS_STYLE[quest.status];
  const event = seedEvents.find((e) => e.id === quest.eventId);

  return (
    <article className="h-full flex flex-col rounded-3xl bg-white shadow-card overflow-hidden">
      <div className={`${type.bg} relative h-24 px-5 flex items-center justify-between`}>
        <span className="text-4xl" aria-hidden>
          {type.icon}
        </span>
        {/* Coin badge */}
        <span className="size-18 rounded-full bg-yellow border-4 border-white shadow-card flex flex-col items-center justify-center leading-none">
          <span className="font-score text-lg font-bold text-ink">+{quest.xp}</span>
          <span className="text-[10px] font-bold text-ink/70">XP</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-purple-dark px-2.5 py-1 text-white">{type.label}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-ink">
            <Flag country={quest.targetCountry} size={12} /> {COUNTRY_NAMES[quest.targetCountry]}
          </span>
          {quest.talentRole && (
            <span className="rounded-full bg-signature px-2.5 py-1 text-ink">
              🧑‍💻 Talent: {quest.talentRole}
            </span>
          )}
          <span className={`ml-auto rounded-full px-2.5 py-1 ${status.className}`}>
            {status.label}
          </span>
        </div>

        <h3 className="text-lg font-bold leading-snug">{quest.title}</h3>
        <p className="text-sm text-muted">{quest.why}</p>

        <div className="mt-auto pt-3 border-t border-ink/5 text-xs text-muted space-y-1">
          {event && (
            <p>
              <span className="font-semibold text-ink">Event:</span> {event.name}
            </p>
          )}
          {quest.completedAt && (
            <p>
              <span className="font-semibold text-ink">Completed:</span> {quest.completedAt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
