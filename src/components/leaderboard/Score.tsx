"use client";

import { useCountUp } from "@/components/useCountUp";
import PixelIcon from "@/components/PixelIcon";

export default function Score({ value, className = "" }: { value: number; className?: string }) {
  const shown = useCountUp(value, 800);
  return (
    <span className={`inline-flex items-center gap-1.5 font-score font-bold ${className}`}>
      <PixelIcon name="fire" size={20} className="shrink-0" />
      {shown.toLocaleString()}
    </span>
  );
}
