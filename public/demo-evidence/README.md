# Nexus Net demo evidence

These are fictional sample records for a product demonstration, not official company documents.

## Quick simulation

1. Open `/register`, click **Use sample company**, then **Save and continue**.
2. Download `01-matching-company-record.png` using the sample download link on the company profile.
3. Click **Verify company**, upload that PNG, then **Verify company** in the dialog.
4. View the labelled **Demo passport**. Refresh to confirm it is saved.

**Use sample company** enables canned demo approval (`/profile?demo=1`) so the presentation does not depend on a model call. It is not an AI or registry check.

## Profile values

| Field | Value |
| --- | --- |
| Legal company name | PayLah Lite |
| Registration number | MY-DEMO-2026-001 |
| Country | Malaysia (MY) |
| Website | https://paylah-lite.example/ |
| Sector | Fintech |
| Stage | Seed |
| Description | Lightweight QR payments and instant settlement for hawker stalls and micro-merchants. |

## Files

- [01-matching-company-record.png](01-matching-company-record.png): matches the profile above; use for the deterministic demo approval.
- [02-mismatched-company-record.png](02-mismatched-company-record.png): a different fictional company, registration number and country.
- [03-incomplete-company-record.png](03-incomplete-company-record.png): missing registration number and jurisdiction.
- Matching `.html` files: editable source documents. `profile-values.json`: exact profile values.

For live AI testing, leave demo mode and upload a document. The mismatched and incomplete samples should not issue a passport; the exact verdict can vary. All samples are marked fictional, so a live model may also reject the matching sample. Demo mode always returns a labelled canned approval for a valid image, regardless of which sample is uploaded; it does not test document matching.

Recreate the PNGs from the repository root with `python scripts/generate-demo-evidence.py` in an environment with Python Playwright and Google Chrome installed. Set `CHROME_PATH` if needed.

## All seeded companies

Selecting a seeded startup now prefills its fictional registration number and website. Click **Use sample company** to enable its labelled demo simulation.

| Company | Registration number | Website | Matching upload |
| --- | --- | --- | --- |
| PayLah Lite | MY-DEMO-2026-001 | https://paylah-lite.example/ | [PNG](01-matching-company-record.png) |
| TaniPintar | ID-DEMO-2026-002 | https://tanipintar.example/ | [PNG](tanipintar-company-record.png) |
| MediLink | SG-DEMO-2026-003 | https://medilink.example/ | [PNG](medilink-company-record.png) |
| GreenHaul | VN-DEMO-2026-004 | https://greenhaul.example/ | [PNG](greenhaul-company-record.png) |
| LearnLoop | PH-DEMO-2026-005 | https://learnloop.example/ | [PNG](learnloop-company-record.png) |
| ShopSiam | TH-DEMO-2026-006 | https://shopsiam.example/ | [PNG](shopsiam-company-record.png) |
| VoltNest | SG-DEMO-2026-007 | https://voltnest.example/ | [PNG](voltnest-company-record.png) |
| HalalTrace | MY-DEMO-2026-008 | https://halaltrace.example/ | [PNG](halaltrace-company-record.png) |
| KopiStack | ID-DEMO-2026-009 | https://kopistack.example/ | [PNG](kopistack-company-record.png) |
| CareBridge | PH-DEMO-2026-010 | https://carebridge.example/ | [PNG](carebridge-company-record.png) |

`company-profiles.json` contains the complete synthetic profile dataset.
