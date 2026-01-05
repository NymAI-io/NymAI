# Project Status

> Last updated: 2026-01-05

## Current Phase: HubSpot MVP - Real API Integration Complete

HubSpot UI Extension (Option B) is fully integrated with real CRM data (Notes, Emails, Calls) and the NymAI production API. Build #6 successfully deployed to portal 244760488 (nym-ai).

---

## Milestone Progress

### HubSpot MVP (Phase 1 Complete)

| Component                 | Status  | Notes                                        |
| ------------------------- | ------- | -------------------------------------------- |
| Vision docs overhaul      | Done    | All 6 docs updated for HubSpot               |
| project_spec.md update    | Done    | PRD + EDD rewritten for HubSpot              |
| AGENTS.md update          | Done    | Architecture, commands updated               |
| HubSpot Developer Account | Done    | Account 244760488                            |
| UI Extension integration  | Done    | Option B complete, modular hook architecture |
| Real CRM Data Sync        | Done    | Fetching Notes, Emails, Calls via API        |
| OAuth 2.0 Implementation  | Pending | Static auth for dev, OAuth for marketplace   |
| Marketplace submission    | Pending | Ready for testing before review              |

---

## What's Working

**HubSpot UI Extension (v5.2.0):**

- **Modular Architecture:** Clean separation of API clients, hooks (`usePIIScanner`), and UI components.
- **Real CRM Integration:** Fetches real Notes, Emails, and Calls using HubSpot CRM API v3/v4.
- **Production API Connection:** Communicates directly with NymAI API on DigitalOcean.
- **Detection Summary:** Confidence scores and masked previews for all 12 PII types.
- **One-Click Redaction:** Batch redaction across multiple activities with progress states.
- **Robust Undo:** 10-second window with full CRM rollback and memory cleanup.
- **Reliability:** Concurrency guards and memory leak fixes implemented.
- **Deployment:** Build #6 live on portal 244760488.

**Detection Engine (@nymai/core):**

- 12 PII types detected with target accuracy
- Credit card Luhn validation
- ABA routing number validation
- Masking preserves last 4 digits for context

**API Server (@nymai/api):**

- Health check endpoint responding
- Detection endpoint returns findings
- Redaction endpoint returns masked text
- Settings and logs endpoints functional

**Admin Console:**

- Deployed to Vercel
- Login via Google OAuth
- Dashboard, Settings, Logs pages functional

**Attachment OCR:**

- Client-side OCR using Tesseract.js v6.0.1
- PDF.js v3.11.174 for PDF rendering
- Canvas-based redaction with black box overlays

---

## Next Steps

### Immediate (Next Steps)

- [x] Create HubSpot Developer Account (244760488)
- [x] Create HubSpot App (App ID: 27806747)
- [x] Scaffold UI Extension (nymai_panel deployed)
- [x] Install app on account
- [x] Wire handleScan to fetch CRM activities via HubSpot API
- [x] Wire handleScan to POST to NymAI API `/api/detect`
- [x] Wire handleRedact to POST to NymAI API `/api/redact`
- [x] Wire handleRedact to PATCH HubSpot records
- [x] Implement real undo functionality
- [ ] Manual E2E testing in HubSpot sandbox
- [ ] Implement OAuth 2.0 for multi-portal support
- [ ] Submit to HubSpot Marketplace

### Milestone 1: MVP (Month 1-2)

- [ ] Email scanning (synced Gmail/Outlook)
- [ ] Call transcript scanning
- [ ] Conversations scanning (chat)
- [ ] Bulk operations
- [ ] 10-second undo
- [ ] Attachment OCR (Pro feature)

### Milestone 2: Growth (Month 2-12)

- [ ] First 10 paying customers
- [ ] GDPR erasure workflow
- [ ] Scheduled scans (Business tier)
- [ ] ML enhancement (Business tier)
- [ ] Target: $5K MRR

### Milestone 3: Scale (Month 12-15)

- [ ] Custom detection patterns
- [ ] SSO / SAML Support
- [ ] API Access
- [ ] Target: $15K MRR

### Milestone 4: Expansion (Month 12-15)

- [ ] 175+ active customers
- [ ] Enterprise tier maturity
- [ ] Target: $41K MRR

---

## Pricing

| Tier       | Base    | Per Seat           | Scans/mo  |
| ---------- | ------- | ------------------ | --------- |
| Individual | $29/mo  | —                  | 1K        |
| Pro        | $99/mo  | +$15/seat after 5  | 15K       |
| Business   | $249/mo | +$12/seat after 15 | 75K       |
| Enterprise | Custom  | Custom             | Unlimited |

**Trial:** 14 days, Pro features, work email required

**Target:** $41K MRR by Month 15

---

## Architecture Decisions

| Decision       | Choice                     | Rationale                     |
| -------------- | -------------------------- | ----------------------------- |
| API Framework  | Hono                       | Lightweight, TypeScript-first |
| Database       | Supabase                   | Free tier, RLS, Auth included |
| HubSpot Client | UI Extensions + Serverless | Native CRM integration        |
| Detection      | Regex-first                | Simple, auditable, fast       |
| OCR            | Tesseract.js (client-side) | Free, privacy-preserving      |
| Monorepo       | pnpm workspaces            | Efficient, strict mode        |

---

## References

- [Architecture](./architecture.md) - System design details
- [Changelog](./changelog.md) - Version history
- [Project Spec](../project_spec.md) - Technical specification
- [Vision Docs](../vision/) - Strategy, market, competitive analysis
