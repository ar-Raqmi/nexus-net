import CompanyLogo from "@/components/CompanyLogo";
import Flag from "@/components/Flag";
import { COUNTRY_NAMES } from "@/lib/game";
import type { Country } from "@/lib/types";
import type { LeaderboardTab } from "./types";

/** Flag for country rows; other tabs have no avatar. */
export default function RowAvatar({ tab, id, name, size }: { tab: LeaderboardTab; id: string; name: string; size: number }) {
  if (tab === "startups") return <CompanyLogo id={id} name={name} size={size + 8} />;
  if (tab !== "countries" || !(id in COUNTRY_NAMES)) return null;
  return <Flag country={id as Country} size={size} />;
}
