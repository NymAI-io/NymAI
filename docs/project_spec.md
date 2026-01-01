# NymAI for Zendesk — Project Specification

**Version:** 1.3  
**Date:** December 31, 2025  
**Status:** MVP Development

> **For Claude/AI coding assistants:** This is the single source of truth. Read this entire document before implementing any feature.

---

## Table of Contents

- [Part 1: Product Requirements](#part-1-product-requirements)
  - [1.1 Problem & Solution](#11-problem--solution)
  - [1.2 MVP Scope](#12-mvp-scope)
  - [1.3 Success Criteria](#13-success-criteria)
  - [1.4 User Workflows](#14-user-workflows)
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

| | |
|---|---|
| **Problem** | Support agents paste sensitive data (SSNs, credit cards, IDs) into Zendesk tickets. When Zendesk or a BPO is breached, this data is exposed. Example: Discord breach (Oct 2025) leaked 2.1M government ID photos. |
| **Solution** | NymAI is a Zendesk app that detects and redacts sensitive data before it becomes a liability. Agents redact with one click; NymAI never stores raw content. |
| **Key Differentiator** | Ephemeral processing. Raw text exists in memory <500ms, then is discarded. If NymAI is breached, attackers get metadata (ticket IDs, timestamps), not customer PII. |

## 1.2 MVP Scope

### In Scope (Must Ship)

| Feature | Priority | Notes |
|---------|----------|-------|
| Detect sensitive data (SSN, CC, email, phone, DL) | ✅ MVP | Regex-based |
| Agent-initiated redaction (one-click + undo) | ✅ MVP | Core value |
| Detection-only mode | ✅ MVP | Passive scanning, dashboard stats |
| Ephemeral backend | ✅ MVP | No raw content storage |
| Admin console (toggles, mode, logs) | ✅ MVP | Basic version |
| Zendesk Marketplace listing | ✅ MVP | Distribution |

### Out of Scope (V1+)

❌ Automatic redaction • ❌ Attachment scanning • ❌ Vault storage • ❌ Other SaaS integrations • ❌ AI/ML classification

### Explicit Non-Goals for MVP

- MVP **does NOT** block ticket submission via the `ticket.save` hook.
- MVP **does NOT** intercept or scan drafts in real time while the agent is typing.
- MVP **does NOT** call any external LLMs or generative AI models for detection.
- All detection is **regex / pattern-based**, running on the NymAI backend.
- Redaction is **agent-initiated after a comment is posted**, not automatically enforced at send time.

## 1.3 Success Criteria

| Metric | Target |
|--------|--------|
| Redaction completes | <5s p95 |
| Detection precision (SSN/CC) | ≥90% |
| Detection precision (email/phone) | ≥85% |
| Detection recall (all types) | ≥70% |
| Customers installed | ≥3 |
| Weekly usage | ≥10 redactions/week/customer |

**Go/No-Go for V1:** ≥3 active customers, precision ≥90% for SSN/CC, automation confirmed as top need.

## 1.4 User Workflows

### Agent Flow

```
1. Agent opens ticket
2. Sidebar: "⚠️ Sensitive Data: SSN (94%), Phone (87%)"
3. Agent clicks [Redact All] → masked → "2 items redacted [Undo - 10s]"
4. Done.
```

### Admin Flow

```
1. Install from Marketplace
2. Configure: toggle detection types, set mode
3. View logs: "Ticket 123: SSN redacted by Agent Bob"
```

### Undo Semantics

- After successful redaction, sidebar shows: `"X items redacted [Undo - 10s]"`.
- **Undo window:** 10 seconds from completion.
  - Pre-redaction text stored in memory only.
  - Reverted via Zendesk API if Undo is clicked.
- After 10 seconds: original text discarded, redaction is irreversible.

---

# Part 2: Engineering Design

## 2.1 Tech Stack

**Total MVP Cost: ~$30/month** (after free tiers, with student credits: ~$25/month)

| Component | Technology | Cost | Rationale |
|-----------|------------|------|-----------|
| **Backend API** | Node.js + Hono | - | Ultrafast, TypeScript, same language as Zendesk app |
| **Backend Hosting** | DigitalOcean App Platform | $5/mo | Always-on, student credits available, simple deploys |
| **Backend Hosting (Alt)** | Render (Starter) | $7/mo | Alternative option, no cold starts |
| **Database** | Supabase (Pro) | $25/mo | PostgreSQL + Auth + Dashboard included |
| **Admin Console** | React + Vite | - | Simple SPA |
| **Admin Hosting** | Vercel or Cloudflare Pages | Free | Static hosting |
| **Zendesk App** | ZAF SDK + React | Free | Zendesk-hosted iframe |

### Why This Stack?

**Product Manager Perspective:**
- Predictable costs: $30/mo covers MVP through first 10 customers.
- Student-friendly: DigitalOcean offers $200 in student credits.
- Fast time-to-market: 8-10 weeks to ship.
- Low operational burden: No servers to manage.

**Senior Engineer Perspective:**
- Unified language: TypeScript everywhere (Zendesk app, backend, admin console).
- No cold starts: DigitalOcean/Render always-on instances mean consistent <500ms response times.
- Hono over Express: 12KB, ultrafast router, built-in TypeScript.
- Supabase over raw Postgres: Row Level Security, built-in auth, admin dashboard.

### Alternative Stacks Considered

| Stack | Monthly Cost | Pros | Cons | Verdict |
|-------|--------------|------|------|---------|
| **DigitalOcean + Supabase** | $30 | Student credits, simple | Slightly less polished than Render | **Current choice** |
| **Render + Supabase** | $32 | Great DX, auto-deploy | $2/mo more than DO | Alternative option |
| **Cloudflare Workers + Neon** | $0-5 | Ultra cheap, edge-distributed | More complex setup, Neon cold starts | Good for V1 optimization |
| **FastAPI + Supabase** | $32 | Python for future ML | Two languages, slower regex than Node | Consider if ML becomes priority |
| **Vercel + PlanetScale** | $20-45 | Great DX | Cold starts, cost unpredictable at scale | Avoid for always-on API |

### Cost Breakdown

**Month 1-3 (MVP/Beta) - Primary (DigitalOcean):**
```
DigitalOcean:       $5/mo  (basic-xxs, always-on) - covered by student credits
Supabase Pro:      $25/mo  (8GB database, 100K MAUs)
Vercel:             $0/mo  (free tier, <100GB bandwidth)
Cloudflare:         $0/mo  (free tier for DNS/CDN)
Zendesk:            $0/mo  (app hosting included)
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
- >1000 redactions/day → Consider DigitalOcean Basic ($12/mo) or Render Standard ($85/mo)
- >100K MAUs → Supabase usage-based kicks in
- Global latency matters → Add Cloudflare Workers edge caching

## 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ZENDESK                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Agent Interface                                           │ │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐│ │
│  │  │ Ticket View     │  │ NymAI Sidebar (iframe)         ││ │
│  │  │                 │  │                                 ││ │
│  │  │ "My SSN is      │  │ ⚠️ Sensitive Data Detected     ││ │
│  │  │  123-45-6789"   │  │   • SSN (94%)                  ││ │
│  │  │                 │  │   • Phone (87%)                ││ │
│  │  │                 │  │                                 ││ │
│  │  │                 │  │ [Redact All] [Review]          ││ │
│  │  └─────────────────┘  └──────────────┬──────────────────┘│ │
│  └───────────────────────────────────────┼───────────────────┘ │
│                                          │                     │
│            ┌─────────────────────────────┼───────────┐        │
│            │       Zendesk REST API      │           │        │
│            │         (OAuth 2.0)         │           │        │
│            └─────────────────────────────┼───────────┘        │
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
│  │              Detection Engine                            │ │
│  │                                                          │ │
│  │  • SSN:    /\d{3}-\d{2}-\d{4}/                          │ │
│  │  • CC:     Luhn validation + 16-digit patterns          │ │
│  │  • Email:  RFC 5322 simplified                          │ │
│  │  • Phone:  US formats                                    │ │
│  │  • DL:     Generic 1-2 letters + 5-12 digits            │ │
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
│  │  ├─ workspace_id                                         │ │
│  │  ├─ ticket_id                                            │ │
│  │  ├─ data_types (text[])  ← ["SSN", "EMAIL"]             │ │
│  │  ├─ agent_id                                             │ │
│  │  ├─ action                                               │ │
│  │  └─ created_at                                           │ │
│  │                                                          │ │
│  │  workspace_configs                                       │ │
│  │  ├─ workspace_id (pk)                                    │ │
│  │  ├─ mode ("detection" | "redaction")                     │ │
│  │  ├─ detect_ssn (bool)                                    │ │
│  │  ├─ detect_cc (bool)                                     │ │
│  │  └─ ...                                                  │ │
│  │                                                          │ │
│  │  ** NO RAW TEXT EVER STORED **                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Supabase Auth                               │ │
│  │              (OAuth for admin console)                   │ │
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

| Mode | Sidebar Behavior | Admin Console |
|------|------------------|---------------|
| `detection` | Shows read-only summary (e.g., "1 SSN, 2 emails"), hides redaction buttons | Shows aggregate detection stats, allows mode switch |
| `redaction` | Shows full controls (detect summary, `[Redact All]`, undo) | Full functionality |

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
│   │   │   │   └── zendesk.ts    # Zendesk API client
│   │   │   ├── db/
│   │   │   │   ├── client.ts     # Supabase client
│   │   │   │   └── schema.ts     # Type definitions
│   │   │   └── middleware/
│   │   │       ├── auth.ts       # Zendesk OAuth validation
│   │   │       └── logging.ts    # Request logging (no bodies)
│   │   ├── tests/
│   │   │   └── api.test.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── render.yaml
│   │
│   ├── clients/
│   │   └── zendesk/              # Zendesk sidebar app (MVP)
│   │       ├── src/
│   │       │   ├── App.tsx
│   │       │   ├── api.ts
│   │       │   └── types.ts
│   │       ├── assets/
│   │       │   └── iframe.html
│   │       ├── manifest.json
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
  text: string;  // Raw comment text
}
```

**Response:**
```typescript
{
  redacted_text: string;  // "My SSN is ***-**-6789"
  findings: Array<{
    type: "SSN" | "CC" | "EMAIL" | "PHONE" | "DL";
    confidence: number;  // 0-100
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
    action: "redacted" | "detected";
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
  mode: "detection" | "redaction";
  detect_ssn: boolean;
  detect_cc: boolean;
  detect_email: boolean;
  detect_phone: boolean;
  detect_dl: boolean;
}
```

## 2.5 Detection Patterns

MVP uses a **regex-first strategy** to keep latency and cost predictable.

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
    validate: luhnCheck,  // Additional validation
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
    confidence: 70,  // Lower confidence, generic pattern
  },
};
```

## 2.6 Security Controls

| Control | Implementation |
|---------|----------------|
| Encryption in transit | TLS 1.3 (Render default) |
| Encryption at rest | AES-256 (Supabase default) |
| Request body logging | **Disabled** in Hono middleware |
| Error logging | Sanitized (first 20 chars, PII stripped) |
| Memory handling | Explicit `text = null` after processing |
| Auth | Zendesk OAuth for API, Supabase Auth for admin |
| Rate limiting | Hono rate-limit middleware |

### Ephemeral Processing Guarantee

- All ticket text is:
  - Received over TLS.
  - Held in memory only for the duration of the request.
  - Cleared from memory immediately after a response is sent.
- NymAI **never**:
  - Writes raw ticket text to disk.
  - Logs request or response bodies.
  - Uses customer data for model training or analytics.
- Detection is done via a **fixed regex engine**, not adaptive ML models.

### Compliance Roadmap

| Phase | Goal |
|-------|------|
| MVP | Align with MVSP controls, be "SOC 2-ready" |
| V1+ | Pursue SOC 2 Type II, offer BAAs for healthcare customers |

## 2.7 Environment Variables

```bash
# packages/api/.env
DATABASE_URL=postgresql://...         # Supabase connection string
SUPABASE_SERVICE_KEY=...              # For server-side operations
ZENDESK_CLIENT_ID=...                 # OAuth client ID
ZENDESK_CLIENT_SECRET=...             # OAuth client secret
NODE_ENV=production

# packages/admin/.env
VITE_API_URL=https://api.nymai.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**Notes:**
- Secrets are **never committed** to the repo; use `.gitignore` for all `.env*` files.
- For local development, copy `.env.example` to `.env.local` and fill in the values.

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
    instance_size_slug: basic-xxs  # $5/mo (covered by student credits)
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
    plan: starter  # $7/mo, always-on
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

### Zendesk Client

```json
// packages/clients/zendesk/manifest.json
{
  "name": "NymAI",
  "author": {
    "name": "NymAI LLC",
    "email": "support@nymai.com"
  },
  "version": "1.0.0",
  "frameworkVersion": "2.0",
  "location": {
    "support": {
      "ticket_sidebar": {
        "url": "assets/iframe.html",
        "flexible": true
      }
    }
  },
  "parameters": [
    {
      "name": "api_url",
      "type": "text",
      "required": true,
      "default": "https://api.nymai.com"
    }
  ]
}
```

**Required Zendesk Permissions:**
- **Agent:** Read/update ticket comments and metadata.
- **Admin:** Install/configure app, manage workspace settings.

## 2.9 Testing Strategy

### Detection Accuracy

- Create `packages/core/tests/detection.test.ts` with a golden set of examples.
- **Target metrics:**
  - Precision: ≥90% for SSN and credit card, ≥85% for email/phone.
  - Recall: ≥70% across all types.

```typescript
type DetectionCase = {
  input: string;
  expected: Array<{ type: "SSN" | "CC" | "EMAIL" | "PHONE" | "DL"; start: number; end: number }>;
};
```

### API & Integration Tests

- Mock Zendesk API in `packages/api/tests/api.test.ts`.
- Verify `/api/redact` correctly updates comments and logs metadata.
- Add basic E2E smoke test against a Zendesk sandbox.

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
# Fill in Supabase and Zendesk credentials

# 3. Run API and admin console
pnpm --filter @nymai/api dev
pnpm --filter admin dev

# 4. Zendesk app development
cd packages/clients/zendesk
pnpm dev
# Sideload app into Zendesk sandbox using ZAF CLI

# 5. Run core tests
pnpm --filter @nymai/core test
```

## 2.11 Known Limitations

| Limitation | Details |
|------------|---------|
| Email copies | NymAI redacts inside Zendesk only. Email copies in customer/agent inboxes are not modified. |
| Other channels | MVP focuses on Zendesk Support ticket comments only (Chat, Messaging, Social are out of scope). |
| Attachments | MVP does not process attachments. Deferred to V1+. |

---

# Part 3: System Design Preferences

This section documents architectural choices and conventions for consistency across the codebase.

## 3.1 API: REST vs GraphQL

**Choice:** REST

| Aspect | Decision |
|--------|----------|
| Rationale | Simpler for MVP (5 endpoints), better HTTP caching, Zendesk OAuth works seamlessly, lower bundle size |
| Implementation | RESTful resource naming, standard HTTP verbs, JSON bodies, standard status codes |
| Future | GraphQL may be added for admin console if query complexity increases in V1+ |

```
API Style:
- /api/redact, /api/logs, /api/settings
- GET for reads, POST for writes
- 200 (success), 400 (bad request), 401 (unauthorized), 500 (error)
```

## 3.2 Database: ORM vs Raw SQL

**Choice:** Supabase client (light ORM) + raw SQL for complex queries

| Aspect | Decision |
|--------|----------|
| Rationale | Type-safe queries without full ORM overhead, RLS requires Supabase client, no N+1 problems |
| Avoid | Heavy ORMs like TypeORM, Prisma (unnecessary complexity for simple schema) |

```typescript
// Prefer: Supabase client for CRUD
const { data, error } = await supabase
  .from('metadata_logs')
  .insert({ workspace_id, ticket_id, data_types })
  .select();

// Use raw SQL for complex queries or migrations
const { data } = await supabase.rpc('get_detection_stats', {
  workspace_id,
  start_date,
  end_date
});
```

## 3.3 Logging Format

**Choice:** Structured JSON logging with sanitization

```typescript
{
  timestamp: "2025-12-31T14:22:15.123Z",  // ISO 8601
  level: "info" | "warn" | "error",
  service: "api" | "admin" | "zendesk-client",
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

| Context | Convention | Example |
|---------|------------|---------|
| Files & folders | kebab-case | `metadata-logs.ts`, `redact-endpoint.ts` |
| React components | PascalCase | `Dashboard.tsx`, `LogViewer.tsx` |
| Test files | `*.test.ts` | `detection.test.ts` |
| Variables, functions | camelCase | `workspaceId`, `handleRedact()` |
| Types, interfaces, classes | PascalCase | `Finding`, `RedactResult`, `ApiClient` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_UNDO_WINDOW_MS`, `DEFAULT_CONFIDENCE` |
| Database columns | snake_case | `workspace_id`, `created_at` |
| API fields | snake_case | `workspace_id`, `ticket_id` |
| Migration files | snake_case | `20250101_create_metadata_logs.sql` |
| ID prefixes | Descriptive | `ws_` (workspace), `req_` (request), `log_` (log entry) |

## 3.5 Feature vs Layer Structure

**Choice:** Hybrid (Layer-based monorepo + feature-based within packages)

**Monorepo Structure (Layer-based):**
```
packages/
├── core/        # Layer: Business logic (platform-agnostic)
├── api/         # Layer: Backend service
├── clients/     # Layer: Frontend clients
│   └── zendesk/
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
│   └── zendesk.ts
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

## Week 1-2: Foundation
- [x] Set up monorepo (pnpm workspaces)
- [x] Create Supabase project, define schema
- [x] Scaffold `@nymai/core` with detection patterns
- [x] Scaffold `@nymai/api` with Hono, health check
- [ ] Deploy API to DigitalOcean App Platform (or Render as alternative)

## Week 3-4: Core Detection
- [x] Implement detection engine in `@nymai/core`
- [x] Implement redaction/masking logic in `@nymai/core`
- [x] Build `/redact` and `/detect` endpoints in `@nymai/api`
- [x] Add metadata logging (no raw text)
- [x] Write unit tests for detection accuracy (golden set)

## Week 5-6: Zendesk Client
- [x] Scaffold ZAF app in `clients/zendesk`
- [x] Build sidebar UI (detection summary, buttons)
- [x] Implement one-click redact flow
- [x] Add 10-second undo capability
- [ ] Test with Zendesk sandbox account

## Week 7-8: Admin Console
- [x] Build React SPA with Vite
- [x] Implement settings page (toggles, mode)
- [x] Implement logs viewer
- [x] Add detection summary dashboard
- [ ] Deploy to Vercel

## Week 9-10: Polish & Launch
- [ ] Write agent guide, admin guide
- [ ] Write security overview (CISO-ready)
- [ ] End-to-end testing (manual checklist)
- [ ] Submit to Zendesk Marketplace
- [ ] Beta with 1-2 friendly customers

---

# Part 5: Quick Reference

## Key Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Architecture | Modular monorepo | Core engine reusable across clients |
| Core language | TypeScript | Type safety, works in any JS runtime |
| API framework | Hono | Fast, lightweight, portable |
| API hosting | DigitalOcean App Platform | $5/mo, student credits available |
| API hosting (alt) | Render | $7/mo alternative, great DX |
| Database | Supabase PostgreSQL | Auth + DB + dashboard in one |
| Admin hosting | Vercel | Free, fast, great DX |
| Monorepo tool | pnpm workspaces | Fast, disk-efficient |

## Data Storage Policy

| Data We NEVER Store | Data We DO Store (90 days) |
|---------------------|---------------------------|
| Raw ticket text | Ticket ID |
| Detected PII values (SSNs, card numbers, etc.) | Data types detected (e.g., ["SSN", "EMAIL"]) |
| Request/response bodies | Confidence scores |
| Customer names or emails | Agent ID |
| Attachments | Timestamp |
| | Action taken |

---

**End of Project Specification**
