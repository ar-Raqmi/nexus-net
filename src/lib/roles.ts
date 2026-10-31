import type { PixelIconName } from "@/components/PixelIcon";

export type Role = "startup" | "talent" | "investor";

export interface RoleConfig {
  id: Role;
  label: string;
  blurb: string;
  icon: PixelIconName;
  home: string;
}

export const ROLES: RoleConfig[] = [
  { id: "startup", label: "Startup", blurb: "Earn XP from real outcomes", icon: "rocket", home: "/quests" },
  { id: "talent", label: "Talent", blurb: "Take gigs from ASEAN startups", icon: "talent", home: "/talent" },
  { id: "investor", label: "Investor", blurb: "Back verified traction", icon: "gem", home: "/investor" },
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<Role, RoleConfig>;

export interface NavLink {
  href: string;
  label: string;
  short?: string;
  icon: PixelIconName;
}

const MAP: NavLink = { href: "/map", label: "Map", icon: "pin" };
const EVENTS: NavLink = { href: "/events", label: "Events", icon: "meeting" };
const BOARD: NavLink = { href: "/leaderboard", label: "Leaderboard", short: "Board", icon: "trophy" };
const CRADLE: NavLink = { href: "/cradle", label: "Cradle view", short: "Cradle", icon: "funding" };

export const NAV_BY_ROLE: Record<Role, NavLink[]> = {
  startup: [
    { href: "/profile", label: "Company", icon: "star" },
    { href: "/needs", label: "My needs", short: "Needs", icon: "compass" },
    { href: "/quests", label: "Quests", icon: "sparkle" },
    EVENTS,
    MAP,
    BOARD,
    CRADLE,
  ],
  talent: [{ href: "/talent", label: "Gig board", short: "Gigs", icon: "talent" }, EVENTS, MAP, BOARD],
  investor: [{ href: "/investor", label: "Deal flow", short: "Deals", icon: "gem" }, MAP, BOARD, CRADLE],
};
