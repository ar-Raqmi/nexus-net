import { CATEGORY_BY_KEY, EVENT_RELEVANT_XP, EVENT_SUBSCRIBE_XP, formatEventDay, formatEventTime, isPast } from "@/lib/events";
import type { LumaEvent } from "@/lib/types";

interface Props {
  event: LumaEvent;
  /** Whether the current startup is subscribed to this event. */
  subscribed: boolean;
  /** Whether this event earns the relevance bonus for the current startup. */
  relevant: boolean;
  /** True when a startup is logged in and can subscribe. */
  canSubscribe: boolean;
  onToggleSubscribe: (event: LumaEvent) => void;
}

export default function EventCard({
  event,
  subscribed,
  relevant,
  canSubscribe,
  onToggleSubscribe,
}: Props) {
  const category = CATEGORY_BY_KEY[event.category];
  const past = isPast(event.startAt);
  const xp = relevant ? EVENT_RELEVANT_XP : EVENT_SUBSCRIBE_XP;

  return (
    <article className="h-full flex flex-col rounded-3xl bg-white shadow-card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-28 bg-ink/5">
        {event.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`h-full w-full ${category.className} flex items-center justify-center text-4xl`}>
            {category.icon}
          </div>
        )}
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold ${category.className}`}
        >
          {category.icon} {category.label}
        </span>

        {/* XP booster badge */}
        {canSubscribe && (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-card ${
              relevant ? "bg-signature text-ink" : "bg-white text-ink"
            }`}
            title={relevant ? "Relevant events earn double XP" : "Subscribe to earn XP"}
          >
            +{xp} XP {relevant ? "★" : ""}
          </span>
        )}
        {!canSubscribe && past && (
          <span className="absolute top-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-bold text-white">
            Ended
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          <span className="rounded-full bg-ink/5 px-2.5 py-1">
            {formatEventDay(event.startAt)} · {formatEventTime(event.startAt)}
          </span>
          {event.locationType === "online" ? (
            <span className="rounded-full bg-purple/15 px-2.5 py-1 text-purple-dark">Online</span>
          ) : null}
          {past && <span className="rounded-full bg-ink/5 px-2.5 py-1">Ended</span>}
        </div>

        <h3 className="text-lg font-bold leading-snug">{event.name}</h3>

        {event.hosts.length > 0 && (
          <p className="text-sm text-muted line-clamp-1">By {event.hosts.join(", ")}</p>
        )}

        {event.address && (
          <p className="text-xs text-subtle line-clamp-2">{event.address}</p>
        )}

        {event.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.reasons.map((reason) => (
              <span
                key={reason}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary"
              >
                ✦ {reason}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-ink/5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted">
            {event.isFree ? "Free" : (event.priceLabel ?? "Paid")}
            {event.guestCount > 0 ? ` · ${event.guestCount} going` : ""}
          </span>

          <div className="flex items-center gap-2">
            {canSubscribe && (
              <button
                type="button"
                onClick={() => onToggleSubscribe(event)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  subscribed
                    ? "bg-green text-white hover:brightness-110"
                    : "bg-ink text-white hover:bg-primary"
                }`}
              >
                {subscribed ? "Subscribed ✓" : "Subscribe"}
              </button>
            )}
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${event.name} on Luma`}
              className="rounded-full bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white"
            >
              ↗
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}