# NymAI Architecture

> Last updated: 2026-01-01

## Overview

NymAI is a Zendesk PII (Personally Identifiable Information) detection and redaction tool that processes data ephemerally. The system never stores raw PII data - only metadata about detections.

## System Architecture

```
                           +------------------+
                           |   Zendesk UI     |
                           |  (Agent View)    |
                           +--------+---------+
                                    |
                                    v
+------------------+       +------------------+       +------------------+
|   Admin Console  |       |  Zendesk Sidebar |       |  Supabase Auth   |
|   (React SPA)    |       |   (ZAF SDK)      |       |  (Google OAuth)  |
+--------+---------+       +--------+---------+       +--------+---------+
         |                          |                          |
         |                          |                          |
         +------------+-------------+------------+-------------+
                      |                          |
                      v                          v
              +------------------+       +------------------+
              |   NymAI API      |       |    Supabase      |
              |   (Hono)         |<----->|   PostgreSQL     |
              +--------+---------+       +------------------+
                       |
                       v
              +------------------+
              |   @nymai/core    |
              | (Detection Eng.) |
              +------------------+
```

## Package Structure

```
NymAI/
├── packages/
│   ├── core/           # @nymai/core - Zero-dependency detection engine
│   ├── api/            # @nymai/api - Hono REST API server
│   ├── admin/          # Admin console React SPA
│   └── clients/
│       └── zendesk/    # ZAF SDK sidebar application
├── docs/               # Documentation
├── pnpm-workspace.yaml # Monorepo configuration
└── tsconfig.base.json  # Shared TypeScript config
```

## Package Details

### @nymai/core (packages/core)

**Purpose:** Regex-based PII detection and masking engine.

**Key Components:**
- `src/detection/patterns.ts` - Regex patterns for each data type
- `src/detection/luhn.ts` - Credit card Luhn validation
- `src/redaction/mask.ts` - Data masking strategies

**Supported Data Types:**
| Type | Confidence | Validation |
|------|------------|------------|
| SSN | 90% | Format only |
| CC | 95% | Luhn algorithm |
| EMAIL | 98% | Format only |
| PHONE | 85% | Format only |
| DL | 70% | Format only |

**Exports:**
```typescript
detect(text: string, options?: DetectOptions): Finding[]
redact(text: string, options?: RedactOptions): RedactResult
```

### @nymai/api (packages/api)

**Purpose:** REST API for detection and redaction operations.

**Framework:** Hono (lightweight, platform-agnostic)

**Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | None | Health check |
| POST | /api/detect | Workspace | Detect PII (no modification) |
| POST | /api/redact | Workspace | Detect and mask PII |
| GET | /api/logs | Admin | Query metadata logs |
| GET | /api/settings | Admin | Get workspace config |
| PUT | /api/settings | Admin | Update workspace config |

**Middleware:**
- `auth.ts` - Workspace ID validation, admin elevation
- `logging.ts` - Request logging (sanitized, no body logging)

### Admin Console (packages/admin)

**Purpose:** Web dashboard for configuration and audit logs.

**Framework:** React + Vite + Tailwind CSS + Shadcn/ui

**Pages:**
- `/` - Dashboard with detection statistics
- `/settings` - PII type configuration, mode selection
- `/logs` - Audit log viewer with filtering

**Authentication:** Supabase Auth with Google OAuth

### Zendesk Sidebar (packages/clients/zendesk)

**Purpose:** Real-time PII detection within Zendesk ticket view.

**Framework:** React + ZAF SDK + Tailwind CSS + Shadcn/ui

**Features:**
- Auto-scan on ticket load
- Detection summary display
- One-click redaction (when enabled)
- 10-second undo window
- Detection-only mode support

## Data Flow

### Detection Flow
```
Agent opens ticket
    → Sidebar loads (ZAF SDK)
    → Fetches workspace settings
    → POST /api/detect with comment text
    → Core detection engine processes
    → Returns findings (type, position, confidence)
    → Displays summary in sidebar
    → Text cleared from memory
```

