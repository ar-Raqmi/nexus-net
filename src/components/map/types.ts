import type { LngLat } from "@/lib/geo";
import type { Country, QuestType } from "@/lib/types";

export interface MapStartup {
  id: string;
  name: string;
  country: Country;
  position: LngLat;
  isCurrent: boolean;
}

export interface MapArc {
  id: string;
  startupId: string;
  type: QuestType;
  color: string;
  xp: number;
  count: number;
  coordinates: LngLat[];
}

export interface MapPin {
  id: string;
  name: string;
  position: LngLat;
  kind: "luma" | "seed";
  subtitle: string;
}

export interface MapFocus {
  position: LngLat;
  zoom: number;
  /** Bumped on every request so re-focusing the same spot still flies. */
  nonce: number;
}

export type MapLayerMode = "outcomes" | "events";
