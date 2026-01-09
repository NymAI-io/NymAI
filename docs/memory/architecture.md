# NymAI Architecture

> Last updated: 2026-01-09 (v5.4.0 - OAuth + Signature Verification for Marketplace)

## Overview

NymAI is a HubSpot CRM PII (Personally Identifiable Information) detection and redaction tool that processes data ephemerally. The system never stores raw PII data - only metadata about detections.

## System Architecture

```
                           +------------------+
                           |   HubSpot CRM    |
                           |  (Record View)   |
                           +--------+---------+
                                    |
                                    v
+------------------+       +------------------+       +------------------+
|   Admin Console  |       |  NymAI Panel     |       |  Supabase Auth   |
|   (React SPA)    |       | (UI Extension)   |       |  (Google OAuth)  |
+--------+---------+       +--------+---------+       +--------+---------+
         |                          |                          |
         |                          | hubspot.fetch()          |
         |                          | + X-HubSpot-Signature-v3 |
         |                          | + portalId query param   |
         |                          |                          |
         |                   +------|------+                   |
         |                   |      |      |                   |
         |                   |      v      |                   |
         |                   |  Tesseract.js                   |
         |                   |  (Client OCR)                   |
         |                   |      |      |                   |
         |                   +------|------+                   |
         |                          |                          |
         +------------+-------------+------------+-------------+
                      |                          |
                      v                          v
              +------------------+       +------------------+
              |   NymAI API      |       |    Supabase      |
              |   (Hono)         |<----->|   PostgreSQL     |
              +--------+---------+       +------------------+
                       |
          +------------+------------+
          |            |            |
          v            v            v
+------------------+  +------------------+  +------------------+
|   @nymai/core    |  |   HubSpot API    |  |   oauth_tokens   |
| (Detection Eng.) |  | (stored OAuth)   |  | (per portal)     |
+------------------+  +------------------+  +------------------+
```

**Key:**

- Client-side OCR (Tesseract.js) runs in browser, images never reach NymAI servers.
- v2025.2: `hubspot.fetch()` does NOT support custom headers. Auth via signature verification.
- Backend verifies `X-HubSpot-Signature-v3`, looks up OAuth tokens by `portalId`.

## Package Structure

