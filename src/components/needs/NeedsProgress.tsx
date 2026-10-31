interface Props {
  /** 0-based index of the question on screen. */
  step: number;
  total: number;
}

export default function NeedsProgress({ step, total }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-score text-sm font-bold text-muted">
        Question {step + 1} of {total}
      </p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        className="h-3 rounded-full bg-ink/10 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
