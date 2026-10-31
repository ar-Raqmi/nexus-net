This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Completed

- Company onboarding, document review and a professional company passport, separate from quests and XP.
- Approved, rejected and retry flows, saved profiles, and re-verification after company details change.
- Matching [demo profiles and evidence](public/demo-evidence/README.md) for all 10 startups, two negative samples, editable sources, and a **Use sample company** simulation shortcut.
- Registration-to-passport browser checks, refresh persistence and mobile layouts verified. Live AI rejection tested; demo approval is explicitly labelled.

Start at `/register`, choose **Use sample company**, save, download the sample image and upload it to receive a demo passport. Account data is browser-local; live authentication and registry checks are not implemented.


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


## Company registration, verification and passport

Company verification belongs to onboarding and the company profile. It is separate from quests and never grants XP or changes quest status.

- `/register`: enter the legal company name, registration number, jurisdiction, website, sector, stage and description. New profiles are added to the local company list; selecting a seeded startup lets you onboard that company instead.
- `/profile`: complete the company record, upload registration evidence, view the result, retry, and view the issued company passport after approval. Editing company details invalidates the previous review and passport until the revised profile is reviewed.
- `/quests`: startup activities and XP only. No identity upload, sample proof task or passport.

Set `GEMINI_API_KEY` and the image-capable model ID in `GEMMA_MODEL` in `.env.local`. Run `npm install` and `npm run dev`, then open `/register`, or select a demo startup from `/`.

The document review accepts PNG, JPEG and WebP images up to 10 MB. The browser resizes images to at most 1280 pixels wide and 1800 pixels high before submitting them to Google AI. Upload a company incorporation certificate or business registry extract; the model compares the legal name, registration number and jurisdiction with the profile. A quest screenshot, meeting invite or POC agreement is not company identity evidence. Approval with confidence at least 0.7 issues a passport ID. Rejection, uncertainty, low confidence or API failure does not issue a passport.

`POST /api/company/verify` accepts `{ profile, imageBase64, mimeType }` and returns `{ verification: { profile, verdict, mode, checkedAt, passportId? } }`. The old quest proof endpoint has been removed. The server validates inputs and model output, retries once, and returns readable 400/413/503/502 errors. Failed calls do not silently switch to a canned result.

`/profile?demo=1` uses a canned approval without a model call. Demo passports are clearly labelled. A real review is available by leaving demo mode and submitting another document.

This remains a prototype registration flow, with browser-local profiles and review records in `nexus-net-game` localStorage. No password, live authentication, shared database, official registry lookup, ownership check or tamper-proof credential is implemented. Images are sent to Google AI but are not stored in localStorage. All seeded company data is fictional. Legacy quest verdicts do not count as company identity verification.

### Checks

Run `npm run lint` and `npm run build`. For browser regression checks, start `npm run start -- --port 3100`, then run `python tests/proof_verification.py` in an environment with Python Playwright installed. Set `BASE_URL` and `CHROME_PATH` as needed (defaults: `http://localhost:3100` and `/usr/bin/google-chrome`). The checks cover onboarding, rejection, uncertainty, low confidence, API errors, approval and persistence, no XP or quest changes, profile edit invalidation, company separation, new company registration, demo labels, image validation, mobile layouts and removal of the old endpoint. Approval cases use controlled model responses; demo requests use the actual local endpoint without a model call.
