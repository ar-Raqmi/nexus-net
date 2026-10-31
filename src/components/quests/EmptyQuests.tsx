import PixelArt, { CHEST, SPARKLE } from "@/components/home/PixelArt";
import GenerateButton from "./GenerateButton";
import type { useQuestGenerator } from "./useQuestGenerator";

export default function EmptyQuests({
  startupName,
  generator,
}: {
  startupName: string;
  generator: ReturnType<typeof useQuestGenerator>;
}) {
  return (
    <div className="grid items-center gap-8 rounded-3xl border-2 border-dashed border-primary/30 bg-white py-12 px-6 sm:px-12 md:grid-cols-2">
      <div className="relative mx-auto">
        <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-yellow/40 blur-2xl" />
        <PixelArt {...CHEST} px={12} className="motion-safe:animate-float" />
        <PixelArt {...SPARKLE} px={4} className="absolute -top-4 right-0 motion-safe:animate-float" />
        <PixelArt {...SPARKLE} px={3} className="absolute top-8 -left-6 motion-safe:animate-float" />
      </div>
      <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
        <h3 className="font-display text-2xl sm:text-3xl leading-tight">
          Gemma 4 is ready to plan your 5 quests
        </h3>
        <p className="text-muted text-balance">
          Cross-border moves picked for {startupName}, each worth XP once you upload proof.
        </p>
        <GenerateButton generator={generator} large />
      </div>
    </div>
  );
}
