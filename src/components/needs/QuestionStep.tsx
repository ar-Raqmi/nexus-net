import Flag from "@/components/Flag";
import type { NeedsQuestion } from "@/lib/needs";

interface Props {
  question: NeedsQuestion;
  index: number;
  total: number;
  selected?: string;
  onSelect: (value: string) => void;
}

export default function QuestionStep({ question, index, total, selected, onSelect }: Props) {
  return (
    <section className="rounded-3xl bg-white shadow-card p-6 sm:p-10 flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-subtle">
          Question {index + 1} of {total}
        </p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-bold">{question.prompt}</h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {question.choices.map((choice) => {
          const active = choice.value === selected;
          return (
            <li key={choice.value}>
              <button
                type="button"
                onClick={() => onSelect(choice.value)}
                aria-pressed={active}
                className={`w-full flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left font-semibold transition ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-ink/10 bg-paper hover:border-primary"
                }`}
              >
                {choice.country && <Flag country={choice.country} size={18} />}
                {choice.label}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
