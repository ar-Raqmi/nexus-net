import { COUNTRY_NAMES, XP_BY_TYPE } from "./game";
import type { Country, Quest, QuestType, Startup, Talent } from "./types";

export type QuestionId = "website" | "customers" | "product" | "pitch" | "contact" | "nextCountry";
export type NeedsAnswers = Record<QuestionId, string>;
export type GapId = "website" | "marketing" | "product" | "pitch" | "market";

export interface NeedsQuestion {
  id: QuestionId;
  prompt: string;
  /** `country` makes the UI render a <Flag /> next to the label. */
  choices: { value: string; label: string; country?: Country }[];
}

export const QUESTIONS: NeedsQuestion[] = [
  {
    id: "nextCountry",
    prompt: "Which ASEAN country do you want to win next?",
    choices: (Object.keys(COUNTRY_NAMES) as Country[]).map((c) => ({
      value: c,
      label: COUNTRY_NAMES[c],
      country: c,
    })),
  },
  {
    id: "website",
    prompt: "Do you have a website or landing page?",
    choices: [
      { value: "none", label: "No website yet" },
      { value: "basic", label: "Basic / outdated" },
      { value: "good", label: "Yes, it converts well" },
    ],
  },
  {
    id: "customers",
    prompt: "How do customers find you today?",
    choices: [
      { value: "referrals", label: "Word of mouth only" },
      { value: "social", label: "Some social posts" },
      { value: "ads", label: "Running ads and content" },
    ],
  },
  {
    id: "product",
    prompt: "How stable is your product?",
    choices: [
      { value: "prototype", label: "Prototype with known bugs" },
      { value: "rough", label: "Works, but rough edges" },
      { value: "stable", label: "Stable in production" },
    ],
  },
  {
    id: "pitch",
    prompt: "Where is your pitch deck?",
    choices: [
      { value: "none", label: "I don't have one" },
      { value: "draft", label: "A rough draft" },
      { value: "ready", label: "Investor-ready" },
    ],
  },
  {
    id: "contact",
    prompt: "Do you know anyone in that country?",
    choices: [
      { value: "none", label: "Nobody yet" },
      { value: "leads", label: "A few leads" },
      { value: "warm", label: "Yes, a warm intro" },
    ],
  },
];

interface Trigger {
  priority: number;
  type: QuestType;
}

interface GapRule {
  id: GapId;
  questionId: QuestionId;
  /** Answer value -> trigger. An answer not listed means no gap. */
  triggers: Record<string, Trigger>;
  /** Undefined means the founder does the work. */
  talentRole?: string;
  proofRequired: string;
  title: (country: string) => string;
  why: (country: string) => string;
}

const GAP_RULES: GapRule[] = [
  {
    id: "website",
    questionId: "website",
    triggers: { none: { priority: 100, type: "programme" }, basic: { priority: 60, type: "programme" } },
    talentRole: "Web developer",
    proofRequired: "Screenshot of the live website with its URL visible",
    title: () => "Get a website built",
    why: (c) => `Partners and customers in ${c} will check your website before they reply.`,
  },
  {
    id: "marketing",
    questionId: "customers",
    triggers: { referrals: { priority: 80, type: "programme" }, social: { priority: 50, type: "programme" } },
    talentRole: "Content creator",
    proofRequired: "Screenshot of the published ad or content with the date visible",
    title: () => "Commission ad and social content",
    why: (c) => `Content in the local context builds awareness in ${c} before you arrive.`,
  },
  {
    id: "product",
    questionId: "product",
    triggers: { prototype: { priority: 90, type: "programme" }, rough: { priority: 55, type: "programme" } },
    talentRole: "Bug fixer",
    proofRequired: "Screenshot of the closed bug list or merged fixes",
    title: () => "Fix the bugs blocking a pilot",
    why: (c) => `A pilot with a company in ${c} fails fast if the product breaks on the first demo.`,
  },
  {
    id: "pitch",
    questionId: "pitch",
    triggers: { none: { priority: 70, type: "programme" }, draft: { priority: 40, type: "programme" } },
    talentRole: "Pitch deck designer",
    proofRequired: "Screenshot of the finished deck's title and traction slides",
    title: () => "Build an investor-ready pitch deck",
    why: (c) => `Investors and programmes in ${c} will ask for a deck at the first meeting.`,
  },
  {
    id: "market",
    questionId: "contact",
    triggers: {
      none: { priority: 85, type: "connect" },
      leads: { priority: 50, type: "meeting" },
      warm: { priority: 30, type: "poc" },
    },
    proofRequired: "Screenshot of the connection, calendar invite or signed letter",
    title: (c) => `Open the door in ${c}`,
    why: (c) => `A real contact in ${c} is the first step to a pilot there.`,
  },
];

export const MAX_OPTIONS = 4;
const HIGH_PRIORITY = 80;
const MEDIUM_PRIORITY = 55;

export interface NeedOption {
  gapId: GapId;
  priority: number;
  urgency: "High" | "Medium" | "Low";
  type: QuestType;
  xp: number;
  talentRole?: string;
  targetCountry: Country;
  proofRequired: string;
  evidence: string;
  title: string;
  why: string;
}

function urgencyOf(priority: number): NeedOption["urgency"] {
  if (priority >= HIGH_PRIORITY) return "High";
  return priority >= MEDIUM_PRIORITY ? "Medium" : "Low";
}

function answerLabel(questionId: QuestionId, value: string): string {
  const question = QUESTIONS.find((q) => q.id === questionId);
  return question?.choices.find((c) => c.value === value)?.label ?? value;
}

/** Deterministic: the rules decide what the gaps are and how urgent. The model only words them. */
export function detectNeeds(answers: NeedsAnswers): NeedOption[] {
  const country = answers.nextCountry as Country;
  const countryName = COUNTRY_NAMES[country];
  const found: NeedOption[] = [];

  for (const rule of GAP_RULES) {
    const trigger = rule.triggers[answers[rule.questionId]];
    if (!trigger) continue;
    found.push({
      gapId: rule.id,
      priority: trigger.priority,
      urgency: urgencyOf(trigger.priority),
      type: trigger.type,
      xp: XP_BY_TYPE[trigger.type],
      talentRole: rule.talentRole,
      targetCountry: country,
      proofRequired: rule.proofRequired,
      evidence: answerLabel(rule.questionId, answers[rule.questionId]),
      title: rule.title(countryName),
      why: rule.why(countryName),
    });
  }
  return found.sort((a, b) => b.priority - a.priority).slice(0, MAX_OPTIONS);
}

export function isValidAnswers(value: unknown): value is NeedsAnswers {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return QUESTIONS.every((q) => q.choices.some((c) => c.value === record[q.id]));
}

export function needQuestId(startupId: string, gapId: GapId): string {
  return `${startupId}-need-${gapId}`;
}

export function toQuest(startup: Startup, option: NeedOption): Quest {
  return {
    id: needQuestId(startup.id, option.gapId),
    startupId: startup.id,
    title: option.title,
    why: option.why,
    type: option.type,
    targetCountry: option.targetCountry,
    xp: option.xp,
    proofRequired: option.proofRequired,
    talentRole: option.talentRole,
    status: "open",
  };
}

const MATCH_LIMIT = 2;

/** Best talent for a role: same country as the target market first, then rating. */
export function matchTalent(talent: Talent[], role: string, country: Country): Talent[] {
  return talent
    .filter((t) => t.role === role)
    .sort((a, b) => Number(b.country === country) - Number(a.country === country) || b.rating - a.rating)
    .slice(0, MATCH_LIMIT);
}
