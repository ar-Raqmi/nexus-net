import { CATEGORY_BY_KEY, EVENT_RELEVANT_XP, EVENT_SUBSCRIBE_XP, formatEventDay, formatEventTime, isPast } from "@/lib/events";
import type { LumaEvent } from "@/lib/types";
import PixelIcon from "@/components/PixelIcon";

interface Props {
  event: LumaEvent;
  /** Whether the current startup is subscribed to this event. */
  subscribed: boolean;
  /** Whether this event earns the relevance bonus for the current startup. */
  relevant: boolean;
  /** True when a startup is logged in and can subscribe. */
  canSubscribe: boolean;
  onToggleSubscribe: (event: LumaEvent) => void;
  /** Cover-less, single-glance variant used in the "Next up" strip. */
  compact?: boolean;
}

export default function EventCard({
  event,
  subscribed,
  relevant,
  canSubscribe,
  onToggleSubscribe,
  compact = false,
}: Props) {
  const category = CATEGORY_BY_KEY[event.category];
  const past = isPast(event.startAt);
  const xp = relevant ? EVENT_RELEVANT_XP : EVENT_SUBSCRIBE_XP;

  const actions = (
    <div className="flex items-center gap-2">
      {canSubscribe && (
        <button
          type="button"
          onClick={() => onToggleSubscribe(event)}
          aria-pressed={subscribed}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            subscribed ? "bg-green text-white hover:brightness-110" : "bg-ink text-white hover:bg-primary"
          }`}
        >
          {subscribed ? (
            <span className="inline-flex items-center gap-1.5">
              <PixelIcon name="check" size={16} /> Subscribed
            </span>
          ) : (
            "Subscribe"
          )}
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
  );

  const price = (
    <span className="text-xs font-semibold text-muted">
      {event.isFree ? "Free" : (event.priceLabel ?? "Paid")}
      {event.guestCount > 0 ? ` · ${event.guestCount} going` : ""}
    </span>
  );

  if (compact) {
    return (
      <article className="h-full flex flex-col gap-3 rounded-2xl bg-white shadow-card p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className={`rounded-full px-2.5 py-1 ${category.className}`}>{category.label}</span>
          <span className="text-muted">
            {formatEventDay(event.startAt)} · {formatEventTime(event.startAt)}
          </span>
        </div>
        <h3 className="text-base font-bold leading-snug line-clamp-2">{event.name}</h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          {price}
          {actions}
        </div>
      </article>
    );
  }

  return (
    <article className="group h-full flex flex-col rounded-3xl bg-white shadow-card overflow-hidden transition duration-300 motion-safe:starting:translate-y-4 starting:opacity-0 motion-safe:hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-28 bg-ink/5">
        {event.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverUrl}
            alt=""
            width={360}
            height={360}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full ${category.className} flex items-center justify-center`}>
            <PixelIcon name={category.icon} size={56} className="transition-transform duration-200 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110" />
          </div>
        )}
        <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold ${category.className}`}>
          <PixelIcon name={category.icon} size={14} className="inline-block mr-1 align-middle" />{category.label}
        </span>

        {/* XP booster badge */}
        {canSubscribe && (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-card ${
              relevant ? "bg-signature text-ink" : "bg-white text-ink"
            }`}
            title={relevant ? "Relevant events earn double XP" : "Subscribe to earn XP"}
          >
            <span className="inline-flex items-center gap-1">
              +{xp} XP {relevant && <PixelIcon name="star" size={14} />}
            </span>
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

        {event.address && <p className="text-xs text-muted line-clamp-2">{event.address}</p>}

        {event.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.reasons.map((reason) => (
              <span key={reason} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                <PixelIcon name="sparkle" size={14} className="inline-block mr-1 align-middle" />{reason}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-ink/5 flex items-center justify-between gap-2">
          {price}
          {actions}
        </div>
      </div>
    </article>
  );
}