### Redaction Flow
```
Agent clicks [Redact All]
    → POST /api/redact with comment text
    → Core engine detects + masks
    → Returns masked text
    → Log metadata to Supabase (NO raw text)
    → Update Zendesk comment via ZAF
    → Show undo banner (10s)
    → Original text in memory only
    → After 10s, clear undo state
```

## Database Schema

**Tables (Supabase PostgreSQL):**

### workspace_configs
```sql
workspace_id  VARCHAR PRIMARY KEY
mode          VARCHAR -- 'detection' | 'redaction'
detect_ssn    BOOLEAN DEFAULT TRUE
detect_cc     BOOLEAN DEFAULT TRUE
detect_email  BOOLEAN DEFAULT TRUE
detect_phone  BOOLEAN DEFAULT TRUE
detect_dl     BOOLEAN DEFAULT TRUE
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

### metadata_logs
```sql
id            UUID PRIMARY KEY
workspace_id  VARCHAR NOT NULL
ticket_id     VARCHAR NOT NULL
comment_id    VARCHAR
data_types    TEXT[] -- Array of detected types
agent_id      VARCHAR NOT NULL
action        VARCHAR -- 'detected' | 'redacted'
created_at    TIMESTAMPTZ
```

**Security:** Row-Level Security (RLS) enabled on all tables.

## Security Architecture

### Ephemeral Processing
- Text held in memory only during request processing (<500ms)
- Explicit memory clearing after processing (`text = null`)
- No raw PII ever stored in database
- Only metadata (types, counts, positions) logged

### Authentication
- Zendesk sidebar: Workspace ID + API key validation
- Admin console: Supabase Auth with Google OAuth
- API: Header-based workspace identification

### Data Protection
- HTTPS only in production
- No body logging in middleware
- Error messages sanitized (max 20 chars)
- Service key used for server-side Supabase operations

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Detection | TypeScript (zero deps) | PII pattern matching |
| API | Hono + Node.js | REST endpoints |
| Database | Supabase PostgreSQL | Metadata storage |
| Auth | Supabase Auth | Admin authentication |
| Admin UI | React + Vite + Tailwind | Configuration dashboard |
| Zendesk UI | React + ZAF SDK | Agent sidebar |
| Styling | Shadcn/ui + Tailwind CSS | UI components |
| Testing | Vitest | Unit and integration tests |
| Monorepo | pnpm workspaces | Package management |

## Deployment Architecture

### Production URLs

| Service | URL | Platform |
|---------|-----|----------|
| API Server | https://nymai-api-dnthb.ondigitalocean.app | DigitalOcean |
| Admin Console | https://nymai-admin.vercel.app | Vercel |
| Database | Supabase PostgreSQL | Supabase (free tier) |
| Auth | Google OAuth via Supabase | Supabase Auth |

### API Server (DigitalOcean App Platform - Primary)
- **URL:** https://nymai-api-dnthb.ondigitalocean.app
- Runtime: Node.js
- Plan: Basic ($5/mo, covered by student credits)
- Health check: `/health`
- Auto-deploy from main branch
- Config: `.do/app.yaml`

### API Server (Render - Alternative)
- Runtime: Node.js
- Plan: Starter ($7/mo, always-on)
- Health check: `/health`
- Config: `packages/api/render.yaml`
- Note: Available as fallback if DigitalOcean unavailable

### Admin Console (Vercel)
- **URL:** https://nymai-admin.vercel.app
- Framework: Vite
- Free tier
- Auto-deploy from main branch
- Auth: Supabase with Google OAuth

### Database (Supabase)
- PostgreSQL with RLS
- Free tier (sufficient for MVP)
- Realtime disabled (not needed)

### Zendesk App
- Hosted on Zendesk CDN
- ZAF iframe architecture
- Signed installation

## References

- [Project Spec](../project_spec.md) - Complete technical specification
- [Security Overview](../vision/security_overview.md) - Security architecture details
