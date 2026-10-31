export type LeaderboardTab = "startups" | "countries" | "events";

export const TABS: { key: LeaderboardTab; label: string }[] = [
  { key: "startups", label: "Startups" },
  { key: "countries", label: "Countries" },
  { key: "events", label: "Events" },
];
