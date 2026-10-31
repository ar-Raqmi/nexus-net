# Nexus Net (ASEAN Quest) — project guide for Claude Code

Hackathon: Hacktoberfest Hack Day KL, 31 Oct 2026. Hard deadline: feature freeze 2:00 PM, submission 3:00 PM.

## HOW TO WORK (most important)
- Build INCREMENTALLY, one phase at a time (see "Build phases"). Never build several phases in one go.
- At the end of each phase: run `npm run build` (must pass), then STOP and reply with:
  - what you built (bullets), files touched, how I can test it in the browser
  - then wait for me to say "next" before starting the next phase.
- After each phase passes, make one git commit: `git add -A && git commit -m "phase N: <summary>"`.
- Keep it simple: no auth, no database, no extra libraries beyond those listed below. Ask before adding any dependency.
- Windows machine. Dev server: `npm run dev` (scripts use `--webpack`; do not change that).
- Never put the API key in client code or commit `.env.local`.

## Product
- Gamified outcome tracker for Startup ASEAN (Cradle). Problem statement #1, Outcome Conversion:
  "How can Startup ASEAN successfully convert ecosystem connections into measurable outcomes, including investments, commercial partnerships, market expansion, and cross-border POCs?"
- Category: Best Use of Gemma 4 (via the Gemini API).
- One-liner: startups earn XP by turning connections into real outcomes; Gemma 4 generates their quests and verifies their proof; Cradle sees the conversion funnel live.

## Locked features
- F1 Startup profile + demo login: pick a seeded startup on `/` (stored in Zustand + localStorage).
- F2 AI quest generator (Gemma, text): 5 personalised, mostly cross-border quests from the profile + catalog.
- F3 AI proof verification (Gemma, vision): upload image → approved / rejected / unclear + confidence + reason. Count only approved with confidence >= 0.7.
- F4 XP and levels: XP per type connect 20, meeting 50, programme 75, poc 150, partnership 250, funding 400. Levels by total XP: Connected 0, Engaged 100, POC 300, Partnership 600, Funded 1000 (derived, never stored).
- F5 Leaderboards: tabs Startups / Countries / Events. Top-3 podium + ranked list.
- F6 Cradle dashboard `/cradle`: funnel (connections → meetings → POCs → partnerships → investments), outcomes by country (bar chart), table by event, headline conversion %.
- Out of scope: real auth, real Startup ASEAN data, notifications, reviewer queue, mobile app.

