# NymAI for HubSpot — Project Specification

**Version:** 3.2
**Date:** January 9, 2026
**Status:** HubSpot UI Extension Deployed (v2025.2 Migration Complete)

> **For Claude/AI coding assistants:** This is the single source of truth. Read this entire document before implementing any feature.

---

## Table of Contents

- [Part 1: Product Requirements](#part-1-product-requirements)
  - [1.1 Problem & Solution](#11-problem--solution)
  - [1.2 MVP Scope](#12-mvp-scope)
  - [1.3 Success Criteria](#13-success-criteria)
  - [1.4 User Workflows](#14-user-workflows)
  - [1.5 Pricing](#15-pricing)
- [Part 2: Engineering Design](#part-2-engineering-design)
  - [2.1 Tech Stack](#21-tech-stack)
  - [2.2 System Architecture](#22-system-architecture)
  - [2.3 Project Structure](#23-project-structure)
  - [2.4 API Contracts](#24-api-contracts)
  - [2.5 Detection Patterns](#25-detection-patterns)
  - [2.6 Security Controls](#26-security-controls)
  - [2.7 Environment Variables](#27-environment-variables)
  - [2.8 Deployment](#28-deployment)
  - [2.9 Testing Strategy](#29-testing-strategy)
  - [2.10 Local Development](#210-local-development)
  - [2.11 Known Limitations](#211-known-limitations)
- [Part 3: System Design Preferences](#part-3-system-design-preferences)
  - [3.1 API: REST vs GraphQL](#31-api-rest-vs-graphql)
  - [3.2 Database: ORM vs Raw SQL](#32-database-orm-vs-raw-sql)
  - [3.3 Logging Format](#33-logging-format)
  - [3.4 Naming Conventions](#34-naming-conventions)
  - [3.5 Feature vs Layer Structure](#35-feature-vs-layer-structure)
- [Part 4: Implementation Checklist](#part-4-implementation-checklist)
- [Part 5: Quick Reference](#part-5-quick-reference)

---

# Part 1: Product Requirements

## 1.1 Problem & Solution

|                        |                                                                                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem**            | Support agents paste sensitive data (SSNs, credit cards, IDs) into CRM records. When a CRM or a synced communication channel is breached, this data is exposed.                                                                              |
| **Solution**           | NymAI is a HubSpot app that detects and redacts sensitive data before it becomes a liability. Agents redact with one click; NymAI never stores raw content.                                                                                  |
| **Key Differentiator** | **Data Concentrator:** HubSpot acts as a single point of entry for Gmail, Outlook, Zoom calls, WhatsApp, and more. One NymAI integration scans everything. Ephemeral processing ensures raw text exists in memory <500ms, then is discarded. |

## 1.2 MVP Scope

### In Scope (Must Ship)

| Feature                                | Priority | Notes                                       |
| -------------------------------------- | -------- | ------------------------------------------- |
| Detect sensitive data (12 PII types)   | ✅ MVP   | Same patterns (SSN, CC, email, phone, etc.) |
| Agent-initiated redaction              | ✅ MVP   | Core value                                  |
| Notes + Tickets scanning               | ✅ MVP   | Milestone 1                                 |
| Emails scanning (synced Gmail/Outlook) | ✅ MVP   | Milestone 1                                 |
| Calls scanning (transcripts)           | ✅ MVP   | Milestone 1                                 |
| Conversations scanning (chat)          | ✅ MVP   | Milestone 1                                 |
| Attachment OCR                         | ✅ MVP   | Milestone 1 (Client-side OCR)               |
| Ephemeral backend                      | ✅ MVP   | No raw content storage                      |
| Admin console                          | ✅ MVP   | Toggles, mode, logs                         |
| HubSpot Marketplace listing            | ✅ MVP   | Distribution                                |
| 14-day free trial                      | ✅ MVP   | Work email required                         |

### Out of Scope (V1+)

- ❌ Automatic redaction
- ❌ Forms + Properties scanning (Business tier)
- ❌ Scheduled scans (Business tier)
- ❌ Custom patterns (Enterprise)
- ❌ SSO/SAML (Enterprise)

## 1.3 Success Criteria

| Metric                            | Target   |
| --------------------------------- | -------- |
| Text redaction completes          | <5s p95  |
| Attachment OCR scan               | <15s p95 |
| Detection precision (SSN/CC)      | ≥90%     |
| Detection precision (email/phone) | ≥85%     |
| Attachment OCR precision          | ≥75%     |
| Trial-to-paid conversion          | ≥15%     |
| Customers installed (Month 3)     | ≥50      |
| MRR (Month 15)                    | $41K     |

## 1.4 User Workflows

### Agent Flow (HubSpot)

```
1. Agent opens ticket/contact record
2. NymAI panel: "⚠️ Sensitive Data: SSN (94%), Phone (87%)"
3. Agent clicks [Redact All] → masked → "2 items redacted [Undo - 10s]"
4. Done.
```

### Admin Flow

```
1. Install from HubSpot Marketplace
2. OAuth authorization
3. Configure: toggle detection types, set mode
4. View logs: "Contact 123: SSN redacted by Agent Bob"
```

## 1.5 Pricing

| Tier       | Base Price    | Per Seat  | Included Seats | Scans/mo  |
| ---------- | ------------- | --------- | -------------- | --------- |
| Individual | $29/mo        | —         | 1 (fixed)      | 1K        |
| Pro        | $99/mo        | +$15/seat | 5 included     | 15K       |
| Business   | $249/mo       | +$12/seat | 15 included    | 75K       |
| Enterprise | Contact Sales | Custom    | Unlimited      | Unlimited |

**Trial:** 14 days, Pro features, work email required, 500 scans

---

# Part 2: Engineering Design

## 2.1 Tech Stack

**Total MVP Cost: ~$30/month** (after free tiers, with student credits: ~$25/month)

| Component                 | Technology                 | Cost   | Rationale                                            |
| ------------------------- | -------------------------- | ------ | ---------------------------------------------------- |
| **Backend API**           | Node.js + Hono             | -      | Ultrafast, TypeScript, portable                      |
| **Backend Hosting**       | DigitalOcean App Platform  | $5/mo  | Always-on, student credits available, simple deploys |
| **Backend Hosting (Alt)** | Render (Starter)           | $7/mo  | Alternative option, no cold starts                   |
| **Database**              | Supabase (Pro)             | $25/mo | PostgreSQL + Auth + Dashboard included               |
| **Admin Console**         | React + Vite               | -      | Simple SPA                                           |
| **Admin Hosting**         | Vercel or Cloudflare Pages | Free   | Static hosting                                       |
| **HubSpot App**           | UI Extensions (React)      | Free   | HubSpot-hosted, direct API calls to NymAI backend    |

### Why This Stack?

**Product Manager Perspective:**

- Predictable costs: $30/mo covers MVP through first 10 customers.
- Student-friendly: DigitalOcean offers $200 in student credits.
- Fast time-to-market: 8-10 weeks to ship.
- Low operational burden: No servers to manage.

**Senior Engineer Perspective:**

- Unified language: TypeScript everywhere (HubSpot app, backend, admin console).
- No cold starts: DigitalOcean/Render always-on instances mean consistent <500ms response times.
- Hono over Express: 12KB, ultrafast router, built-in TypeScript.
- Supabase over raw Postgres: Row Level Security, built-in auth, admin dashboard.

### Alternative Stacks Considered

| Stack                         | Monthly Cost | Pros                          | Cons                                     | Verdict                         |
| ----------------------------- | ------------ | ----------------------------- | ---------------------------------------- | ------------------------------- |
| **DigitalOcean + Supabase**   | $30          | Student credits, simple       | Slightly less polished than Render       | **Current choice**              |
| **Render + Supabase**         | $32          | Great DX, auto-deploy         | $2/mo more than DO                       | Alternative option              |
| **Cloudflare Workers + Neon** | $0-5         | Ultra cheap, edge-distributed | More complex setup, Neon cold starts     | Good for V1 optimization        |
| **FastAPI + Supabase**        | $32          | Python for future ML          | Two languages, slower regex than Node    | Consider if ML becomes priority |
| **Vercel + PlanetScale**      | $20-45       | Great DX                      | Cold starts, cost unpredictable at scale | Avoid for always-on API         |

### Cost Breakdown

**Month 1-3 (MVP/Beta) - Primary (DigitalOcean):**

```
DigitalOcean:       $5/mo  (basic-xxs, always-on) - covered by student credits
Supabase Pro:      $25/mo  (8GB database, 100K MAUs)
Vercel:             $0/mo  (free tier, <100GB bandwidth)
Cloudflare:         $0/mo  (free tier for DNS/CDN)
HubSpot:            $0/mo  (app hosting included)
─────────────────────────
Total:             $30/mo  (or $25/mo with student credits)
```

**Alternative (Render):**

```
Render Starter:     $7/mo  (512MB RAM, always-on)
Supabase Pro:      $25/mo  (8GB database, 100K MAUs)
Vercel:             $0/mo  (free tier, <100GB bandwidth)
─────────────────────────
Total:             $32/mo
```

**When to Upgrade:**

- > 1000 redactions/day → Consider DigitalOcean Basic ($12/mo) or Render Standard ($85/mo)
- > 100K MAUs → Supabase usage-based kicks in
- Global latency matters → Add Cloudflare Workers edge caching

## 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HUBSPOT CRM                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Record View (Ticket, Contact, Company, Deal)              │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐│ │
│  │  │ Record Data     │  │ NymAI UI Extension (React)      ││ │
│  │  │                 │  │                                 ││ │
│  │  │ Notes, Emails   │  │ ⚠️ Sensitive Data Detected     ││ │
│  │  │ Calls, Chats    │  │   • SSN (94%)                  ││ │
│  │  │                 │  │   • Phone (87%)                ││ │
│  │  │                 │  │                                 ││ │
│  │  │                 │  │ [Redact All] [Review]          ││ │
│  │  └─────────────────┘  └──────────────┬──────────────────┘│ │
│  └───────────────────────────────────────┼───────────────────┘ │
│                                          │                     │
│  UI Extension makes direct API calls:    │                     │
│  • Calls NymAI API with context.token    │                     │
│  • NymAI API proxies to HubSpot CRM API  │                     │
│  (v2025.2 pattern - no serverless)       │                     │
└──────────────────────────────────────────┼─────────────────────┘
                                           │
                                           │ HTTPS (TLS 1.3)
                                           │
┌──────────────────────────────────────────▼─────────────────────┐
│                 NYMAI BACKEND (DigitalOcean)                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                 Hono API Server                          │ │
│  │                                                          │ │
│  │  POST /api/redact                                        │ │
│  │    1. Receive text (in memory only)                      │ │
│  │    2. Run regex detection (~50ms)                        │ │
│  │    3. Generate masked text                               │ │
│  │    4. Log metadata (no raw text)                         │ │
│  │    5. Return response                                    │ │
│  │    6. Clear memory                                       │ │
│  │                                                          │ │
│  │  POST /api/detect     (detection-only mode)              │ │
│  │  GET  /api/logs       (admin)                            │ │
│  │  GET  /api/settings   (admin)                            │ │
│  │  POST /api/settings   (admin)                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                 │
│  ┌───────────────────────────▼──────────────────────────────┐ │
│  │              Detection Engine (@nymai/core)              │ │
│  │                                                          │ │
│  │  • SSN, CC, Email, Phone, DL, DOB                       │ │
│  │  • Passport, Bank Account, Routing, IP                   │ │
│  │  • Medicare, ITIN (12 types total)                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ Connection pooling
                                 │
┌────────────────────────────────▼───────────────────────────────┐
│                    SUPABASE                                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   PostgreSQL                             │ │
│  │                                                          │ │
│  │  metadata_logs                                           │ │
│  │  ├─ id (uuid)                                            │ │
│  │  ├─ hubspot_portal_id                                    │ │
│  │  ├─ object_id                                            │ │
│  │  ├─ data_types (text[])  ← ["SSN", "EMAIL"]             │ │
│  │  ├─ agent_id                                             │ │
│  │  ├─ action                                               │ │
│  │  └─ created_at                                           │ │
│  │                                                          │ │
│  │  portal_configs                                          │ │
│  │  ├─ hubspot_portal_id (pk)                               │ │
│  │  ├─ mode ("detection" | "redaction")                     │ │
│  │  ├─ detect_ssn (bool)                                    │ │
│  │  ├─ detect_cc (bool)                                     │ │
│  │  └─ ...                                                  │ │
│  │                                                          │ │
│  │  oauth_tokens (encrypted)                                │ │
│  │  ├─ hubspot_portal_id (pk)                               │ │
│  │  ├─ access_token_encrypted                               │ │
│  │  ├─ refresh_token_encrypted                              │ │
│  │  └─ expires_at                                           │ │
│  │                                                          │ │
│  │  ** NO RAW TEXT EVER STORED **                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                 ADMIN CONSOLE (Vercel)                         │
│                                                                │
│  React SPA                                                     │
│  ├─ Detection type toggles                                     │
│  ├─ Mode selector (Detection / Redaction)                      │
│  ├─ Log viewer (metadata only)                                 │
│  └─ Detection summary dashboard                                │
│                                                                │
│  Auth: Supabase OAuth                                          │
│  API: Calls NymAI backend                                      │
└────────────────────────────────────────────────────────────────┘
```

### Detection-Only Mode Behavior (UI)

| Mode        | Sidebar Behavior                                                           | Admin Console                                       |
| ----------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| `detection` | Shows read-only summary (e.g., "1 SSN, 2 emails"), hides redaction buttons | Shows aggregate detection stats, allows mode switch |
| `redaction` | Shows full controls (detect summary, `[Redact All]`, undo)                 | Full functionality                                  |

## 2.3 Project Structure

The codebase is structured for **modular horizontal integration**. The detection/redaction engine lives in `@nymai/core` and can be consumed by any client.

```
nymai/
├── packages/
│   ├── core/                     # @nymai/core — shared detection engine
│   │   ├── src/
│   │   │   ├── detection/
│   │   │   │   ├── patterns.ts   # Regex patterns for each data type
│   │   │   │   ├── luhn.ts       # Credit card validation
│   │   │   │   └── index.ts      # detect() function
│   │   │   ├── redaction/
│   │   │   │   ├── mask.ts       # Masking strategies
│   │   │   │   └── index.ts      # redact() function
│   │   │   ├── types.ts          # DataType, Finding, RedactResult
│   │   │   └── index.ts          # Public API exports
│   │   ├── tests/
│   │   │   └── detection.test.ts # Golden set accuracy tests
│   │   └── package.json          # Zero dependencies
│   │
│   ├── api/                      # Hosted API server
│   │   ├── src/
│   │   │   ├── index.ts          # Hono app entry
│   │   │   ├── routes/
│   │   │   │   ├── redact.ts
│   │   │   │   ├── detect.ts
│   │   │   │   ├── logs.ts
│   │   │   │   └── settings.ts
│   │   │   ├── services/
│   │   │   │   └── hubspot.ts    # HubSpot API client
│   │   │   ├── db/
│   │   │   │   ├── client.ts     # Supabase client
│   │   │   │   └── schema.ts     # Type definitions
│   │   │   └── middleware/
│   │   │       ├── auth.ts       # HubSpot OAuth validation
│   │   │       └── logging.ts    # Request logging (no bodies)
│   │   ├── tests/
│   │   │   └── api.test.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── render.yaml
│   │
│   ├── clients/
│   │   └── hubspot/              # HubSpot app (MVP)
│   │       ├── src/
│   │       │   └── app/
│   │       │       ├── app-hsmeta.json     # App config (scopes, permissions)
│   │       │       └── cards/
│   │       │           ├── nymai-panel.tsx         # UI Extension React component
│   │       │           ├── nymai-panel-hsmeta.json # Card config (location, objectTypes)
│   │       │           └── package.json            # Card dependencies
│   │       ├── hsproject.json    # HubSpot project config
│   │       └── package.json
│   │
│   └── admin/                    # Admin console SPA
│       ├── src/
│       │   ├── App.tsx
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Settings.tsx
│       │   │   └── Logs.tsx
│       │   └── components/
│       ├── .env.example
│       ├── package.json
│       └── vercel.json
│
├── docs/
│   ├── agent-guide.md
│   ├── admin-guide.md
│   └── security-overview.md
│
├── package.json                  # Monorepo root (pnpm workspaces)
├── pnpm-workspace.yaml
└── README.md
```

### Core Package API

`@nymai/core` exports pure functions with no side effects:

```typescript
// packages/core/src/index.ts
import { detect } from './detection';
import { redact } from './redaction';
import type { DataType, Finding, DetectOptions, RedactResult } from './types';

export { detect, redact };
export type { DataType, Finding, DetectOptions, RedactResult };

// Usage (works in Node, browser, edge, anywhere):
// import { detect, redact } from '@nymai/core';
// const findings = detect(text, { types: ['SSN', 'CC'] });
// const result = redact(text, findings);
```

## 2.4 API Contracts

### POST /api/redact

**Request:**

```typescript
{
  workspace_id: string;
  ticket_id: string;
  comment_id: string;
  text: string; // Raw comment text
}
```

**Response:**

```typescript
{
  redacted_text: string; // "My SSN is ***-**-6789"
  findings: Array<{
    type:
      | 'SSN'
      | 'CC'
      | 'EMAIL'
      | 'PHONE'
      | 'DL'
      | 'DOB'
      | 'PASSPORT'
      | 'BANK_ACCOUNT'
      | 'ROUTING'
      | 'IP_ADDRESS'
      | 'MEDICARE'
      | 'ITIN';
    confidence: number; // 0-100
    start: number;
    end: number;
  }>;
  log_id: string;
}
```

**Behavior:**

1. Text loaded into memory (never written to disk)
2. Regex patterns run (~50ms)
3. Masked text generated
4. Metadata logged to Supabase (no raw text)
5. Response sent
6. Memory cleared

### POST /api/detect

Same as `/redact` but returns findings only (no redaction performed). Used for detection-only mode.

### GET /api/logs

**Query params:** `workspace_id`, `start_date`, `end_date`, `limit`, `offset`

**Response:**

```typescript
{
  logs: Array<{
    id: string;
    ticket_id: string;
    data_types: string[];
    agent_id: string;
    action: 'redacted' | 'detected';
    created_at: string;
  }>;
  total: number;
}
```

### GET/POST /api/settings

**GET Response / POST Body:**

```typescript
{
  workspace_id: string;
  mode: 'detection' | 'redaction';
  detect_ssn: boolean;
  detect_cc: boolean;
  detect_email: boolean;
  detect_phone: boolean;
  detect_dl: boolean;
  detect_dob: boolean;
  detect_passport: boolean;
  detect_bank_account: boolean;
  detect_routing: boolean;
  detect_ip_address: boolean;
  detect_medicare: boolean;
  detect_itin: boolean;
}
```

## 2.5 Detection Patterns

MVP uses a **regex-first strategy** to keep latency and cost predictable. We support **12 PII patterns** for comprehensive coverage.

```typescript
// packages/core/src/detection/patterns.ts

const PATTERNS = {
  SSN: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    mask: (match: string) => `***-**-${match.slice(-4)}`,
    confidence: 90,
  },
  CC: {
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    validate: luhnCheck, // Additional validation
    mask: (match: string) => `****-****-****-${match.slice(-4)}`,
    confidence: 95,
  },
  EMAIL: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    mask: (match: string) => {
      const [local, domain] = match.split('@');
      return `${local[0]}***@****.${domain.split('.').pop()}`;
    },
    confidence: 98,
  },
  PHONE: {
    regex: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    mask: (match: string) => `(***) ***-${match.slice(-4)}`,
    confidence: 85,
  },
  DL: {
    regex: /\b[A-Z]{1,2}\d{5,12}\b/g,
    mask: (match: string) => `******${match.slice(-4)}`,
    confidence: 70, // Lower confidence, generic pattern
  },
  DOB: {
    regex: /\b(?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12]\d|3[01])[-\/](?:19|20)\d{2}\b/g,
    mask: () => `**/**/****`,
    confidence: 75,
  },
  PASSPORT: {
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    mask: (match: string) => `******${match.slice(-3)}`,
    confidence: 65, // Generic pattern, may overlap with DL
  },
  BANK_ACCOUNT: {
    regex: /\b\d{8,17}\b/g, // Requires context validation
    mask: (match: string) => `****${match.slice(-4)}`,
    confidence: 60,
  },
  ROUTING: {
    regex: /\b\d{9}\b/g,
    validate: abaRoutingCheck, // ABA checksum validation
    mask: () => `*********`,
    confidence: 85,
  },
  IP_ADDRESS: {
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    mask: (match: string) => `***.***.***.${match.split('.').pop()}`,
    confidence: 95,
  },
  MEDICARE: {
    regex: /\b[1-9][A-Z][A-Z0-9]\d-?[A-Z][A-Z0-9]\d-?[A-Z]{2}\d{2}\b/gi,
    mask: () => `****-****-****`,
    confidence: 80,
  },
  ITIN: {
    regex: /\b9\d{2}-[7-9]\d-\d{4}\b/g,
    mask: (match: string) => `***-**-${match.slice(-4)}`,
    confidence: 90,
  },
};
```

### Pattern Coverage Summary

| Pattern      | Description                          | Confidence | Validation        |
| ------------ | ------------------------------------ | ---------- | ----------------- |
| SSN          | Social Security Number (XXX-XX-XXXX) | 90%        | Format only       |
| CC           | Credit Card (16 digits)              | 95%        | Luhn algorithm    |
| EMAIL        | Email addresses                      | 98%        | Format only       |
| PHONE        | US phone numbers                     | 85%        | Format only       |
| DL           | Driver's License (generic)           | 70%        | Format only       |
| DOB          | Date of Birth (MM/DD/YYYY)           | 75%        | Format only       |
| PASSPORT     | US Passport numbers                  | 65%        | Format only       |
| BANK_ACCOUNT | Bank account numbers                 | 60%        | Context-dependent |
| ROUTING      | ABA routing numbers                  | 85%        | ABA checksum      |
| IP_ADDRESS   | IPv4 addresses                       | 95%        | Format only       |
| MEDICARE     | Medicare Beneficiary ID              | 80%        | Format only       |
| ITIN         | Individual Taxpayer ID               | 90%        | Format only       |

## 2.5.2 Historical Scanning (All Comments)

MVP scans **all public comments** on a ticket, not just the latest. This enables comprehensive PII detection across the full ticket history.

### Architecture

```
Agent opens ticket
    ↓
Sidebar fetches ALL activities via HubSpot API
    ↓
Each activity text sent to /api/detect in parallel (batched)
    ↓
Findings aggregated and grouped by activity
    ↓
Agent sees findings with activity context
    ↓
Agent clicks [Redact All] → all affected activities updated
    ↓
Undo stores original text for each modified activity
```

### Key Behaviors

| Aspect          | Behavior                                                    |
| --------------- | ----------------------------------------------------------- |
| **Scope**       | All Notes, Emails, and Call transcripts on current record   |
| **Grouping**    | Findings displayed grouped by activity (newest first)       |
| **Redaction**   | Batch redacts all activities with findings                  |
| **Undo**        | Stores original text for each activity, reverts all on undo |
| **Performance** | <5s p95 for records with ≤20 activities                     |

### Data Flow

```typescript
// Step 1: Fetch all activities
const activities = await hubspot.getActivities(recordId);

// Step 2: Scan each activity
const allFindings = [];
for (const activity of activities) {
  const response = await apiClient.detect({
    text: activity.body,
    comment_id: String(activity.id),
  });
  const taggedFindings = response.findings.map(f => ({
    ...f,
    activityId: String(activity.id),
  }));
  allFindings.push(...taggedFindings);
}

// Step 3: Group for display
const findingsByActivity = groupBy(allFindings, 'activityId');

// Step 4: Redact all (on user action)
for (const [activityId, findings] of Object.entries(findingsByActivity)) {
  const originalText = getActivityText(activityId);
  const { redacted_text } = await apiClient.redact({ text: originalText, ... });
  await hubspot.updateActivity(activityId, redacted_text);
}
```

### Undo Semantics (Multi-Comment)

| State                | Behavior                                          |
| -------------------- | ------------------------------------------------- |
| **Before redaction** | `undoState` is empty                              |
| **After redaction**  | `undoState` stores `Map<commentId, originalText>` |
| **Undo clicked**     | All comments in map are reverted to original text |
| **After 10 seconds** | `undoState` cleared, redaction is permanent       |

### Performance Targets

| Metric                        | Target     | Notes                        |
| ----------------------------- | ---------- | ---------------------------- |
| Scan time (≤10 comments)      | <3s p95    | Parallel API calls           |
| Scan time (≤20 comments)      | <5s p95    | Batched processing           |
| Redaction time (all comments) | <5s p95    | Sequential for consistency   |
| Memory usage                  | <50MB peak | Comment text only, no images |

```

## 2.5.1 OCR Processing (Attachment Scanning)

MVP uses **client-side OCR** to maintain ephemeral guarantees while keeping costs near zero.

### Architecture

```

Agent clicks [Scan Attachment]
↓
Sidebar fetches attachment (image/PDF) into browser memory
↓
Tesseract.js OCR runs in browser (~5-12s)
↓
Extracted text sent to /api/detect (no image data)
↓
Findings displayed in sidebar
↓
Browser memory cleared (image + extracted text)

````

### Technology Choice: Tesseract.js

| Aspect          | Tesseract.js                  | Cloud APIs (GCP/AWS/Azure) |
| --------------- | ----------------------------- | -------------------------- |
| **Cost**        | FREE                          | $1-2 per 1000 images       |
| **Privacy**     | Client-side, zero data egress | Image sent to cloud        |
| **Accuracy**    | 75-85% (sufficient for MVP)   | 90-95%                     |
| **Latency**     | 5-12s per image               | 2-5s per image             |
| **Bundle size** | ~8MB (worker)                 | 0 (server-side)            |
| **Languages**   | 100+                          | 50+                        |

### Why Tesseract.js?

1. **Cost-effective:** At target of 5 attachments/week/customer × 60 customers = 300 attachments/week = 15,600/year. Cloud APIs would cost $15-30/year vs $0 for Tesseract.js.
2. **Privacy by design:** Image never leaves browser. GDPR compliant without complex data processing agreements.
3. **Sufficient accuracy:** 75-85% precision is acceptable for MVP when combined with agent review.
4. **No vendor lock-in:** Pure JavaScript, portable to any environment.

### Two-Stage Approach

**Stage 1 (MVP):** Client-side OCR in sidebar

- User-initiated: Agent clicks [Scan Attachment] button
- Runs in browser worker (non-blocking UI)
- Extracted text sent to existing `/api/detect` endpoint
- No image data sent to server (maintains ephemeral guarantees)

**Stage 2 (Future):** Server-side Tesseract.js worker

- Automated background scanning of all new attachments
- Requires separate worker process on DigitalOcean/Render
- Increases infrastructure complexity (consider when MRR >$20k)

### Supported Formats

| Format       | Status | Notes                                              |
| ------------ | ------ | -------------------------------------------------- |
| **PNG**      | ✅ MVP | Most common ticket attachment                      |
| **JPG/JPEG** | ✅ MVP | Standard photo format                              |
| **WEBP**     | ✅ MVP | Modern web format                                  |
| **PDF**      | ✅ MVP | Text-based PDFs (image-based PDFs: lower accuracy) |
| **DOCX**     | ❌ V1+ | Requires server-side conversion                    |
| **XLSX**     | ❌ V1+ | Requires server-side conversion                    |

### Performance Targets

| Metric                         | Target                       | Notes                    |
| ------------------------------ | ---------------------------- | ------------------------ |
| OCR scan time (single image)   | <15s p95                     | 5-12s typical            |
| OCR scan time (multi-page PDF) | <30s p95                     | Linear per page          |
| Memory usage                   | <200MB peak                  | Browser worker isolation |
| Browser compatibility          | Chrome 90+, Edge 90+, FF 88+ | Modern browsers only     |

### Error Handling

| Scenario               | Behavior                                                    |
| ---------------------- | ----------------------------------------------------------- |
| **OCR fails**          | Show "Scan failed - try downloading and re-uploading"       |
| **No text found**      | Show "No PII detected in attachment"                        |
| **Timeout (>15s)**     | Show "Scan timed out - attachment may be too complex"       |
| **Unsupported format** | Show "Format not supported. Supported: PNG, JPG, WEBP, PDF" |

## 2.6 Security Controls

| Control                    | Implementation                                          |
| -------------------------- | ------------------------------------------------------- |
| Encryption in transit      | TLS 1.3 (Render default)                                |
| Encryption at rest         | AES-256 (Supabase default)                              |
| Request body logging       | **Disabled** in Hono middleware                         |
| Error logging              | Sanitized (first 20 chars, PII stripped)                |
| Memory handling            | Explicit `text = null` after processing                 |
| Auth                       | HubSpot OAuth for API, Supabase Auth for admin          |
| Rate limiting              | Hono rate-limit middleware                              |
| **Attachment OCR privacy** | **Client-side processing - images never leave browser** |

### Ephemeral Processing Guarantee

**For Text Redaction:**

- All ticket text is:
  - Received over TLS.
  - Held in memory only for the duration of the request.
  - Cleared from memory immediately after a response is sent.
- NymAI **never**:
  - Writes raw ticket text to disk.
  - Logs request or response bodies.
  - Uses customer data for model training or analytics.
- Detection is done via a **fixed regex engine**, not adaptive ML models.

**For Attachment Scanning:**

- Images and PDFs are:
  - Fetched into browser memory only (HubSpot → Agent's browser).
  - Processed by Tesseract.js **in the browser** (no server upload).
  - Extracted text sent to `/api/detect` (text only, no image data).
  - Cleared from browser memory immediately after scan completes.
- NymAI **never**:
  - Uploads images to the server.
  - Stores images or extracted text on disk.
  - Logs attachment contents or metadata beyond file type/size.
  - Sends attachment data to external OCR services.

**Critical Distinction:** Client-side OCR means **zero** raw attachment data ever reaches NymAI servers. If NymAI is breached, attackers get detection metadata (file types, findings) but **no images or extracted PII**.

### Compliance Roadmap

| Milestone   | Goal                                                      |
| ----------- | --------------------------------------------------------- |
| Milestone 1 | Align with MVSP controls, be "SOC 2-ready"                |
| Milestone 2 | Pursue SOC 2 Type II, offer BAAs for healthcare customers |

## 2.7 Environment Variables

```bash
# packages/api/.env
DATABASE_URL=postgresql://...         # Supabase connection string
SUPABASE_SECRET_KEY=...               # For server-side operations
HUBSPOT_CLIENT_ID=...                 # OAuth app client ID
HUBSPOT_CLIENT_SECRET=...             # OAuth app secret (also for signature verification)
HUBSPOT_REDIRECT_URI=...              # OAuth callback URL (e.g., https://api.nymai.com/oauth/callback)
TOKEN_ENCRYPTION_KEY=...              # 32-byte hex key for encrypting stored OAuth tokens
NODE_ENV=production

# packages/admin/.env
VITE_API_URL=https://api.nymai.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
````

**Notes:**

- Secrets are **never committed** to the repo; use `.gitignore` for all `.env*` files.
- For local development, copy `.env.example` to `.env.local` and fill in the values.
- Generate `TOKEN_ENCRYPTION_KEY` with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 2.8 Deployment

### API Server (DigitalOcean App Platform - Primary)

```yaml
# .do/app.yaml
name: nymai-api
region: nyc
services:
  - name: api
    github:
      repo: your-username/NymAI
      branch: main
      deploy_on_push: true
    build_command: pnpm install && pnpm --filter @nymai/core build && pnpm --filter @nymai/api build
    run_command: pnpm --filter @nymai/api start
    http_port: 3000
    instance_size_slug: basic-xxs # $5/mo (covered by student credits)
    health_check:
      http_path: /health
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET
```

### API Server (Render - Alternative)

```yaml
# packages/api/render.yaml
services:
  - type: web
    name: nymai-api
    runtime: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    plan: starter # $7/mo, always-on
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
```

### Admin Console (Vercel)

```json
// packages/admin/vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### HubSpot App

The HubSpot app uses UI Extensions with **external backend pattern** (v2025.2 - serverless functions not supported).

```json
// packages/clients/hubspot/hsproject.json
{
  "name": "NymAI",
  "srcDir": "src",
  "platformVersion": "2025.2"
}
```

```json
// packages/clients/hubspot/src/app/app-hsmeta.json
{
  "uid": "nymai_app",
  "name": "NymAI",
  "description": "PII detection and redaction for HubSpot CRM",
  "permittedUrls": {
    "fetch": ["https://nymai-api-dnthb.ondigitalocean.app"]
  },
  "scopes": [
    "crm.objects.contacts.read",
    "crm.objects.contacts.write",
    "crm.objects.companies.read",
    "crm.objects.companies.write",
    "crm.objects.deals.read",
    "crm.objects.deals.write",
    "tickets"
  ]
}
```

**v2025.2 Architecture Pattern:**

```
UI Extension
    → hubspot.fetch(NYMAI_API, { Authorization: Bearer ${context.token} })
    → DigitalOcean API (receives token in header)
    → HubSpot CRM API (uses token for authentication)
```

**Key Architecture Notes:**

- **No serverless functions:** Removed in platform v2025.2.
- **External backend required:** UI Extension calls DigitalOcean API with `context.token`.
- **Token passthrough:** DigitalOcean API uses the token to authenticate with HubSpot CRM API.
- **permittedUrls.fetch:** Only NymAI backend needed (not api.hubapi.com directly).
- **HUBSPOT_PRIVATE_APP_TOKEN:** No longer needed - token comes from UI Extension.

````

**Required HubSpot Permissions:**

- **User:** Read/update CRM records (Contacts, Companies, Deals, Tickets)
- **Admin:** Install/configure app, manage portal settings

## 2.9 Testing Strategy

### Detection Accuracy

- Create `packages/core/tests/detection.test.ts` with a golden set of examples.
- **Target metrics:**
  - Precision: ≥90% for SSN and credit card, ≥85% for email/phone.
  - Recall: ≥70% across all types.

```typescript
type DetectionCase = {
  input: string;
  expected: Array<{ type: 'SSN' | 'CC' | 'EMAIL' | 'PHONE' | 'DL'; start: number; end: number }>;
};
````

### API & Integration Tests

- Mock HubSpot API in `packages/api/tests/api.test.ts`.
- Verify `/api/redact` correctly updates activities and logs metadata.
- Add basic E2E smoke test against a HubSpot sandbox.

### Manual E2E Before Each Release

- Agent workflow (detect, redact, undo)
- Admin workflow (toggle modes, view logs)
- Detection-only mode behavior

## 2.10 Local Development

```bash
# 1. Clone monorepo and install deps
git clone <repo-url>
cd nymai
pnpm install

# 2. Configure environment
cp packages/api/.env.example packages/api/.env.local
cp packages/admin/.env.example packages/admin/.env.local
# Fill in Supabase and HubSpot credentials

# 3. Run API and admin console
pnpm --filter @nymai/api dev
pnpm --filter admin dev

# 4. HubSpot app development
cd packages/clients/hubspot
pnpm dev
# Sideload app into HubSpot sandbox using HubSpot CLI

# 5. Run core tests
pnpm --filter @nymai/core test
```

## 2.11 Known Limitations

| Limitation              | Details                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Email copies            | NymAI redacts inside HubSpot only. Email copies in customer/agent inboxes are not modified.                                               |
| Other channels          | MVP focuses on HubSpot CRM activity timeline (Notes, Emails, Calls, Conversations).                                                       |
| Attachment OCR accuracy | Client-side OCR (Tesseract.js) achieves 75-85% accuracy vs 90%+ for cloud APIs. Trade-off for cost ($0 vs $1.50/1000 images) and privacy. |
| Attachment formats      | MVP supports images (PNG, JPG, WEBP) and PDFs. Complex formats (DOCX, XLSX) require server-side conversion.                               |

---

# Part 3: System Design Preferences

This section documents architectural choices and conventions for consistency across the codebase.

## 3.1 API: REST vs GraphQL

**Choice:** REST

| Aspect         | Decision                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Rationale      | Simpler for MVP (5 endpoints), better HTTP caching, HubSpot OAuth works seamlessly, lower bundle size |
| Implementation | RESTful resource naming, standard HTTP verbs, JSON bodies, standard status codes                      |
| Future         | GraphQL may be added for admin console if query complexity increases in V1+                           |

```
API Style:
- /api/redact, /api/logs, /api/settings
- GET for reads, POST for writes
- 200 (success), 400 (bad request), 401 (unauthorized), 500 (error)
```

## 3.2 Database: ORM vs Raw SQL

**Choice:** Supabase client (light ORM) + raw SQL for complex queries

| Aspect    | Decision                                                                                   |
| --------- | ------------------------------------------------------------------------------------------ |
| Rationale | Type-safe queries without full ORM overhead, RLS requires Supabase client, no N+1 problems |
| Avoid     | Heavy ORMs like TypeORM, Prisma (unnecessary complexity for simple schema)                 |

```typescript
// Prefer: Supabase client for CRUD
const { data, error } = await supabase
  .from('metadata_logs')
  .insert({ workspace_id, record_id, data_types })
  .select();

// Use raw SQL for complex queries or migrations
const { data } = await supabase.rpc('get_detection_stats', {
  workspace_id,
  start_date,
  end_date,
});
```

## 3.3 Logging Format

**Choice:** Structured JSON logging with sanitization

```typescript
{
  timestamp: "2026-01-03T14:22:15.123Z",  // ISO 8601
  level: "info" | "warn" | "error",
  service: "api" | "admin" | "hubspot-client",
  request_id: "req_abc123",               // Trace requests
  workspace_id: "ws_xyz",                 // Context
  endpoint: "/api/redact",
  duration_ms: 127,
  status_code: 200,
  error?: {
    message: "Validation failed",
    code: "INVALID_INPUT",
    sanitized_input: "My SSN is 123..."  // First 20 chars max, NO PII
  }
}
```

**Critical Rules:**

- **NEVER log request/response bodies** (contains PII)
- **NEVER log full error messages** if they contain user input
- Sanitize to first 20 characters max for debugging
- Use `request_id` for tracing across services

## 3.4 Naming Conventions

| Context                    | Convention           | Example                                                 |
| -------------------------- | -------------------- | ------------------------------------------------------- |
| Files & folders            | kebab-case           | `metadata-logs.ts`, `redact-endpoint.ts`                |
| React components           | PascalCase           | `Dashboard.tsx`, `LogViewer.tsx`                        |
| Test files                 | `*.test.ts`          | `detection.test.ts`                                     |
| Variables, functions       | camelCase            | `workspaceId`, `handleRedact()`                         |
| Types, interfaces, classes | PascalCase           | `Finding`, `RedactResult`, `ApiClient`                  |
| Constants                  | SCREAMING_SNAKE_CASE | `MAX_UNDO_WINDOW_MS`, `DEFAULT_CONFIDENCE`              |
| Database columns           | snake_case           | `workspace_id`, `created_at`                            |
| API fields                 | snake_case           | `workspace_id`, `record_id`                             |
| Migration files            | snake_case           | `20260101_create_metadata_logs.sql`                     |
| ID prefixes                | Descriptive          | `ws_` (workspace), `req_` (request), `log_` (log entry) |

## 3.5 Feature vs Layer Structure

**Choice:** Hybrid (Layer-based monorepo + feature-based within packages)

**Monorepo Structure (Layer-based):**

```
packages/
├── core/        # Layer: Business logic (platform-agnostic)
├── api/         # Layer: Backend service
├── clients/     # Layer: Frontend clients
│   └── hubspot/
└── admin/       # Layer: Admin interface
```

**Within Each Package (Feature-based where it makes sense):**

```
packages/api/src/
├── routes/           # Feature: API endpoints
│   ├── redact.ts
│   ├── detect.ts
│   └── logs.ts
├── services/         # Feature: External integrations
│   └── hubspot.ts
├── db/              # Layer: Data access
│   ├── client.ts
│   └── schema.ts
└── middleware/      # Layer: Cross-cutting concerns
    ├── auth.ts
    └── logging.ts
```

**Decision Tree:**

- **Layer-based:** When code is reusable across features (utils, types, middleware)
- **Feature-based:** When code is specific to a business domain (redaction, detection, logs)

---

# Part 4: Implementation Checklist

### Milestone 1: MVP (Month 1-2)

- [x] Set up HubSpot developer account
- [x] Create HubSpot app with OAuth 2.0
- [x] Scaffold UI Extension (React CRM card)
- [x] Configure direct API calls (no serverless - free tier)
- [ ] Wire up existing @nymai/core detection engine
- [ ] Implement Notes + Tickets scanning
- [ ] Add Email scanning (synced Gmail/Outlook)
- [ ] Add Call transcript scanning
- [ ] Add Conversations scanning (chat)
- [ ] Implement bulk operations
- [ ] Implement 10-second undo
- [ ] Add attachment OCR (Tesseract.js client-side)
- [ ] Deploy API to DigitalOcean
- [ ] Submit to HubSpot Marketplace for review

### Milestone 2: Growth (Month 3-12)

- [ ] Admin dashboard improvements
- [ ] GDPR erasure workflow
- [ ] Scheduled scans
- [ ] ML enhancement layer (Business tier)
- [ ] Advanced OCR (Business tier)
- [ ] Target: 60+ customers, $15K MRR
- [ ] Target: 100 customers, $15K MRR

### Milestone 3: Scale (Month 12-15)

- [ ] Custom detection patterns
- [ ] SSO / SAML support (Enterprise)
- [ ] API access for Enterprise
- [ ] SLA & Priority Support
- [ ] Target: 175+ customers, $41K MRR

---

# Part 5: Quick Reference

## Key Decisions

| Decision       | Choice                    | Why                        |
| -------------- | ------------------------- | -------------------------- |
| Architecture   | Modular monorepo          | Core engine reusable       |
| Core language  | TypeScript                | Type safety                |
| API framework  | Hono                      | Fast, lightweight          |
| API hosting    | DigitalOcean              | $5/mo, student credits     |
| Database       | Supabase                  | Auth + DB in one           |
| **Client app** | **HubSpot UI Extensions** | **Native CRM integration** |
| Admin hosting  | Vercel                    | Free, fast                 |
| Monorepo tool  | pnpm                      | Fast, disk-efficient       |

## Data Storage Policy

| Data We NEVER Store                            | Data We Log (metadata only)                  |
| ---------------------------------------------- | -------------------------------------------- |
| Raw record text                                | Record ID                                    |
| Detected PII values (SSNs, card numbers, etc.) | Data types detected (e.g., ["SSN", "EMAIL"]) |
| Request/response bodies                        | Confidence scores                            |
| Customer names or emails                       | Agent ID                                     |
| Attachments                                    | Timestamp                                    |
|                                                | Action taken                                 |

## Pricing Quick Reference

| Tier       | Price           | Seats     | Scans     |
| ---------- | --------------- | --------- | --------- |
| Individual | $29/mo          | 1         | 1K        |
| Pro        | $99 + $15/seat  | 5+        | 15K       |
| Business   | $249 + $12/seat | 15+       | 75K       |
| Enterprise | Custom          | Unlimited | Unlimited |

---

**End of Project Specification**
