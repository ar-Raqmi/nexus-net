"use client";

import { useEffect, useId, useRef } from "react";
import { CATEGORY_BY_KEY } from "@/lib/events";
import type { LumaEvent } from "@/lib/types";
import PixelIcon from "@/components/PixelIcon";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function EventModal({ event, onClose }: { event: LumaEvent; onClose: () => void }) {
  const category = CATEGORY_BY_KEY[event.category];
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus in on open, trap Tab, close on Escape, and hand focus back to the trigger.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement as HTMLElement | null;
    dialog.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-lg max-h-full overflow-y-auto rounded-3xl bg-white shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-36 bg-ink/5">
          {event.coverUrlLarge ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverUrlLarge}
              alt=""
              width={720}
              height={720}
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full ${category.className} flex items-center justify-center`}>
              <PixelIcon name={category.icon} size={72} />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 size-10 rounded-full bg-white/90 text-lg font-bold leading-none"
            aria-label="Close event details"
          >
            ×
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3">
          <span className={`self-start rounded-full px-3 py-1 text-xs font-bold ${category.className}`}>
            <PixelIcon name={category.icon} size={16} className="inline-block mr-1 align-middle" />{category.label}
          </span>
          <h2 id={titleId} className="text-xl font-bold">
            {event.name}
          </h2>
          <dl className="text-sm text-muted space-y-1">
            <Detail label="When">
              {new Date(event.startAt).toLocaleString("en-MY", {
                timeZone: "Asia/Kuala_Lumpur",
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Detail>
            {event.hosts.length > 0 && <Detail label="Hosts">{event.hosts.join(", ")}</Detail>}
            {event.address && <Detail label="Where">{event.address}</Detail>}
            <Detail label="Price">{event.isFree ? "Free" : (event.priceLabel ?? "Paid")}</Detail>
            <Detail label="Going">{event.guestCount}</Detail>
          </dl>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-primary px-5 py-3 text-center font-bold text-white hover:brightness-110"
          >
            View on Luma →
          </a>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline font-semibold text-ink">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}
