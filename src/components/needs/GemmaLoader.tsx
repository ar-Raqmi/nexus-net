export default function GemmaLoader({ startupName }: { startupName: string }) {
  return (
    <section
      aria-live="polite"
      className="mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center gap-6 rounded-3xl bg-white p-10 text-center shadow-card"
    >
      <div className="flex items-end gap-2" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="size-4 bg-primary motion-safe:animate-bounce"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <p className="text-xl font-bold">Gemma is reading {startupName}&apos;s answers…</p>
    </section>
  );
}
