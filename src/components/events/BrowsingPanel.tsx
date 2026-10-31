import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { COUNTRY_NAMES } from "@/lib/game";
import { EVENT_RELEVANT_XP, EVENT_SUBSCRIBE_XP } from "@/lib/events";
import type { Startup } from "@/lib/types";

interface Props {
  startup: Startup;
  subscribedCount: number;
  boosterXp: number;
}

export default function BrowsingPanel({ startup, subscribedCount, boosterXp }: Props) {
  return (
    <section className="rounded-3xl bg-white shadow-card p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Browsing as</p>
        <p className="text-xl font-bold">
          <CompanyLogo id={startup.id} name={startup.name} size={26} className="mr-2 inline-block align-middle" />
          {startup.name}{" "}
          <span className="text-sm font-semibold text-muted">
            · {startup.sector} · {COUNTRY_NAMES[startup.country]}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted">
          {boosterXp > 0
            ? `+${EVENT_SUBSCRIBE_XP} XP per event, +${EVENT_RELEVANT_XP} when it matches your sector.`
            : `Subscribe to events to earn +${EVENT_SUBSCRIBE_XP} XP each.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tile className="bg-ink/5" value={subscribedCount} label="subscribed" valueClassName="text-primary" />
        {boosterXp > 0 && (
          <Tile className="bg-signature" value={`+${boosterXp}`} label="booster XP" valueClassName="text-ink" />
        )}
        <Link
          href="/quests"
          className="btn btn-primary btn-sm"
        >
          Quests →
        </Link>
      </div>
    </section>
  );
}

function Tile({
  className,
  value,
  label,
  valueClassName,
}: {
  className: string;
  value: string | number;
  label: string;
  valueClassName: string;
}) {
  return (
    <div className={`rounded-2xl px-5 py-3 text-center ${className}`}>
      <p className={`font-score text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="text-xs font-bold text-ink/70">{label}</p>
    </div>
  );
}
