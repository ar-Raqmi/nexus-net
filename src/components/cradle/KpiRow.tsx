import Card from "./Card";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex flex-col justify-center !p-5">
      <p className="font-score text-4xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}

export default function KpiRow({
  conversion,
  outcomes,
  startups,
  countries,
}: {
  conversion: number;
  outcomes: number;
  startups: number;
  countries: number;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card className="flex flex-col justify-center">
        <p className="font-pixel text-8xl leading-none text-primary sm:text-9xl">{conversion}%</p>
        <p className="mt-3 text-base text-muted">of connections reach a POC or beyond</p>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <StatCard label="Verified outcomes" value={outcomes} />
        <StatCard label="Startups active" value={startups} />
        <StatCard label="Countries reached" value={countries} />
      </div>
    </div>
  );
}
