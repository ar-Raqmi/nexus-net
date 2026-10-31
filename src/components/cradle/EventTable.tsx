import Flag from "@/components/Flag";
import type { Event } from "@/lib/types";
import type { LeaderboardRow } from "@/store/selectors";
import Card from "./Card";

export default function EventTable({
  rows,
  events,
}: {
  rows: LeaderboardRow[];
  events: Event[];
}) {
  const byId = new Map(events.map((e) => [e.id, e]));

  return (
    <Card title="Outcomes by event" subtitle="Which events turn into verified results">
      <ul className="divide-y divide-black/10">
        {rows.map((row) => {
          const event = byId.get(row.id);
          return (
            <li
              key={row.id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[1fr_auto_auto]"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{row.name}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                  {event && <Flag country={event.country} size={14} />}
                  {event?.date}
                </p>
              </div>
              <p className="text-right text-sm text-muted sm:order-none">
                <span className="font-score text-lg font-bold text-ink">{row.outcomes}</span>{" "}
                outcomes
              </p>
              <p className="col-span-2 font-score text-sm font-bold text-primary sm:col-span-1 sm:text-right">
                {row.score} XP
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
