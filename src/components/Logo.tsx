const STEM = "#ffdd56";
const NODE = "#6e68ff";

// 8x8 grid of 4px cells: two yellow stems joined by a white diagonal, purple end nodes.
const CELLS: [number, number, string][] = [
  ...[1, 2, 3, 4, 5, 6].flatMap((y): [number, number, string][] => [
    [1, y, y === 1 ? NODE : STEM],
    [6, y, y === 6 ? NODE : STEM],
  ]),
  ...[0, 1, 2, 3].map((i): [number, number, string] => [
    2 + i,
    2 + i,
    "#ffffff",
  ]),
];

export default function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="7" fill="#405cee" />
      {CELLS.map(([x, y, fill]) => (
        <rect
          key={`${x}-${y}`}
          x={x * 4}
          y={y * 4}
          width="4"
          height="4"
          fill={fill}
        />
      ))}
    </svg>
  );
}
