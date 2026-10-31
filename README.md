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
- **Proof verification** *(in progress)*: upload a screenshot or document; Gemma 4 vision approves, rejects or flags it.
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
- **Server:** Gemma is only ever called from server route handlers (`/api/quests/generate`, `/api/needs/analyze`, proof verification next). The API key never reaches the browser.
- **Gemma calls** (`src/lib/gemma.ts`): JSON-only prompts, code fences stripped before parsing, one retry, then a readable error. Model output is validated; XP values always come from our own table, never from the model.

## Honesty notes

- All seed data (startups, programmes, events, past quests), talent profiles and the demo proof images in `demo-assets/` are **fictional**.
- The `/events` calendar shows real public listings from Luma; nothing else uses real Startup ASEAN data.
- The needs-assessment questions are fixed, not AI-generated, and the gaps are found by code. Gemma only writes the wording.
- Gemma's confidence scores are not calibrated (they come back near 1.0), so approvals don't rely on the confidence threshold alone.

## Team & license

Built by the Nexus Net team. Released under the [MIT License](LICENSE).
