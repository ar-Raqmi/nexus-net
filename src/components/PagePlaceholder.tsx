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
      <span className="bg-signature rounded-full px-4 py-1 text-xs font-bold text-ink">
        Coming in phase {phase}
      </span>
      <h1 className="text-4xl font-bold text-center">{title}</h1>
      <p className="text-muted text-center max-w-xl">{subtitle}</p>
      {children}
    </section>
  );
}
