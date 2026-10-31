import { ICON_FOR_QUEST_TYPE, type PixelIconName } from "@/components/PixelIcon";
import type { QuestStatus, QuestType } from "./types";

// Visual style per level: pastel gradient utility (see globals.css) + icon.
export const TIER_STYLE: Record<string, { bg: string; icon: PixelIconName }> = {
  Connected: { bg: "tier-silver", icon: "connect" },
  Engaged: { bg: "tier-blue", icon: "meeting" },
  POC: { bg: "tier-lavender", icon: "poc" },
  Partnership: { bg: "tier-peach", icon: "partnership" },
  Funded: { bg: "tier-yellow", icon: "funding" },
};

export const QUEST_TYPE_STYLE: Record<
  QuestType,
  { label: string; bg: string; icon: PixelIconName }
> = {
  connect: { label: "Connect", bg: "tier-silver", icon: ICON_FOR_QUEST_TYPE.connect },
  meeting: { label: "Meeting", bg: "tier-blue", icon: ICON_FOR_QUEST_TYPE.meeting },
  programme: { label: "Programme", bg: "tier-lavender", icon: ICON_FOR_QUEST_TYPE.programme },
  poc: { label: "POC", bg: "tier-yellow", icon: ICON_FOR_QUEST_TYPE.poc },
  partnership: { label: "Partnership", bg: "tier-peach", icon: ICON_FOR_QUEST_TYPE.partnership },
  funding: { label: "Funding", bg: "tier-red", icon: ICON_FOR_QUEST_TYPE.funding },
};

export const STATUS_STYLE: Record<QuestStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-ink/5 text-muted" },
  submitted: { label: "Checking proof", className: "bg-yellow text-ink" },
  verified: { label: "Verified", className: "bg-green text-white" },
  rejected: { label: "Rejected", className: "bg-[#FFB2B3] text-ink" },
};