## Stack
- Next.js App Router + TypeScript + Tailwind (already scaffolded, `src/` dir).
- Allowed deps: `@google/genai`, `zustand`, `recharts`. Nothing else without asking.
- Fonts via `next/font/google`: Inter (body), Micro 5 (big pixel numbers), Quantico (scores/numbers), Rammetto One (chunky display headings).
- Env vars in `.env.local`: `GEMINI_API_KEY`, `GEMMA_MODEL` (exact Gemma 4 model id; read it from env, never hardcode).
- Gemma calls ONLY from server route handlers. Ask for JSON only; strip ``` fences before JSON.parse; retry once; on failure return 502 with a readable message. Do not rely on a JSON-mode flag.
- Images: resize client-side to max 1280px width, send base64 + mimeType.

## Data model
```ts
type Country = 'MY'|'SG'|'ID'|'VN'|'TH'|'PH';
type QuestType = 'connect'|'meeting'|'programme'|'poc'|'partnership'|'funding';
interface Startup { id: string; name: string; country: Country; sector: string; stage: 'pre-seed'|'seed'|'series-a'; description: string; xp: number; }
interface Quest { id: string; startupId: string; eventId?: string; title: string; why: string; type: QuestType; targetCountry: Country; xp: number; proofRequired: string; status: 'open'|'submitted'|'verified'|'rejected'; verdict?: Verdict; completedAt?: string; }
interface Verdict { decision: 'approved'|'rejected'|'unclear'; confidence: number; documentType: string; parties: string[]; date?: string; reason: string; }
interface Event { id: string; name: string; country: Country; date: string; }
```

## Seed data (all fictional, say so in README)
- `src/seed/startups.json`: 10 startups across MY, SG, ID, VN, TH, PH; mixed sectors. 6 pre-loaded with XP.
  Demo hero: "PayLah Lite", MY fintech, ~250 XP (Engaged) so one POC approval lifts it to POC level.
- `src/seed/catalog.json`: 8 made-up programmes (country, type, one line).
- `src/seed/events.json`: "ASEAN Founders Connect KL", "Jakarta Fintech Meetup", "Hanoi Agritech Day".
- `src/seed/quests.json`: ~25 historical verified quests across startups/events (drives dashboard numbers).
- `src/seed/fallback.json`: one canned quest list + one canned verdict (used only with `?demo=1`).

## API routes
- `POST /api/quests/generate` body `{ startup, catalog }` → `{ quests }` (server adds id, startupId, status 'open').
- `POST /api/proof/verify` body `{ quest, startup, imageBase64, mimeType }` → `{ verdict }`.

## Gemma prompt 1 — quest generator
```
You are the quest engine for Startup ASEAN, a platform that helps startups turn ecosystem connections into measurable outcomes across the 10 ASEAN countries.
Given a startup profile and a list of available programmes and events, create exactly 5 quests that move this startup toward real cross-border outcomes.
Rules:
- At least 3 quests must target a country other than the startup's home country.
- Mix types so the 5 quests climb the ladder: connect, meeting, programme, poc, partnership, funding. Include at least one poc or partnership.
- Each quest must be specific and doable in 2-4 weeks.
- Use these exact XP values: connect 20, meeting 50, programme 75, poc 150, partnership 250, funding 400.
- proofRequired = the one screenshot or document that proves completion.
- Only reference programmes/events from the list provided.
Return ONLY a JSON array, no prose, no code fences:
[{"title":"...","why":"one sentence on the outcome it creates","type":"poc","targetCountry":"VN","xp":150,"proofRequired":"...","eventId":"optional id from list"}]
Startup: {{startup_json}}
Programmes and events: {{catalog_json}}
```

## Gemma prompt 2 — proof verifier (image + text)
```
You verify proof for a Startup ASEAN quest. Look at the attached image and decide if it reasonably proves the quest was completed.
Quest: {{quest_title}}
Quest type: {{quest_type}}
Proof required: {{proof_required}}
Startup: {{startup_name}} ({{startup_country}})
Check: correct document type for the proof required; names the startup or founder and a counterpart organisation; counterpart country matches the target country if visible; has a recent date; red flags (blank templates, unrelated images, obvious edits).
Return ONLY JSON, no prose, no code fences:
{"decision":"approved|rejected|unclear","confidence":0.0,"documentType":"...","parties":["..."],"date":"YYYY-MM-DD or null","reason":"one sentence a founder would understand"}
```

## UI style guide (gamified pixel style)
Inspired by a gamified "creator fund" landing page. Recreate the STYLE only. Do not copy any other site's images, logos, characters or text.
- Background: warm off-white `#F7F4F2` with a faint graph-paper grid (CSS background-image, ~24px cells, very light lines).
- Cards: white, large radius (rounded-2xl/3xl), soft shadow, generous padding.
- Colours: primary blue `#405CEE` (CTAs, links, scores); purple `#6E68FF` / `#4E4BA6` (progress track, rank tabs); yellow `#FFDD56`; green `#01C16B`; text `#222222`, muted `#666666` / `#999999`.
- Signature gradient: `linear-gradient(90deg, #FFD44E, #FF8D22 39%, #FB88FF 73%, #55FFDA)` for highlights/badges.
- Tier card backgrounds (pastel vertical gradients): red `#FFEBEB→#FFB2B3`, silver `#EDF2F6→#BCC6D4`, yellow, blue, lavender, peach.
- Typography: huge black pixel number in the hero (Micro 5), section titles bold Inter ~40px centred with a one-line muted subtitle; scores in Quantico, blue.
- Components to build:
  - Hero: countdown pill at the top ("Q4 season ends in 0d 20h 40m"), small kicker line, giant pixel counter (e.g. "1,284" outcomes verified), one pill CTA in primary blue, small scattered pixel-style icons (simple inline SVG/emoji, no external art).
  - Level track: thick purple rounded bar with 5 numbered hexagon nodes; a marker at the current level.
  - Tier cards row: 5 cards (Connected, Engaged, POC, Partnership, Funded), pastel gradient top, icon, title, pill saying the XP needed, "Locked"/"Unlocked" tag top-right.
  - Quest cards: coloured top block with a round coin badge showing "+150 XP", title, target-country flag, type tag, status.
  - Leaderboard: dark panel (`#222`) with faint grid, Top-3 podium cards (yellow centre/TOP1, red left/TOP2, blue right/TOP3, slightly tilted, score with fire icon), then a ranked list with alternating purple/green rank tabs and big blue scores.
  - Sticky footer bar optional; keep a simple top nav: logo text "Nexus Net", links Quests / Leaderboard / Cradle view.

## Build phases (do ONE at a time, stop after each)
1. Foundation: install allowed deps, fonts, Tailwind theme tokens + grid background, layout + top nav, types, seed JSON files, Zustand store (persisted) with selectors for level/XP/leaderboards/funnel. Placeholder pages for `/`, `/quests`, `/leaderboard`, `/cradle`.
2. `/` page: hero (countdown pill, giant counter from seed, CTA) + grid of startup cards to "log in" as a startup.
3. `/quests` static UI: header with startup, level badge, XP bar; level track + 5 tier cards; quest cards rendered from store (seeded quests). No AI yet.
4. Quest generation: `/api/quests/generate` with prompt 1 + "Generate my quests" button, loading state, errors shown nicely, `?demo=1` fallback.
5. Proof verification: upload modal, client-side resize, `/api/proof/verify` with prompt 2, verdict panel, XP + level update with a simple animation.
6. `/leaderboard`: tabs Startups / Countries / Events, dark podium panel + ranked list.
7. `/cradle`: funnel, outcomes by country bar chart (recharts), table by event, headline conversion %.
8. Polish: empty/loading states, responsive check, README (problem statement, features, setup, env vars, how to run, architecture, "seed data is fictional"), `.env.example`.