```
NymAI/
├── packages/
│   ├── core/           # @nymai/core - Zero-dependency detection engine
│   ├── api/            # @nymai/api - Hono REST API server
│   ├── admin/          # Admin console React SPA
│   └── clients/
│       └── hubspot/    # HubSpot UI Extension + Serverless
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
- `src/detection/aba.ts` - ABA routing number validation
- `src/redaction/mask.ts` - Data masking strategies

**Supported Data Types (12 patterns):**
| Type | Confidence | Validation |
|------|------------|------------|
| SSN | 90% | Format only |
| CC | 95% | Luhn algorithm |
| EMAIL | 98% | Format only |
| PHONE | 85% | Format only |
| DL | 70% | Format only |
| DOB | 80% | Format only |
| PASSPORT | 85% | Format only |
| BANK_ACCOUNT | 75% | Format only |
| ROUTING | 90% | ABA Checksum validation |
| IP_ADDRESS | 95% | Format only |
| MEDICARE | 85% | Format only |
| ITIN | 90% | Format only |
| IMAGE (PNG/JPG/WEBP) | 75-85% | Client-side OCR (Tesseract.js) |
| PDF (text-based) | 70-80% | Client-side OCR (Tesseract.js) |

**Historical Scanning:**

- Scans Notes, Emails, Calls, and Conversations on a record (capped at 20 most recent)
- Parallel scanning with concurrency control (max 5 requests)
- Findings grouped by activity ID for targeted redaction
- Multi-activity undo support with comment-level tracking

**New Components (Attachment Scanning):**

- `AttachmentCard.tsx` - Individual attachment display with OCR findings and redaction controls
- `AttachmentPreview.tsx` - Canvas-based image preview with PII bounding box visualization
- `AttachmentList.tsx` - List of attachments with aggregate statistics and progress
- `OCRFindings.tsx` - Grouped display of OCR findings by PII type

**New Hooks (Attachment Scanning):**

- `useOCR.ts` - OCR scanning orchestration with progress tracking
- `useAttachmentRedaction.ts` - Redaction workflow with undo support

**New Services (Attachment Scanning):**

- `services/ocr.service.ts` - Tesseract.js integration for image/PDF text extraction
- `services/downloader.ts` - HubSpot attachment download utilities
- `services/uploader.ts` - Redacted image upload to HubSpot

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
| GET | /oauth/install | None | Redirect to HubSpot OAuth |
| GET | /oauth/callback | None | OAuth token exchange |
| POST | /oauth/uninstall | None | Remove stored tokens |
| POST | /hubspot/activities | Signature | Fetch activities for portal |
| PATCH | /hubspot/activities/:id | Signature | Update activity text |

**Middleware:**

- `auth.ts` - Workspace ID validation, admin elevation, HubSpot signature verification
- `logging.ts` - Request logging (sanitized, no body logging)

### Admin Console (packages/admin)

**Purpose:** Web dashboard for configuration and audit logs.

**Framework:** React + Vite + Tailwind CSS + Shadcn/ui

**Pages:**

- `/` - Dashboard with detection statistics
- `/settings` - PII type configuration, mode selection
- `/logs` - Audit log viewer with filtering

**Authentication:** Supabase Auth with Google OAuth

### HubSpot Panel (packages/clients/hubspot)

**Purpose:** Real-time PII detection within HubSpot record view.

**Framework:** React + HubSpot UI Extensions + HubSpot native components

**Platform Version:** 2025.2 (no serverless functions)

**Architecture:** Modular design with separation of concerns:

- `api/` - Dedicated clients for HubSpot CRM (via backend) and NymAI detection
- `hooks/` - `usePIIScanner` orchestration hook for state and side effects
- `types/` - Shared TypeScript interfaces and types
- `lib/` - Utility functions and constants

**v2025.2 Integration Pattern:**

```
UI Extension
    → hubspot.fetch(NYMAI_API?portalId=123)
    → HubSpot injects X-HubSpot-Signature-v3 header
    → DigitalOcean API verifies signature with CLIENT_SECRET
    → Looks up OAuth tokens by portalId in Supabase
    → Calls HubSpot CRM API with stored access_token
```

**Why this pattern?**

- `hubspot.fetch()` does NOT support custom headers (Authorization ignored)
- Serverless functions removed in platform v2025.2
- Signature verification is the only supported auth method
- OAuth tokens stored per-portal for marketplace multi-tenancy

**Features:**

- Sidebar card on Contact, Company, Deal, Ticket records
- "Scan for PII" button triggers real CRM activity fetching (Notes, Emails, Calls)
- `usePIIScanner` orchestrates parallel detection and sequential redaction
- Detection summary with confidence scores and masked previews
- One-click "Redact All" functionality with real HubSpot updates
- "Rescan" button for re-checking
- 10-second undo window with real rollback capabilities (multi-activity support)
- Build-in concurrency guards and memory leak fixes (timer cleanup)
- Trust footer: "NymAI processes data ephemerally"
- Build #26 deployed to portal 244760488 (nym-ai)

## Data Flow

### Detection Flow

```
User opens record
    → Panel loads (UI Extension)
    → Fetches workspace settings
    → Fetches Notes/Emails/Calls via HubSpot API Client (v3/v4)
    → POST /api/detect with activity text via NymAI Client
    → Core detection engine processes
    → Returns findings (type, position, confidence)
    → Displays grouped summary in panel
    → Text cleared from memory
