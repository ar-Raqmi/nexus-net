import Flag from "@/components/Flag";
import type { NeedsQuestion } from "@/lib/needs";

interface Props {
  question: NeedsQuestion;
  selected?: string;
  onSelect: (value: string) => void;
}

export default function QuestionStep({ question, selected, onSelect }: Props) {
  return (
    <section className="rounded-3xl bg-white shadow-card p-6 sm:p-10 flex flex-col gap-6">
      <h2 className="text-2xl sm:text-3xl font-bold">{question.prompt}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {question.choices.map((choice) => {
          const active = choice.value === selected;
          return (
            <li key={choice.value}>
              <button
                type="button"
                onClick={() => onSelect(choice.value)}
                aria-pressed={active}
                className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 active:scale-[0.98] ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-ink/10 bg-paper hover:border-primary"
                }`}
              >
                <span className="flex items-center gap-3">
                  {choice.country && <Flag country={choice.country} size={28} />}
                  {choice.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
