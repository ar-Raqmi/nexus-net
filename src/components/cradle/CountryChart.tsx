import Flag from "@/components/Flag";
import type { Country } from "@/lib/types";
import Card from "./Card";

interface Row {
  country: Country;
  name: string;
  outcomes: number;
}

const COLORS = ["bg-primary", "bg-purple", "bg-green", "bg-yellow", "bg-purple-dark", "bg-[#FF8D22]"];

// Plain div bars: the recharts version painted labels but no bars in this build.
export default function CountryChart({ data }: { data: Row[] }) {
  const rows = [...data].sort((a, b) => b.outcomes - a.outcomes);
  const max = Math.max(1, ...rows.map((r) => r.outcomes));

  return (
    <Card title="Outcomes by country" subtitle="Verified outcomes by target market">
      <ul className="flex flex-col gap-3" aria-label="Verified outcomes by country">
        {rows.map((row, i) => (
          <li key={row.country} className="animate-fade-up grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3"
            style={{ animationDelay: `${Math.min(i * 80, 600)}ms` }}>
            <span className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Flag country={row.country} size={20} />
              {row.name}
            </span>
            <span className="h-6 rounded-r-xl bg-ink/5">
              <span
                className={`block h-full min-w-1 rounded-r-xl ${COLORS[i % COLORS.length]} transition-[width] duration-700 ease-out starting:w-0`}
                style={{ width: `${(row.outcomes / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-score text-sm font-bold text-ink">{row.outcomes}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