```

### Redaction Flow

```
Agent clicks [Redact All]
    → usePIIScanner triggers redaction sequence
    → POST /api/redact with activity text
    → Core engine detects + masks
    → Returns masked text
    → Log metadata to Supabase (NO raw text)
    → PATCH HubSpot activity via HubSpot API Client
    → Show undo banner (10s) with countdown
    → Original text in memory undo stack
    → After 10s or explicit dismissal, clear undo state
```

### Attachment Scanning Flow (Client-Side OCR)

```
Agent clicks [Scan Attachment]
    → Panel fetches attachment into browser memory (HubSpot → Browser)
    → Tesseract.js worker runs in browser (5-12s)
    → Extracts text from image/PDF
    → POST /api/detect with extracted text (NO image data)
    → Core detection engine processes text
    → Returns findings (type, position, confidence)
    → Displays summary in panel
    → Browser clears image + extracted text from memory
    → Log metadata to Supabase (file type, findings count, NO raw content)
```

**Critical:** Image data never reaches NymAI servers. Only extracted text is sent to `/api/detect` endpoint.

### Attachment Redaction Flow (Client-Side OCR + Canvas)

```
Agent clicks [Redact Image] after PII detected in attachment
    → Tesseract.js re-scans with word-level bounding boxes (x0, y0, x1, y1)
    → Returns detected text + coordinate data for each word
    → Sliding window algorithm matches OCR text to PII findings
    → Creates PIIRegion[] with bounding boxes for each PII instance
    → HTMLCanvasElement.drawImage() loads original image
    → Context2D.fillStyle = 'black' + fillRect() for each PII region
    → canvas.toBlob() creates redacted image (black boxes over PII)
    → FormData.append() with redacted blob
    → POST to HubSpot Files API (replaces original attachment)
    → Show [Undo - 10s] in panel
    → Browser clears: original image blob, OCR data, canvas, redacted blob
    → Log metadata to Supabase (file type, regions redacted, NO raw content)
