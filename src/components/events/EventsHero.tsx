/** Hand-drawn voxel calendar: every shape is an axis-aligned rect so crispEdges keeps it pixel-sharp. */
function PixelCalendar() {
  return (
    <svg viewBox="0 0 24 24" width="72" height="72" shapeRendering="crispEdges" aria-hidden="true" className="shrink-0">
      <rect x="2" y="4" width="20" height="18" fill="#222222" />
      <rect x="3" y="5" width="18" height="16" fill="#ffffff" />
      <rect x="3" y="5" width="18" height="5" fill="#405cee" />
      <rect x="6" y="2" width="2" height="5" fill="#222222" />
      <rect x="16" y="2" width="2" height="5" fill="#222222" />
      <rect x="5" y="12" width="3" height="2" fill="#e5e5e5" />
      <rect x="10" y="12" width="3" height="2" fill="#e5e5e5" />
      <rect x="15" y="12" width="3" height="2" fill="#01c16b" />
      <rect x="5" y="16" width="3" height="2" fill="#e5e5e5" />
      <rect x="10" y="16" width="3" height="2" fill="#ffdd56" />
      <rect x="15" y="16" width="3" height="2" fill="#e5e5e5" />
      <rect x="21" y="19" width="2" height="2" fill="#6e68ff" />
    </svg>
  );
}

export default function EventsHero() {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <PixelCalendar />
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        Ecosystem events · Kuala Lumpur
      </p>
      <h1 className="font-display text-3xl sm:text-4xl">Event calendar</h1>
      <p className="max-w-2xl text-muted">
        Browse networking, workshops and startup events happening around you. We pull the latest
        public events from Luma and surface the ones that match your startup.
      </p>
    </header>
  );
}
