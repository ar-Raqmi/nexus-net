// Original mock marks for the fictional demo companies (no real brand logos).
interface Mark {
  from: string;
  to: string;
  glyph: React.ReactNode;
}

const W = "#fff";

const MARKS: Record<string, Mark> = {
  "paylah-lite": {
    from: "#405CEE",
    to: "#6E68FF",
    glyph: (
      <>
        <rect x="7" y="7" width="7" height="7" rx="1.5" fill={W} />
        <rect x="18" y="7" width="7" height="7" rx="1.5" fill={W} opacity=".7" />
        <rect x="7" y="18" width="7" height="7" rx="1.5" fill={W} opacity=".7" />
        <circle cx="21.5" cy="21.5" r="4" fill="#FFDD56" />
      </>
    ),
  },
  tanipintar: {
    from: "#01C16B",
    to: "#7BE495",
    glyph: (
      <>
        <path d="M16 26V15" stroke={W} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 16C16 10 11 8 7 9c0 5 3 8 9 7Z" fill={W} />
        <path d="M16 14c0-5 4-7 9-6 0 5-3 8-9 6Z" fill={W} opacity=".75" />
      </>
    ),
  },
  medilink: {
    from: "#14B8C4",
    to: "#4ADE80",
    glyph: (
      <>
        <rect x="13" y="6" width="6" height="20" rx="2" fill={W} />
        <rect x="6" y="13" width="20" height="6" rx="2" fill={W} />
        <circle cx="25" cy="7" r="3" fill="#FFDD56" />
      </>
    ),
  },
  greenhaul: {
    from: "#16A34A",
    to: "#D9F99D",
    glyph: (
      <>
        <path d="M6 12l6 4-6 4Z" fill={W} />
        <path d="M13 12l6 4-6 4Z" fill={W} opacity=".75" />
        <path d="M20 12l6 4-6 4Z" fill={W} opacity=".5" />
      </>
    ),
  },
  learnloop: {
    from: "#FF8D22",
    to: "#FFD44E",
    glyph: (
      <>
        <path d="M6 10c4-2 7-1 10 1v13c-3-2-6-3-10-1Z" fill={W} />
        <path d="M26 10c-4-2-7-1-10 1v13c3-2 6-3 10-1Z" fill={W} opacity=".75" />
      </>
    ),
  },
  shopsiam: {
    from: "#FB88FF",
    to: "#FF6B6B",
    glyph: (
      <>
        <path d="M8 12h16l-1.5 13h-13Z" fill={W} />
        <path d="M12 12v-1a4 4 0 0 1 8 0v1" fill="none" stroke={W} strokeWidth="2.2" />
        <circle cx="16" cy="18" r="2" fill="#FF6B6B" />
      </>
    ),
  },
  voltnest: {
    from: "#FFB020",
    to: "#FFDD56",
    glyph: <path d="M18 5 9 18h6l-2 9 10-14h-6Z" fill="#222" />,
  },
  halaltrace: {
    from: "#047857",
    to: "#34D399",
    glyph: (
      <>
        <path d="M21 8a9 9 0 1 0 0 16 7 7 0 1 1 0-16Z" fill={W} />
        <circle cx="22.5" cy="13" r="1.8" fill="#FFDD56" />
      </>
    ),
  },
  kopistack: {
    from: "#7C4A2D",
    to: "#C08A5A",
    glyph: (
      <>
        <path d="M8 12h14v7a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6Z" fill={W} />
        <path d="M22 14h2a3 3 0 0 1 0 6h-2" fill="none" stroke={W} strokeWidth="2" />
        <rect x="10" y="7" width="3" height="3" rx="1" fill={W} opacity=".6" />
        <rect x="16" y="6" width="3" height="3" rx="1" fill={W} opacity=".6" />
      </>
    ),
  },
  carebridge: {
    from: "#4E4BA6",
    to: "#6E68FF",
    glyph: (
      <>
        <path d="M5 22c3-9 19-9 22 0" fill="none" stroke={W} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M16 20.5c-4-2.5-5-5-3.2-6.6 1.3-1.1 2.8-.6 3.2.5.4-1.1 1.9-1.6 3.2-.5 1.8 1.6.8 4.1-3.2 6.6Z" fill="#FF6B8B" />
      </>
    ),
  },
};

export default function CompanyLogo({
  id,
  name,
  size = 40,
  className = "",
}: {
  id: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const mark = MARKS[id];
  const gradId = `logo-${id}`;
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const from = mark?.from ?? "#405CEE";
  const to = mark?.to ?? "#6E68FF";

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label={`${name} logo`}
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      {mark ? (
        mark.glyph
      ) : (
        <text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="800" fill={W}>
          {initials}
        </text>
      )}
    </svg>
  );
}
