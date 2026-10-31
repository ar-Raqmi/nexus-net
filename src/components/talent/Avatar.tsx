"use client";

import { useState } from "react";

const TIERS = ["tier-blue", "tier-lavender", "tier-peach", "tier-yellow", "tier-silver", "tier-red"];

const initials = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

/** Stable placeholder portrait per person (randomuser.me); falls back to initials if offline. */
export default function Avatar({ name, index, size = 48 }: { name: string; index: number; size?: number }) {
  const [failed, setFailed] = useState(false);
  const gender = index % 2 === 0 ? "women" : "men";
  const src = `https://randomuser.me/api/portraits/${gender}/${(index * 7 + 11) % 90}.jpg`;

  if (failed) {
    return (
      <span
        className={`${TIERS[index % TIERS.length]} grid shrink-0 place-items-center rounded-2xl font-score font-bold text-ink`}
        style={{ width: size, height: size }}
      >
        {initials(name)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote placeholder portraits, no optimisation needed
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-2xl border-2 border-ink bg-paper object-cover"
      style={{ width: size, height: size }}
    />
  );
}
