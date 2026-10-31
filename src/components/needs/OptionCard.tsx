import { matchTalent, type NeedOption } from "@/lib/needs";
import { QUEST_TYPE_STYLE } from "@/lib/tiers";
import { seedTalent } from "@/seed";

const URGENCY_STYLE: Record<NeedOption["urgency"], string> = {
  High: "bg-[#FFB2B3] text-ink",
  Medium: "bg-yellow text-ink",
  Low: "bg-ink/5 text-muted",
};

interface Props {
  option: NeedOption;
  added: boolean;
  onAdd: () => void;
}

export default function OptionCard({ option, added, onAdd }: Props) {
  const type = QUEST_TYPE_STYLE[option.type];
  const talent = option.talentRole
    ? matchTalent(seedTalent, option.talentRole, option.targetCountry)
    : [];

  return (
    <article className="h-full flex flex-col rounded-3xl bg-white shadow-card overflow-hidden">
      <div className={`${type.bg} h-20 px-5 flex items-center justify-between`}>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${URGENCY_STYLE[option.urgency]}`}>
          {option.urgency} priority
        </span>
        <span className="font-score text-xl font-bold text-ink">+{option.xp} XP</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs font-semibold text-subtle">You said: {option.evidence}</p>
        <h3 className="text-xl font-bold leading-snug">{option.title}</h3>
        <p className="text-sm text-muted">{option.why}</p>

        <div className="rounded-2xl bg-paper p-4 text-sm">
          {option.talentRole ? (
            <>
              <p className="font-bold">🧑‍💻 Done by a {option.talentRole}</p>
              <ul className="mt-2 space-y-1 text-muted">
                {talent.map((t) => (
                  <li key={t.id}>
                    <span className="font-semibold text-ink">{t.name}</span> · {t.country} · ★{t.rating} ·{" "}
                    {t.gigsDone} gigs
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-subtle">Sample talent, TalentLabs-style</p>
            </>
          ) : (
            <p className="font-bold">🚀 You lead this one</p>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          className="mt-auto rounded-full bg-primary px-5 py-3 font-bold text-white transition hover:brightness-110 disabled:bg-green disabled:cursor-default"
        >
          {added ? "Added to my quests ✓" : "Add as a quest"}
        </button>
      </div>
    </article>
  );
}
