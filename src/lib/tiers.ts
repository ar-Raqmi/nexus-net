import type { QuestStatus, QuestType } from "./types";

// Visual style per level: pastel gradient utility (see globals.css) + icon.
export const TIER_STYLE: Record<string, { bg: string; icon: string }> = {
  Connected: { bg: "tier-silver", icon: "🔗" },
  Engaged: { bg: "tier-blue", icon: "💬" },
  POC: { bg: "tier-lavender", icon: "🧪" },
  Partnership: { bg: "tier-peach", icon: "🤝" },
  Funded: { bg: "tier-yellow", icon: "💰" },
};

export const QUEST_TYPE_STYLE: Record<
  QuestType,
  { label: string; bg: string; icon: string }
> = {
  connect: { label: "Connect", bg: "tier-silver", icon: "🔗" },
  meeting: { label: "Meeting", bg: "tier-blue", icon: "💬" },
  programme: { label: "Programme", bg: "tier-lavender", icon: "🎓" },
  poc: { label: "POC", bg: "tier-yellow", icon: "🧪" },
  partnership: { label: "Partnership", bg: "tier-peach", icon: "🤝" },
  funding: { label: "Funding", bg: "tier-red", icon: "💰" },
};

export const STATUS_STYLE: Record<QuestStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-ink/5 text-muted" },
  submitted: { label: "Checking proof", className: "bg-yellow text-ink" },
  verified: { label: "Verified ✓", className: "bg-green text-white" },
  rejected: { label: "Rejected", className: "bg-[#FFB2B3] text-ink" },
};
