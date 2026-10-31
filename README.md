# Nexus Net (ASEAN Quest)

Startups earn XP by turning ecosystem connections into real outcomes. Gemma 4 generates their quests and verifies their proof, and Cradle sees the conversion funnel live.

Built at Hacktoberfest Hack Day KL, 31 Oct 2026.

## Problem statement #1: Outcome Conversion

> "How can Startup ASEAN successfully convert ecosystem connections into measurable outcomes, including investments, commercial partnerships, market expansion, and cross-border POCs?"

**Category:** Best Use of Gemma 4 (via the Gemini API)

## Features

- **Startup profile + demo login:** pick a seeded startup on `/` (no real auth).
- **AI quest generator:** Gemma 4 writes 5 personalised, mostly cross-border quests from the profile and the programme/event catalog.
- **AI needs assessment (`/needs`):** a few fixed questions; code detects and ranks the startup's gaps; Gemma words each option; add any option as a quest done by a talent.
- **Quest proof verification:** upload a screenshot or document for a quest; Gemma 4 vision approves, rejects or flags it. Approval awards XP and counts as a verified outcome.
- **Company verification (`/register`, `/profile`):** onboarding identity check of a registration document; issues a company passport, never XP.
- **XP & levels:** Connected → Engaged → POC → Partnership → Funded, derived from XP.
- **Leaderboards:** startups, countries and events.
- **Cradle dashboard (`/cradle`):** funnel from connections to investments, outcomes by country, results by event.
- **Events calendar (`/events`):** public Kuala Lumpur events from Luma; subscribing earns bonus XP.

## Tech stack

Next.js (App Router, TypeScript) · Tailwind CSS · Zustand (persisted to localStorage) · Recharts · `@google/genai` for Gemma 4.

## Setup

```bash
npm install
```

Create `.env.local` (see `.env.example`):

```bash
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
```

```bash
npm run dev
```

Open http://localhost:3000. Add `?demo=1` to `/quests` to fall back to a saved quest list if Gemma is unreachable.

## Architecture

- **Client:** pages under `src/app`, components under `src/components`, game state in a persisted Zustand store (`src/store`). No database.
- **Server:** Gemma is only ever called from server route handlers (`/api/quests/generate`, `/api/needs/analyze`, `/api/proof/verify`, `/api/company/verify`). The API key never reaches the browser.
- **Gemma calls** (`src/lib/gemma.ts`): JSON-only prompts, code fences stripped before parsing, one retry, then a readable error. Model output is validated; XP values always come from our own table, never from the model.

## Honesty notes

- All seed data (startups, programmes, events, past quests), talent profiles and the demo proof images in `demo-assets/` are **fictional**.
- The `/events` calendar shows real public listings from Luma; nothing else uses real Startup ASEAN data.
- The needs-assessment questions are fixed, not AI-generated, and the gaps are found by code. Gemma only writes the wording.
- Gemma's confidence scores are not calibrated (they come back near 1.0), so approvals don't rely on the confidence threshold alone.

## Two separate proof checks

1. **Company identity (onboarding, no XP).** `/register` → `/profile`: upload an incorporation certificate or registry extract (PNG/JPEG/WebP). Gemma compares the legal name, registration number and jurisdiction with the profile; approval issues a company passport. It never grants XP or changes quests. Sample profiles and evidence for all 10 startups are in `public/demo-evidence/`.
2. **Quest proof (outcomes, XP).** `/quests`: each open quest has **Submit proof**. Gemma checks the image against the quest (prompt 2 in `CLAUDE.md`, with today's date). Approved proof marks the quest verified, awards its XP and counts in the Cradle funnel. Test images are in `demo-assets/`.

Both offer a clearly labelled **simulation (no AI)** mode for demos; live Gemma is the default. Event-calendar XP never counts as a verified outcome.

Checks: `node --test tests/company_verification.test.mjs` (company route with a stubbed provider), `npm run lint`, `npm run build`.

## Team & license

Built by the Nexus Net team. Released under the [MIT License](LICENSE).
