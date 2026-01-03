# NymAI Architecture

> Last updated: 2026-01-02

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
         |                   +------|------+-----------------+
         |                   |      |      |                 |
         |                   |      v      |                 |
         |                   |  Tesseract.js|                 |
         |                   |  (Client OCR) |                 |
         |                   |      |      |                 |
         |                   +------|------+                 |
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

**Key:** Client-side OCR (Tesseract.js) runs in browser, images never reach NymAI servers.

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

- Scans ALL public comments in a ticket (capped at 20 most recent)
- Parallel scanning with concurrency control (max 5 requests)
- Findings grouped by comment ID for targeted redaction
- Multi-comment undo support with comment-level tracking

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
- `services/downloader.ts` - Zendesk attachment download utilities
- `services/uploader.ts` - Redacted image upload to Zendesk

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
- One-click "Redact All" functionality
- 10-second undo window
- Detection-only mode support
- Automatic sidebar resize

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

### Attachment Scanning Flow (Client-Side OCR)

```
Agent clicks [Scan Attachment]
    → Sidebar fetches attachment into browser memory (Zendesk → Browser)
    → Tesseract.js worker runs in browser (5-12s)
    → Extracts text from image/PDF
    → POST /api/detect with extracted text (NO image data)
    → Core detection engine processes text
    → Returns findings (type, position, confidence)
    → Displays summary in sidebar
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
    → POST to Zendesk Upload API (replaces original attachment)
    → Show [Undo - 10s] in sidebar
    → Browser clears: original image blob, OCR data, canvas, redacted blob
    → Log metadata to Supabase (file type, regions redacted, NO raw content)
```

**Critical:** All image manipulation happens client-side. Redacted images are uploaded directly to Zendesk (not NymAI servers). If NymAI is breached, attackers get no images or PII.

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

**For Text Redaction:**

- Text held in memory only during request processing (<500ms)
- Explicit memory clearing after processing (`text = null`)
- No raw PII ever stored in database
- Only metadata (types, counts, positions) logged

**For Attachment Scanning (Client-Side OCR):**

- Images fetched into browser memory only (Zendesk → Agent's browser)
- Processed by Tesseract.js **in the browser** (no server upload)
- Extracted text sent to `/api/detect` (text only, NO image data)
- Browser memory cleared immediately after scan (image + extracted text)
- No images or extracted text stored on servers
- No attachment data logged beyond file type/size/findings count

**Critical Distinction:** Client-side OCR means **zero** raw attachment data ever reaches NymAI servers. If NymAI is breached, attackers get detection metadata (file types, findings) but **no images or extracted PII**.

**For Attachment Redaction (Client-Side Canvas):**

- Canvas manipulation happens entirely in browser (HTML5 Canvas API)
- Black box overlays drawn over detected PII regions using fillRect()
- Redacted image uploaded directly to Zendesk (bypasses NymAI servers)
- No redacted images stored on NymAI servers
- Browser memory cleared immediately after upload: original image, canvas, redacted blob
- Only metadata logged to Supabase (file type, regions redacted, count)
- Undo state held in sidebar memory only (cleared after 10 seconds)

**Critical:** All image redaction processing is client-side. Redacted images go directly to Zendesk. If NymAI is breached, attackers get **no images** (original or redacted), **no PII**, only metadata about what was redacted.

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
| Zendesk UI      | React + ZAF SDK          | Agent sidebar                           |
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

### Zendesk App

- Hosted on Zendesk CDN
- ZAF iframe architecture
- Signed installation

## References

- [Project Spec](../project_spec.md) - Complete technical specification
- [Security Overview](../vision/security_overview.md) - Security architecture details
