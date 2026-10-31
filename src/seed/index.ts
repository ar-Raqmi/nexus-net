import type { Event, Programme, Quest, Startup, Talent, Verdict } from "@/lib/types";
import talentJson from "./talent.json";
import startupsJson from "./startups.json";
import eventsJson from "./events.json";
import catalogJson from "./catalog.json";
import questsJson from "./quests.json";
import fallbackJson from "./fallback.json";

// All seed data is fictional.
export const seedStartups = startupsJson as Startup[];
export const seedEvents = eventsJson as Event[];
export const seedCatalog = catalogJson as Programme[];
export const seedQuests = questsJson as Quest[];
export const seedTalent = talentJson as Talent[];

export const fallback = fallbackJson as {
  quests: Omit<Quest, "id" | "startupId" | "status">[];
  verdict: Verdict;
};
