# ROADMAP.md

**Version:** 5.0 (Clarified ICP & Sales Playbook)
**Last Updated:** January 4, 2026
**Related Documents:** [VISION.md](./VISION.md), [project_spec.md](../project_spec.md)

---

## 1. Business Context: The HubSpot Pivot

NymAI is pivoting from a Zendesk-centric tool to a HubSpot-native PII detection and redaction platform. HubSpot's CRM ecosystem offers a larger market of mid-market and enterprise customers who handle sensitive data across a wider variety of objects (Contacts, Deals, Tickets, Emails, etc.).

### Technical Shift

| Feature            | Zendesk (Old)              | HubSpot (New)                                                                   |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------- |
| **UI Integration** | ZAF SDK (Frontend Sidebar) | React UI Extensions                                                             |
| **Backend Logic**  | Direct API Calls           | HubSpot Serverless Functions                                                    |
| **Authentication** | ZAF Auth (Implicit)        | OAuth 2.0 (Managed Tokens)                                                      |
| **Data Scope**     | Tickets & Comments         | Contacts, Companies, Deals, Tickets, Notes, Emails, Calls, Conversations, Forms |

---

## 2. Leveraged Assets

We are leveraging 90%+ of our existing core technology to accelerate this pivot:

- **@nymai/core (100% reusable):** The PII detection engine supporting 12 data types (SSN, CC, DOB, etc.) remains the heart of the product.
- **API Server (90% reusable):** The Hono-based backend on DigitalOcean continues to handle the heavy lifting of detection and redaction logic.
- **Admin Console (100% reusable):** The React/Vite dashboard for usage stats and settings remains platform-agnostic.
- **Supabase (100% reusable):** Metadata logging and workspace configuration schema are fully compatible with the HubSpot model.

---

## 3. Technical Stack

- **Monorepo:** pnpm workspaces for managing multiple packages.
- **Core Engine:** `@nymai/core` (TypeScript, zero dependencies).
- **Primary API:** Hono running on DigitalOcean App Platform.
- **Database:** Supabase for metadata and workspace configurations (PII-free).
- **Admin Portal:** React + Vite hosted on Vercel.
- **HubSpot Integration:** React UI Extensions for the frontend + HubSpot Serverless Functions for data orchestration.

---

## 4. MILESTONE 1: MVP (Month 1-2)

**Goal:** Capture the SMB Moat (Individual + Pro)

### Deliverables

- **HubSpot App:** React UI Extension + Serverless Functions.
- **Full Coverage:** Scanner support for Notes, Emails, Calls, and Chats.
- **Workflow:** Manual scan + One-click Redact + 10s Undo window.
- **Distribution:** HubSpot Marketplace Listing.
- **Pricing:** Individual ($29) and Pro ($99) tiers LIVE.
- **Accuracy:** Smart Regex detection (~85-88% precision).
- **Trial:** 14-day free trial with Pro features enabled.
- **Attachment OCR:** Client-side OCR for images/PDFs (Pro feature).
- **"Coming Soon":** Business features (Automation, ML enhancement).

### Success Metrics

- Successful marketplace submission.
- End-to-end redaction of Notes, Emails, and Call Transcripts.
- Target: First 10 paying customers.

---

## 5. MILESTONE 2: GROWTH (Month 2-12)

**Goal:** Expand to Mid-Market (Business)

### Deliverables

- **Business Tier:** $249/mo tier LIVE.
- **Scheduled Scans:** Automated daily/weekly scans (Automation).
- **GDPR Erasure Workflow:** Automated finding and purging of specific contact PII.
- **ML Enhancement Layer:** LLM-based verification for ambiguous detections (~95% accuracy).
- **Advanced OCR:** Server-side enhancement for complex document types.

### Targets

- **Customers:** 100+ active customers.
- **Revenue:** $15,000 Monthly Recurring Revenue (MRR).

---

## 6. MILESTONE 3: SCALE (Month 12-15)

**Goal:** Enterprise Capture

### Deliverables

- **Enterprise Tier:** Custom pricing tier LIVE.
- **Custom Patterns:** User-defined regex patterns for company-specific data.
- **Enterprise Security:** SSO / SAML support (Okta, Azure AD).
- **Extensibility:** API Access for external integrations.
- **Support:** Dedicated SLA & Priority Support.

### Targets

- **Customers:** 175+ active customers.
- **Revenue:** $41,000 Monthly Recurring Revenue (MRR).

---

## 7. Accuracy Targets by Milestone

| Milestone   | Detection Method               | Target Accuracy |
| ----------- | ------------------------------ | --------------- |
| Milestone 1 | Smart Regex + Confidence Score | ~85-88%         |
| Milestone 2 | + ML Enhancement Layer         | ~95%            |
| Milestone 3 | + Custom Detection Patterns    | ~97%+           |

---

## 8. Decision Gate: $41K MRR

Once the $41,030 MRR milestone is sustained for three consecutive months, the following strategic paths will be evaluated:

- **Option A: Lifestyle Business:** Focus on high margins and low overhead. Maintain the business at $41K–$50K MRR with minimal feature expansion.
- **Option B: Strategic Sale:** Position NymAI for acquisition by a larger Data Loss Prevention (DLP) player or CRM platform.
- **Option C: Capital Expansion:** Transition to a C-Corp, raise institutional capital, and pursue multi-surface DLP (Slack, Teams, Salesforce, Google Workspace).

---

## 9. Pricing

| Tier       | Base Price    | Per Seat After | Included Seats | Scans/mo  |
| ---------- | ------------- | -------------- | -------------- | --------- |
| Individual | $29/mo        | —              | 1 (fixed)      | 1K        |
| Pro        | $99/mo        | +$15/seat      | 5 included     | 15K       |
| Business   | $249/mo       | +$12/seat      | 15 included    | 75K       |
| Enterprise | Contact Sales | Custom         | Unlimited      | Unlimited |

---

## 10. Success Metrics

- **Precision:** Maintain ≥90% accuracy for SSN and Credit Card detection.
- **Latency:** Redaction round-trip (UI Extension → Serverless → API → HubSpot) under 2 seconds.
- **Churn:** Target monthly churn <3%.
- **Growth:** 20% month-over-month revenue growth after Milestone 1.

---

**End of Roadmap**
