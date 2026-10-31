import { FireIcon } from "./icons";

export default function Score({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-score font-bold ${className}`}>
      <FireIcon className="h-[1em] w-[0.85em]" />
      {value.toLocaleString()}
    </span>
  );
}
