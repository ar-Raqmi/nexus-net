import { COUNTRY_FLAGS } from "@/lib/game";
import type { Country } from "@/lib/types";
import type { LeaderboardRow } from "@/store/selectors";
import PixelArt, { MAP_PIN, ROCKET, TROPHY } from "./PixelArt";
import Voxel, { type VoxelColors } from "./Voxel";

// Scene is laid out at a fixed 780x420 and scaled down per breakpoint.
const SHELF = { width: 680, height: 22, depth: 44 };
const PODIUM_DEPTH = 36;

const WOOD: VoxelColors = { top: "#EBCB9C", front: "#D6A66B", side: "#B9874F" };
const GOLD: VoxelColors = { top: "#FFE98C", front: "#FFC93C", side: "#D9A21C" };
const GREEN: VoxelColors = { top: "#6BE6A8", front: "#01C16B", side: "#00924F" };

const PODIUM: { rank: number; width: number; height: number; colors: VoxelColors; text: string }[] = [
  { rank: 2, width: 110, height: 130, colors: { top: "#FFB3B5", front: "#FF7B7E", side: "#D9555B" }, text: "text-ink" },
  { rank: 1, width: 150, height: 200, colors: { top: "#FFEC9A", front: "#FFDD56", side: "#DDB52C" }, text: "text-ink" },
  { rank: 3, width: 110, height: 95, colors: { top: "#8195FF", front: "#405CEE", side: "#2A3FB5" }, text: "text-white" },
];

const PODIUM_WIDTH = PODIUM.reduce((sum, b) => sum + b.width, 0);
const PODIUM_LEFT = (SHELF.width - PODIUM_WIDTH - PODIUM_DEPTH) / 2;

export default function PodiumScene({
  countries,
  verified,
}: {
  countries: LeaderboardRow[];
  verified: number;
}) {
  const byRank = (rank: number) => countries[rank - 1];
  const top1 = PODIUM[1];
  // Horizontal centre of TOP1's top face (front centre + half the oblique offset).
  const trophyCentre = PODIUM_LEFT + PODIUM[0].width + top1.width / 2 + PODIUM_DEPTH / 2;

  return (
    <div className="relative w-full h-[176px] sm:h-[302px] md:h-[378px] lg:h-[420px]">
      <div
        className="absolute left-1/2 top-0 w-[780px] h-[420px] -translate-x-1/2 origin-top scale-[0.42] sm:scale-[0.72] md:scale-[0.9] lg:scale-100"
        aria-label={`Top countries podium. ${verified} outcomes verified.`}
        role="img"
      >
        {/* Shelf shadow */}
        <div className="absolute bottom-3 left-1/2 h-6 w-[640px] -translate-x-1/2 rounded-[50%] bg-ink/20 blur-md" />

        {/* Wooden shelf */}
        <Voxel
          {...SHELF}
          colors={WOOD}
          className="absolute"
          frontClassName="rounded-b-md bg-[repeating-linear-gradient(90deg,transparent_0_38px,rgb(0_0_0/0.05)_38px_40px)]"
          style={{ left: (780 - SHELF.width - SHELF.depth) / 2, bottom: 30 }}
        >
          {/* Rounded top-edge highlight */}
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-t bg-white/45" />
        </Voxel>

        {/* Shelf surface: items stand at mid-depth of the shelf top */}
        <div
          className="absolute"
          style={{
            left: (780 - SHELF.width - SHELF.depth) / 2 + SHELF.depth / 2,
            bottom: 30 + SHELF.height + SHELF.depth / 2,
            width: SHELF.width,
          }}
        >
          {/* Coin stack */}
          <div className="absolute bottom-0" style={{ left: 18 }}>
            {[0, 3, -2, 1].map((offset, i) => (
              <Voxel
                key={i}
                width={36}
                height={8}
                depth={12}
                colors={GOLD}
                className="absolute"
                style={{ left: offset, bottom: i * 8 }}
              />
            ))}
          </div>

          {/* Rocket */}
          <PixelArt {...ROCKET} px={5} className="absolute bottom-0 left-[82px]" label="Rocket" />

          {/* Podium */}
          <div className="absolute bottom-0 flex items-end" style={{ left: PODIUM_LEFT }}>
            {PODIUM.map((block, i) => {
              const country = byRank(block.rank);
              return (
                <Voxel
                  key={block.rank}
                  width={block.width}
                  height={block.height}
                  depth={PODIUM_DEPTH}
                  colors={block.colors}
                  style={{ zIndex: i + 1 }}
                  frontClassName={`flex flex-col items-center justify-between py-3 px-2 ${block.text}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-ink px-2 py-0.5 font-score text-[11px] font-bold text-yellow">
                      TOP{block.rank}
                    </span>
                    {country && (
                      <span className="text-2xl leading-none">
                        {COUNTRY_FLAGS[country.id as Country]}
                      </span>
                    )}
                  </div>

                  {block.rank === 1 && (
                    <div className="w-full rounded-lg border-4 border-[#2E2E48] bg-[#16162A] py-1.5 text-center shadow-[inset_0_0_12px_rgb(92_255_157/0.15)]">
                      <p className="font-pixel text-5xl leading-none text-[#5CFF9D] [text-shadow:0_0_8px_rgb(92_255_157/0.6)]">
                        {verified.toLocaleString("en-US")}
                      </p>
                      <p className="font-pixel text-sm leading-none tracking-widest text-[#5CFF9D]/70">
                        VERIFIED
                      </p>
                    </div>
                  )}

                  {country && (
                    <p className="font-score font-bold leading-none">
                      <span className={block.rank === 1 ? "text-2xl" : "text-lg"}>
                        {country.score.toLocaleString("en-US")}
                      </span>{" "}
                      <span className="text-[10px] opacity-70">XP</span>
                    </p>
                  )}
                </Voxel>
              );
            })}
          </div>

          {/* Trophy floating above TOP1 */}
          <div
            className="absolute -translate-x-1/2"
            style={{ left: trophyCentre, bottom: top1.height + PODIUM_DEPTH + 14 }}
          >
            <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-yellow/50 blur-2xl" />
            <PixelArt
              {...TROPHY}
              px={5}
              className="motion-safe:animate-float drop-shadow-[3px_4px_0_rgb(0_0_0/0.15)]"
              label="Trophy"
            />
          </div>

          {/* Handshake block */}
          <Voxel
            width={40}
            height={40}
            depth={18}
            colors={GREEN}
            className="absolute bottom-0"
            style={{ left: 558 }}
            frontClassName="flex items-center justify-center text-xl"
          >
            <span aria-hidden>🤝</span>
          </Voxel>

          {/* Map pin */}
          <PixelArt {...MAP_PIN} px={4} className="absolute bottom-0 left-[630px]" label="Map pin" />
        </div>
      </div>
    </div>
  );
}
