// Pixel-style icons drawn on a grid of rects; crispEdges keeps the blocky look.

export function CrownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 12" shapeRendering="crispEdges" aria-hidden className={className}>
      <path
        fill="#FFDD56"
        d="M1 3h2v2h1V3h2v2h1V1h2v4h1V3h2v2h1V3h2v8H1z"
      />
      <path fill="#222" d="M1 9h14v2H1z" opacity=".25" />
      <path fill="#FF8D22" d="M7 6h2v2H7z" />
    </svg>
  );
}

export function FireIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 14" shapeRendering="crispEdges" aria-hidden className={className}>
      <path fill="#FF8D22" d="M5 0h2v2h1v2h1v2h1v2h1v3h-1v1h-1v1H4v-1H3v-1H2V9h1V7h1V5h1V3H5z" />
      <path fill="#FFD44E" d="M5 7h2v2h1v3H7v1H5v-1H4V9h1z" />
    </svg>
  );
}
