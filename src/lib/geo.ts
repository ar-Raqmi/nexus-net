import type { Country, QuestType } from "./types";

export type LngLat = [number, number];

export const COUNTRY_CENTERS: Record<Country, LngLat> = {
  MY: [101.6869, 3.139],
  SG: [103.8198, 1.3521],
  ID: [106.8456, -6.2088],
  VN: [105.8342, 21.0278],
  TH: [100.5018, 13.7563],
  PH: [120.9842, 14.5995],
};

export const ASEAN_VIEW = { center: [109, 9] as LngLat, zoom: 3.35 };

export const QUEST_TYPE_COLOR: Record<QuestType, string> = {
  connect: "#8A94A6",
  meeting: "#405CEE",
  programme: "#6E68FF",
  poc: "#FF8D22",
  partnership: "#E55BEB",
  funding: "#01C16B",
};

/** Deterministic spread so startups sharing a country don't stack on one pixel. */
export function spreadAround(center: LngLat, index: number, radius = 1.3): LngLat {
  if (index === 0) return center;
  const angle = (index * 137.5 * Math.PI) / 180;
  const r = radius * Math.sqrt(index);
  return [center[0] + Math.cos(angle) * r, center[1] + Math.sin(angle) * r * 0.8];
}

/** Quadratic bezier bowed sideways, so two-way routes between a pair don't overlap. */
export function arcBetween(from: LngLat, to: LngLat, bow = 0.22, steps = 48): LngLat[] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = mx - (y2 - y1) * bow;
  const cy = my + (x2 - x1) * bow;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2];
  });
}
