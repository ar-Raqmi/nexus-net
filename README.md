This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Event Calendar

The `/events` page is the ecosystem-discovery layer of Nexus Net. It pulls live public
events from Luma's Kuala Lumpur feed (`api.lu.ma`) so startups can find the meetups,
workshops, and conferences that move them toward real outcomes.

**Purpose for gaining XP:** attending the right rooms is how connections turn into
outcomes, so browsing alone isn't rewarded — committing is. When a startup logs in and
subscribes to an event calendar, it earns **+50 XP**, or **+100 XP** when the event
matches its sector (fintech, agritech, healthtech, etc.). XP is credited once per startup
per event, and relevance is scored from the startup's sector, description, and the event's
title, hosts, and category. This ties the calendar directly into the same XP and level
track as quests, giving startups a lightweight, always-available way to earn progress
between quests.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
