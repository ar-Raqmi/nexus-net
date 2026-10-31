"use client";

import { useCountUp } from "@/components/useCountUp";
import { FireIcon } from "./icons";

export default function Score({ value, className = "" }: { value: number; className?: string }) {
  const shown = useCountUp(value, 800);
  return (
    <span className={`inline-flex items-center gap-1 font-score font-bold ${className}`}>
      <FireIcon className="h-[1em] w-[0.85em]" />
      {shown.toLocaleString()}
    </span>
  );
}
