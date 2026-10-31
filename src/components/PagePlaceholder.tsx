export default function PagePlaceholder({
  title,
  subtitle,
  phase,
  children,
}: {
  title: string;
  subtitle: string;
  phase: number;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-6 py-10">
      <span className="rounded-full border border-black/10 bg-white px-4 py-1 eyebrow">
        Coming in phase {phase}
      </span>
      <h1 className="font-display text-4xl text-center">{title}</h1>
      <p className="text-muted text-center max-w-xl">{subtitle}</p>
      {children}
    </section>
  );
}
