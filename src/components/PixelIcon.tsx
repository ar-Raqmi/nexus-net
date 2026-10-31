import type { QuestType } from "@/lib/types";

// Palette: '#' follows currentColor so callers can theme the outline via text-*.
const PALETTE: Record<string, string> = {
  "#": "currentColor",
  w: "#ffffff",
  b: "#405cee",
  p: "#6e68ff",
  y: "#ffdd56",
  o: "#ff8d22",
};

const GRIDS = {
  connect: [
    "................",
    "................",
    ".######..######.",
    ".#bbbb#..#pppp#.",
    ".#bbbb#..#pppp#.",
    ".#bbbbyyyypppp#.",
    ".#bbbbyyyypppp#.",
    ".#bbbb#..#pppp#.",
    ".#bbbb#..#pppp#.",
    ".######..######.",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  meeting: [
    "................",
    "................",
    "..############..",
    ".#wwwwwwwwwwww#.",
    ".#wwwwwwwwwwww#.",
    ".#wbbwwbbwwbbw#.",
    ".#wbbwwbbwwbbw#.",
    ".#wwwwwwwwwwww#.",
    ".#wwwwwwwwwwww#.",
    "..#####ww#####..",
    "....#ww#........",
    ".....##.........",
    "................",
    "................",
    "................",
    "................",
  ],
  programme: [
    "................",
    "................",
    "................",
    ".......##.......",
    ".....#bbbb#.....",
    "...#bbbbbbbb#...",
    ".##bbbbbbbbbb#y.",
    "...#bbbbbbbb#.y.",
    ".....#bbbb#...y.",
    ".......##....yy.",
    "....#pppppp#....",
    "....#pppppp#....",
    ".....######.....",
    "................",
    "................",
    "................",
  ],
  poc: [
    "......y..y......",
    "....########....",
    ".....#wwww#.....",
    ".....#wwww#.....",
    ".....#wwww#.....",
    "....#wwwwww#....",
    "...#wwwwwwww#...",
    "..#wwwwwwwwww#..",
    "..#pppppppppp#..",
    ".#pppppppppppp#.",
    ".#ppyppppppppp#.",
    ".#pppppppppppp#.",
    "..#pppppppppp#..",
    "..############..",
    "................",
    "................",
  ],
  partnership: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "..##........##..",
    ".#bb#.####.#pp#.",
    ".#bb########pp#.",
    ".#bbyyyyyyyypp#.",
    ".#bbyyyyyyyypp#.",
    "..##yyyyyyyy##..",
    "....########....",
    "................",
    "................",
    "................",
    "................",
  ],
  funding: [
    "................",
    "................",
    "....########....",
    "...#yyyyyyyy#...",
    "..#yyyyoyyyyy#..",
    ".#yyyyoooyyyyy#.",
    ".#yyyoyyyyyyyy#.",
    ".#yyyyooyyyyyy#.",
    ".#yyyyyyooyyyy#.",
    ".#yyyyyyyyoyyy#.",
    ".#yyyyoooyyyyy#.",
    "..#yyyyoyyyyy#..",
    "...#yyyyyyyy#...",
    "....########....",
    "................",
    "................",
  ],
  fire: [
    "................",
    ".......##.......",
    "......#oo#......",
    ".....#oooo#.#...",
    ".....#oooo##o#..",
    "....#ooyyooo#o#.",
    "...#ooyyyyoooo#.",
    "...#oyyyyyyooo#.",
    "...#oyyyyyyooo#.",
    "...#ooyyyyoooo#.",
    "....#ooyyyooo#..",
    ".....#oooooo#...",
    "......######....",
    "................",
    "................",
    "................",
  ],
  crown: [
    "................",
    "................",
    "................",
    "..y....yy....y..",
    "..yy..yyyy..yy..",
    "..yyy.yyyy.yyy..",
    "..yyyyyyyyyyyy..",
    "..yyyyyyyyyyyy..",
    "..yyoyyyyyyoyy..",
    "..oooooooooooo..",
    "..############..",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  star: [
    "................",
    ".......yy.......",
    ".......yy.......",
    "......yyyy......",
    "......yyyy......",
    ".yyyyyyyyyyyyyy.",
    "..yyyyyyyyyyyy..",
    "...yyyyyyyyyy...",
    "....yyyyyyyy....",
    "....yyyyyyyy....",
    "...yyyy..yyyy...",
    "..yyyy....yyyy..",
    "..yyy......yyy..",
    "................",
    "................",
    "................",
  ],
  trophy: [
    "................",
    "................",
    "...yyyyyyyyyy...",
    ".yy.yyyyyyyy.yy.",
    "yy..yyyyyyyy..yy",
    "yy..yyyyyyyy..yy",
    ".yy.yyyyyyyy.yy.",
    "..yy.yyyyyy.yy..",
    ".....yyyyyy.....",
    "......yyyy......",
    "......oooo......",
    "....oooooooo....",
    "....########....",
    "................",
    "................",
    "................",
  ],
  sparkle: [
    "................",
    ".............o..",
    "............ooo.",
    "......y......o..",
    "......y.........",
    ".....yyy........",
    ".....yyy........",
    "..yyyyyyyyy.....",
    "yyyyyyyyyyyyy...",
    "..yyyyyyyyy.....",
    ".....yyy........",
    ".....yyy........",
    "......y.........",
    "......y.........",
    "................",
    "................",
  ],
  compass: [
    "................",
    "................",
    "....########....",
    "..##wwwwwwww##..",
    ".#wwwwwwwwwwww#.",
    ".#wwwwwwwwrrww#.",
    ".#wwwwwwrrrwww#.",
    ".#wwwwwrrwwwww#.",
    ".#wwwwbbwwwwww#.",
    ".#wwwbbbwwwwww#.",
    ".#wwbbwwwwwwww#.",
    "..##wwwwwwww##..",
    "....########....",
    "................",
    "................",
    "................",
  ],
} as const;

export type PixelIconName = keyof typeof GRIDS;

export const ICON_FOR_QUEST_TYPE: Record<QuestType, PixelIconName> = {
  connect: "connect",
  meeting: "meeting",
  programme: "programme",
  poc: "poc",
  partnership: "partnership",
  funding: "funding",
};

// Rows are merged into horizontal runs so each icon is a few dozen rects, not 256.
function toRects(grid: readonly string[]) {
  const rects: { x: number; y: number; w: number; fill: string }[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x;
      while (end + 1 < row.length && row[end + 1] === ch) end++;
      if (ch in PALETTE)
        rects.push({ x, y, w: end - x + 1, fill: PALETTE[ch] });
      x = end + 1;
    }
  });
  return rects;
}

const RECTS = Object.fromEntries(
  Object.entries(GRIDS).map(([name, grid]) => [name, toRects(grid)]),
) as Record<PixelIconName, ReturnType<typeof toRects>>;

export default function PixelIcon({
  name,
  size = 24,
  className,
}: {
  name: PixelIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {RECTS[name].map((r) => (
        <rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={1}
          fill={r.fill}
        />
      ))}
    </svg>
  );
}
