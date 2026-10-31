import CradleView from "@/components/cradle/CradleView";

export default function CradlePage() {
  return (
    <section className="flex flex-col gap-8 py-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Cradle view</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-card">
            <span className="size-2 rounded-full bg-green animate-pulse-ring" />
            Live
          </span>
        </div>
        <p className="text-muted">The live conversion funnel from connections to investments.</p>
      </header>
      <CradleView />
    </section>
  );
}
