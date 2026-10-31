import type { LumaEvent } from "@/lib/types";
import EventCard from "./EventCard";

type CardProps = (event: LumaEvent) => React.ComponentProps<typeof EventCard>;

export default function NextUpStrip({ events, cardProps }: { events: LumaEvent[]; cardProps: CardProps }) {
  if (events.length === 0) return null;
  return (
    <section aria-label="Next up">
      <h2 className="mb-3 text-lg font-bold">Next up</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard {...cardProps(event)} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}
