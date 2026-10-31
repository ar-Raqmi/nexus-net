import { useId } from "react";
import { COUNTRY_NAMES } from "@/lib/game";
import type { Country } from "@/lib/types";

// Simplified hand-drawn flags on a 30x20 (3:2) canvas. Emoji flags don't render on Windows.

const RED = "#D21034";
const WHITE = "#FFFFFF";

/** Polygon points for an n-pointed star centred at (cx, cy). */
function star(cx: number, cy: number, n: number, outer: number, inner: number) {
  const points: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / n) * i - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

function Malaysia() {
  const stripe = 20 / 14;
  return (
    <>
      <rect width="30" height="20" fill={WHITE} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="30" height={stripe} fill="#CC0001" />
      ))}
      <rect width="15" height={stripe * 8} fill="#010066" />
      <circle cx="5.6" cy="5.7" r="3.6" fill="#FFCC00" />
      <circle cx="6.6" cy="5.7" r="3" fill="#010066" />
      <polygon points={star(10.6, 5.7, 14, 2.4, 1)} fill="#FFCC00" />
    </>
  );
}

function Singapore() {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    return star(9.6 + 1.8 * Math.cos(angle), 5 + 1.8 * Math.sin(angle), 5, 0.7, 0.28);
  });
  return (
    <>
      <rect width="30" height="10" fill="#EF3340" />
      <rect y="10" width="30" height="10" fill={WHITE} />
      <circle cx="5.6" cy="5" r="3.4" fill={WHITE} />
      <circle cx="7" cy="5" r="3.2" fill="#EF3340" />
      {stars.map((points, i) => (
        <polygon key={i} points={points} fill={WHITE} />
      ))}
    </>
  );
}

function Indonesia() {
  return (
    <>
      <rect width="30" height="10" fill="#CE1126" />
      <rect y="10" width="30" height="10" fill={WHITE} />
    </>
  );
}

function Vietnam() {
  return (
    <>
      <rect width="30" height="20" fill="#DA251D" />
      <polygon points={star(15, 10.5, 5, 6, 2.4)} fill="#FFFF00" />
    </>
  );
}

function Thailand() {
  const unit = 20 / 6;
  return (
    <>
      <rect width="30" height="20" fill="#A51931" />
      <rect y={unit} width="30" height={unit * 4} fill="#F4F5F8" />
      <rect y={unit * 2} width="30" height={unit * 2} fill="#2D2A4A" />
    </>
  );
}

function Philippines() {
  const corners: [number, number][] = [
    [1.8, 2.3],
    [1.8, 17.7],
    [14.6, 10],
  ];
  return (
    <>
      <rect width="30" height="10" fill="#0038A8" />
      <rect y="10" width="30" height="10" fill={RED} />
      <polygon points="0,0 17.3,10 0,20" fill={WHITE} />
      <polygon points={star(5.4, 10, 8, 3.2, 1.6)} fill="#FCD116" />
      <circle cx="5.4" cy="10" r="1.6" fill="#FCD116" />
      {corners.map(([x, y]) => (
        <polygon key={`${x}-${y}`} points={star(x, y, 5, 0.9, 0.36)} fill="#FCD116" />
      ))}
    </>
  );
}

const FLAGS: Record<Country, () => React.JSX.Element> = {
  MY: Malaysia,
  SG: Singapore,
  ID: Indonesia,
  VN: Vietnam,
  TH: Thailand,
  PH: Philippines,
};

/** Country flag as inline SVG. `size` is the height in px; width is 1.5x. */
export default function Flag({
  country,
  size = 20,
  className = "",
}: {
  country: Country;
  size?: number;
  className?: string;
}) {
  const clipId = useId();
  const Drawing = FLAGS[country];

  return (
    <svg
      width={size * 1.5}
      height={size}
      viewBox="0 0 30 20"
      role="img"
      aria-label={COUNTRY_NAMES[country]}
      className={`inline-block shrink-0 align-middle ${className}`}
    >
      <title>{COUNTRY_NAMES[country]}</title>
      <clipPath id={clipId}>
        <rect width="30" height="20" rx="2" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <Drawing />
      </g>
      <rect
        x="0.25"
        y="0.25"
        width="29.5"
        height="19.5"
        rx="2"
        fill="none"
        stroke="rgb(0 0 0 / 0.15)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
