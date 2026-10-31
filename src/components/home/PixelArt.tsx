/** Renders a pixel-art sprite from rows of palette keys ('.' = transparent). */
export default function PixelArt({
  rows,
  palette,
  px = 5,
  className,
  label,
}: {
  rows: string[];
  palette: Record<string, string>;
  px?: number;
  className?: string;
  label?: string;
}) {
  const width = rows[0].length;
  return (
    <svg
      width={width * px}
      height={rows.length * px}
      viewBox={`0 0 ${width} ${rows.length}`}
      shapeRendering="crispEdges"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((key, x) =>
          key === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={palette[key]} />
          ),
        ),
      )}
    </svg>
  );
}

export const TROPHY = {
  palette: { L: "#FFF1A8", Y: "#FFD44E", D: "#E0A800", B: "#9A6534", b: "#6E4522" },
  rows: [
    "...LYYYYYYYYD...",
    ".YYLYYYYYYYYDYY.",
    ".Y.LYYYYYYYYD.Y.",
    ".Y.LYYYYYYYYD.Y.",
    "..YLYYYYYYYYDY..",
    "....LYYYYYYD....",
    ".....LYYYYD.....",
    "......YYYD......",
    "......YYYD......",
    ".....LYYYYD.....",
    "....bBBBBBBb....",
    "....bBBBBBBb....",
    "...bBBBBBBBBb...",
  ],
};

export const ROCKET = {
  palette: { R: "#FF5A5F", W: "#FFFFFF", G: "#C9CFDA", B: "#405CEE", O: "#FF8D22", Y: "#FFD44E" },
  rows: [
    "....RR....",
    "...RRRG...",
    "...WWWG...",
    "...WBBG...",
    "...WBBG...",
    "...WWWG...",
    "...WWWG...",
    "..RWWWGR..",
    ".RRWWWGRR.",
    "...OYYO...",
    "....OO....",
  ],
};

export const MAP_PIN = {
  palette: { R: "#FF5A5F", r: "#C93C42", W: "#FFFFFF" },
  rows: [
    "...RRRr...",
    "..RRRRRr..",
    ".RRRWWRRr.",
    ".RRWWWWRr.",
    ".RRWWWWRr.",
    ".RRRWWRRr.",
    "..RRRRRr..",
    "..RRRRRr..",
    "...RRRr...",
    "....Rr....",
    "....r.....",
  ],
};
