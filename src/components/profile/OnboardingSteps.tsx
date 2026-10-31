import PixelIcon, { type PixelIconName } from "@/components/PixelIcon";

const STEPS: { label: string; hint: string; icon: PixelIconName }[] = [
  { label: "Company details", hint: "Who you are", icon: "pin" },
  { label: "Document review", hint: "Gemma checks your evidence", icon: "target" },
  { label: "Company passport", hint: "Ready for the network", icon: "gem" },
];

/**
 * Journey track for onboarding. `current` is the active step (1-3);
 * `completed` is how many steps are finished.
 */
export default function OnboardingSteps({ current, completed }: { current: 1 | 2 | 3; completed: number }) {
  const progress = Math.min(completed, STEPS.length - 1) / (STEPS.length - 1);
  return (
    <ol aria-label="Company onboarding progress" className="relative grid grid-cols-3 gap-2 rounded-[28px] bg-white/70 p-4 shadow-card backdrop-blur sm:p-5">
      <span aria-hidden="true" className="absolute left-[16.6%] right-[16.6%] top-[38px] h-1 rounded-full bg-ink/10 sm:top-[42px]">
        <span
          className="block h-full rounded-full bg-signature transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </span>
      {STEPS.map((step, i) => {
        const index = i + 1;
        const done = index <= completed;
        const active = index === current && !done;
        return (
          <li
            key={step.label}
            aria-current={index === current ? "step" : undefined}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            <span
              className={`flex size-11 items-center justify-center rounded-2xl border-2 transition sm:size-12 ${
                done
                  ? "border-green bg-green text-white"
                  : active
                    ? "border-primary bg-white shadow-[0_0_0_6px_rgb(64_92_238/0.15)]"
                    : "border-ink/10 bg-white opacity-70"
              }`}
            >
              <PixelIcon name={done ? "check" : step.icon} size={24} />
            </span>
            <span className={`text-xs font-bold sm:text-sm ${active ? "text-primary" : done ? "text-ink" : "text-muted"}`}>
              <span className="font-score text-subtle">0{index} </span>
              {step.label}
            </span>
            <span className="hidden text-xs text-muted sm:block">{step.hint}</span>
          </li>
        );
      })}
    </ol>
  );
}
