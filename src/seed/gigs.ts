import type { Quest } from "@/lib/types";

// Demo gig postings (fictional). Open quests that need an outside talent show up beside these on /talent.
const gig = (
  id: string,
  startupId: string,
  talentRole: string,
  title: string,
  type: Quest["type"],
  xp: number,
  targetCountry: Quest["targetCountry"],
): Quest => ({
  id: `gig-${id}`,
  startupId,
  title,
  why: "Outsourced to a vetted ASEAN talent.",
  type,
  targetCountry,
  xp,
  proofRequired: "Delivery screenshot signed off by the startup.",
  talentRole,
  status: "open",
});

export const seedGigs: Quest[] = [
  gig("1", "paylah-lite", "Web developer", "Build a Vietnamese-language landing page for the Hanoi launch", "programme", 75, "VN"),
  gig("2", "tanipintar", "Content creator", "Short video explaining sensor pilots for Thai farmer co-ops", "connect", 20, "TH"),
  gig("3", "medilink", "Pitch deck designer", "Redesign the Series-A deck for Singapore investors", "funding", 120, "SG"),
  gig("4", "greenhaul", "Bug fixer", "Fix route-optimiser crash on the Jakarta pilot dashboard", "poc", 90, "ID"),
  gig("5", "shopsiam", "Web developer", "Add Bahasa checkout to the social-commerce storefront", "meeting", 50, "ID"),
  gig("6", "learnloop", "Content creator", "Produce Tagalog micro-lessons for BPO upskilling", "programme", 75, "PH"),
  gig("7", "kopistack", "Pitch deck designer", "Seed deck for the Kuala Lumpur demo day", "partnership", 150, "MY"),
];
