import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import type { Country } from "@/lib/types";
import type { LeaderboardRow } from "@/store/selectors";
import PixelArt, { MAP_PIN, ROCKET, TROPHY } from "./PixelArt";
import Voxel, { type VoxelColors } from "./Voxel";

// Scene is laid out at a fixed 780x380 and scaled down per breakpoint.
const SCENE = { width: 780, height: 380 };
const SHELF = { width: 680, height: 22, depth: 44, bottom: 16 };
const SHELF_LEFT = (SCENE.width - SHELF.width - SHELF.depth) / 2;
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

// Small floating icons around the podium, in scene coordinates.
const FLOATERS = [
  { icon: "⭐", left: 70, top: 120, rotate: -10, delay: "0s" },
  { icon: "💎", left: 150, top: 40, rotate: 8, delay: "-1.5s" },
  { icon: "🎯", left: 600, top: 50, rotate: -6, delay: "-3s" },
  { icon: "📈", left: 680, top: 130, rotate: 10, delay: "-4.5s" },
];

export default function PodiumScene({
  countries,
  verified,
}: {
  countries: LeaderboardRow[];
  verified: number;
}) {
  const top1 = PODIUM[1];
  // Horizontal centre of TOP1's top face (front centre + half the oblique offset).
  const trophyCentre = PODIUM_LEFT + PODIUM[0].width + top1.width / 2 + PODIUM_DEPTH / 2;

  return (
    <div className="relative w-full h-[160px] sm:h-[274px] md:h-[304px] lg:h-[342px]">
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 origin-top scale-[0.42] sm:scale-[0.72] md:scale-[0.8] lg:scale-[0.9]"
        style={{ width: SCENE.width, height: SCENE.height }}
        aria-label={`Top countries podium. ${verified} verified outcomes.`}
        role="img"
      >
        {FLOATERS.map((f) => (
          <span
            key={f.icon}
            aria-hidden
            className="absolute flex size-11 items-center justify-center rounded-xl bg-white text-xl shadow-card motion-safe:animate-float [animation-duration:5s]"
            style={{ left: f.left, top: f.top, rotate: `${f.rotate}deg`, animationDelay: f.delay }}
          >
            {f.icon}
          </span>
        ))}

        {/* Soft shadow beneath the shelf */}
        <div
          className="absolute h-5 rounded-[50%] bg-ink/25 blur-md"
          style={{ left: SHELF_LEFT + 10, bottom: SHELF.bottom - 10, width: SHELF.width + SHELF.depth - 20 }}
        />

        {/* Wooden shelf: the base everything stands on */}
        <Voxel
          {...SHELF}
          absolute
          colors={WOOD}
          frontClassName="rounded-b-md bg-[repeating-linear-gradient(90deg,transparent_0_38px,rgb(0_0_0/0.05)_38px_40px)]"
          style={{ left: SHELF_LEFT, bottom: SHELF.bottom }}
        >
          {/* Rounded top-edge highlight */}
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-t bg-white/45" />
        </Voxel>

        {/* Shelf surface: items stand at mid-depth of the shelf top */}
        <div
          className="absolute"
          style={{
            left: SHELF_LEFT + SHELF.depth / 2,
            bottom: SHELF.bottom + SHELF.height + SHELF.depth / 2,
            width: SHELF.width,
          }}
        >
          {/* Coin stack */}
          <div className="absolute bottom-0" style={{ left: 18 }}>
            {[0, 3, -2, 1].map((offset, i) => (
              <Voxel
                key={i}
                absolute
                width={36}
                height={8}
                depth={12}
                colors={GOLD}
                style={{ left: offset, bottom: i * 8 }}
              />
            ))}
          </div>

          {/* Rocket */}
          <PixelArt {...ROCKET} px={5} className="absolute bottom-0 left-[82px]" label="Rocket" />

          {/* Podium */}
          <div className="absolute bottom-0 flex items-end" style={{ left: PODIUM_LEFT }}>
            {PODIUM.map((block, i) => {
              const country = countries[block.rank - 1];
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
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-ink px-2 py-0.5 font-score text-xs font-bold text-yellow">
                        TOP{block.rank}
                      </span>
                      {country && <Flag country={country.id as Country} size={16} />}
                    </div>
                    {country && (
                      <span className="text-xs font-bold leading-none">
                        {COUNTRY_NAMES[country.id as Country]}
                      </span>
                    )}
                  </div>

                  {block.rank === 1 && (
                    <div className="w-full rounded-lg border-4 border-[#2E2E48] bg-[#16162A] py-1.5 text-center shadow-[inset_0_0_12px_rgb(92_255_157/0.15)]">
                      <p
                        className={`font-pixel leading-[0.85] text-[#5CFF9D] [text-shadow:0_0_8px_rgb(92_255_157/0.6)] ${
                          verified >= 1000 ? "text-5xl" : "text-7xl"
                        }`}
                      >
                        {verified.toLocaleString("en-US")}
                      </p>
                      <p className="font-pixel text-base leading-none tracking-wide text-[#5CFF9D]/75">
                        verified outcomes
                      </p>
                    </div>
                  )}

                  {country && (
                    <p className="font-score font-bold leading-none">
                      <span className={block.rank === 1 ? "text-2xl" : "text-lg"}>
                        {country.score.toLocaleString("en-US")}
                      </span>{" "}
                      <span className="text-xs opacity-70">XP</span>
                    </p>
                  )}
                </Voxel>
              );
            })}
          </div>

          {/* Trophy floating above TOP1 */}
          <div
            className="absolute -translate-x-1/2"
            style={{ left: trophyCentre, bottom: top1.height + PODIUM_DEPTH + 8 }}
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
            absolute
            width={40}
            height={40}
            depth={18}
            colors={GREEN}
            className="bottom-0"
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
