import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import { QUEST_TYPE_STYLE, STATUS_STYLE } from "@/lib/tiers";
import type { Quest } from "@/lib/types";
import { seedEvents } from "@/seed";
import QuestProof from "./QuestProof";
import PixelIcon from "@/components/PixelIcon";

// Fixed locale + UTC so server and client render the same string.
function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function QuestCard({ quest }: { quest: Quest }) {
  const type = QUEST_TYPE_STYLE[quest.type];
  const status = STATUS_STYLE[quest.status];
  const event = seedEvents.find((e) => e.id === quest.eventId);

  return (
    <article className="group h-full flex flex-col rounded-3xl bg-white shadow-card overflow-hidden transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-xl">
      <div className={`${type.bg} relative h-16 px-5 flex items-center justify-between`}>
        <PixelIcon
          name={type.icon}
          size={40}
          className="transition-transform duration-200 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110"
        />
        {/* Coin badge */}
        <span className="size-14 transition-[opacity,scale] duration-500 motion-safe:starting:scale-0 motion-safe:starting:opacity-0 rounded-full bg-yellow border-4 border-white shadow-card flex flex-col items-center justify-center leading-none">
          <span className="font-score text-base font-bold text-ink">+{quest.xp}</span>
          <span className="text-xs font-bold text-ink/70">XP</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-purple-dark px-2.5 py-1 text-white">{type.label}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-ink">
            <Flag country={quest.targetCountry} size={12} /> {COUNTRY_NAMES[quest.targetCountry]}
          </span>
          {quest.talentRole && (
            <span className="inline-flex items-center gap-1 rounded-full bg-signature px-2.5 py-1 text-ink">
              <PixelIcon name="talent" size={16} /> Talent: {quest.talentRole}
            </span>
          )}
          <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${status.className}`}>
            {quest.status === "verified" && <PixelIcon name="check" size={14} />}
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
              <span className="font-semibold text-ink">Completed:</span> {formatDate(quest.completedAt)}
            </p>
          )}
        </div>
        <QuestProof quest={quest} />
      </div>
    </article>
  );
}
