import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import type { Country } from "@/lib/types";
import type { LeaderboardTab } from "./types";

/** Flag for country rows; other tabs have no avatar. */
export default function RowAvatar({ tab, id, size }: { tab: LeaderboardTab; id: string; size: number }) {
  if (tab !== "countries" || !(id in COUNTRY_NAMES)) return null;
  return <Flag country={id as Country} size={size} />;
}
