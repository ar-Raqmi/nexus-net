import PixelArt, { SPARKLE } from "@/components/home/PixelArt";
import type { useQuestGenerator } from "./useQuestGenerator";

type Generator = ReturnType<typeof useQuestGenerator>;

interface Props {
  generator: Generator;
  /** Open quests already exist, so the action replaces them. */
  regenerate?: boolean;
  large?: boolean;
}

export default function GenerateButton({ generator, regenerate = false, large = false }: Props) {
  const loading = generator.status === "loading";

  return (
    <span className="relative inline-flex">
      {large && !loading && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping [animation-duration:2.4s]"
        />
      )}
      <button
        type="button"
        onClick={generator.generate}
        disabled={loading}
        className={`relative inline-flex items-center justify-center gap-2 rounded-full bg-primary font-bold text-white shadow-card transition hover:brightness-110 disabled:opacity-60 disabled:cursor-wait ${
          large ? "h-12 px-8 text-lg" : "px-8 py-3.5"
        }`}
      >
        {!loading && <PixelArt {...SPARKLE} px={2} />}
        {loading
          ? "Gemma is crafting your quests…"
          : regenerate
            ? "Regenerate open quests"
            : "Generate my quests"}
      </button>
    </span>
  );
}