```

**Critical:** All image manipulation happens client-side. Redacted images are uploaded directly to HubSpot (not NymAI servers). If NymAI is breached, attackers get no images or PII.

## Database Schema

**Tables (Supabase PostgreSQL):**

### oauth_tokens

```sql
portal_id                 VARCHAR PRIMARY KEY
access_token_encrypted    TEXT NOT NULL
refresh_token_encrypted   TEXT NOT NULL
expires_at                TIMESTAMPTZ NOT NULL
created_at                TIMESTAMPTZ
updated_at                TIMESTAMPTZ
```

### workspace_configs

```sql
workspace_id  VARCHAR PRIMARY KEY
mode          VARCHAR -- 'detection' | 'redaction'
detect_ssn    BOOLEAN DEFAULT TRUE
detect_cc     BOOLEAN DEFAULT TRUE
detect_email  BOOLEAN DEFAULT TRUE
detect_phone  BOOLEAN DEFAULT TRUE
detect_dl     BOOLEAN DEFAULT TRUE
-- New fields for enhanced detection
detect_dob    BOOLEAN DEFAULT TRUE
detect_passport BOOLEAN DEFAULT TRUE
detect_bank_account BOOLEAN DEFAULT TRUE
detect_routing BOOLEAN DEFAULT TRUE
detect_ip_address BOOLEAN DEFAULT TRUE
detect_medicare BOOLEAN DEFAULT TRUE
detect_itin   BOOLEAN DEFAULT TRUE
created_at    TIMESTAMPTZ
updated_at    TIMESTAMPTZ
```

### metadata_logs

```sql
id            UUID PRIMARY KEY
workspace_id  VARCHAR NOT NULL
object_id     VARCHAR NOT NULL
activity_id   VARCHAR
data_types    TEXT[] -- Array of detected types
agent_id      VARCHAR NOT NULL
action        VARCHAR -- 'detected' | 'redacted'
created_at    TIMESTAMPTZ
```

**Security:** Row-Level Security (RLS) enabled on all tables.

## Security Architecture

### Ephemeral Processing

**For Text Redaction:**

- Text held in memory only during request processing (<500ms)
- Explicit memory clearing after processing (`text = null`)
- No raw PII ever stored in database
- Only metadata (types, counts, positions) logged

**For Attachment Scanning (Client-Side OCR):**

- Images fetched into browser memory only (HubSpot → Agent's browser)
- Processed by Tesseract.js **in the browser** (no server upload)
- Extracted text sent to `/api/detect` (text only, NO image data)
- Browser memory cleared immediately after scan (image + extracted text)
- No images or extracted text stored on servers
- No attachment data logged beyond file type/size/findings count

**Critical Distinction:** Client-side OCR means **zero** raw attachment data ever reaches NymAI servers. If NymAI is breached, attackers get detection metadata (file types, findings) but **no images or extracted PII**.

**For Attachment Redaction (Client-Side Canvas):**

- Canvas manipulation happens entirely in browser (HTML5 Canvas API)
- Black box overlays drawn over detected PII regions using fillRect()
- Redacted image uploaded directly to HubSpot (bypasses NymAI servers)
- No redacted images stored on NymAI servers
- Browser memory cleared immediately after upload: original image, canvas, redacted blob
- Only metadata logged to Supabase (file type, regions redacted, count)
- Undo state held in panel memory only (cleared after 10 seconds)

**Critical:** All image redaction processing is client-side. Redacted images go directly to HubSpot. If NymAI is breached, attackers get **no images** (original or redacted), **no PII**, only metadata about what was redacted.

### Authentication

- HubSpot panel: OAuth 2.0 + Portal ID validation
- Admin console: Supabase Auth with Google OAuth
- API: Header-based workspace identification

### Data Protection

- HTTPS only in production
- No body logging in middleware
- Error messages sanitized (max 20 chars)
- Service key used for server-side Supabase operations

## Technology Stack

| Layer           | Technology               | Purpose                                 |
| --------------- | ------------------------ | --------------------------------------- |
| Detection       | TypeScript (zero deps)   | PII pattern matching                    |
| Client-side OCR | Tesseract.js v6.0.1      | Browser-based text extraction           |
| PDF Rendering   | pdfjs-dist v3.11.174     | PDF to canvas conversion                |
| Canvas API      | HTML5 Canvas API         | Image redaction with black box overlays |
| API             | Hono + Node.js           | REST endpoints                          |
| Database        | Supabase PostgreSQL      | Metadata storage                        |
| Auth            | Supabase Auth            | Admin authentication                    |
| Admin UI        | React + Vite + Tailwind  | Configuration dashboard                 |
| HubSpot UI      | React + UI Extensions    | CRM panel                               |
| Styling         | Shadcn/ui + Tailwind CSS | UI components                           |
| Testing         | Vitest                   | Unit and integration tests              |
| Monorepo        | pnpm workspaces          | Package management                      |

## Deployment Architecture

### Production URLs

| Service       | URL                                        | Platform             |
| ------------- | ------------------------------------------ | -------------------- |
| API Server    | https://nymai-api-dnthb.ondigitalocean.app | DigitalOcean         |
| Admin Console | https://nymai-admin.vercel.app             | Vercel               |
| Database      | Supabase PostgreSQL                        | Supabase (free tier) |
| Auth          | Google OAuth via Supabase                  | Supabase Auth        |

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

### HubSpot App

- Hosted on HubSpot infrastructure
- Platform version 2025.2 (no serverless functions)
- UI Extension calls DigitalOcean API with `portalId` query param
- HubSpot injects `X-HubSpot-Signature-v3` header automatically
- Backend verifies signature, looks up OAuth tokens by portalId
- OAuth 2.0 for marketplace multi-tenancy
- App ID: 27806747, Card ID: 102909968

## References

- [Project Spec](../internal/project_spec.md) - Complete technical specification
- [Security Overview](../internal/security_overview.md) - Security architecture details
