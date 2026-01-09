# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.3.0] - 2026-01-09

### Changed

**HubSpot Platform v2025.2 Migration**

- Migrated from serverless functions to external backend architecture (v2025.2 requirement)
- UI Extension now passes `context.token` to DigitalOcean API for HubSpot API authentication
- API accepts Bearer token from Authorization header instead of env var
- Deleted `app.functions/` directory (serverless not supported in v2025.2)
- Build #26 deployed with new architecture

### Fixed

- Fixed "Hub is unknown to this Hublet" errors by routing through external backend
- Resolved regional authentication issues (na2 hublet) for HubSpot API calls

### Technical Notes

**v2025.2 Architecture Pattern:**

- `hubspot.fetch()` only works for external APIs, NOT HubSpot APIs directly
- Serverless functions completely removed in platform v2025.2
- Correct flow: UI Extension → hubspot.fetch(externalAPI, {token}) → Your Backend → HubSpot API
- `context.token` contains OAuth token with app's scopes, passed to external backend
- `HUBSPOT_PRIVATE_APP_TOKEN` env var no longer needed (can be removed)

---

## [5.2.0] - 2026-01-05

### Added

**HubSpot Serverless Migration Plan**

- Created implementation plan for migrating HubSpot CRM API calls from `hubspot.fetch()` to Serverless Functions.
- Addressed regional authentication issues (401/488 errors) for portals in non-US regions (e.g., `na2`).
- Defined Phase 1-4 roadmap for serverless infrastructure, functions, and UI integration.

**Real HubSpot API Integration (Option B Complete)**

- Wired UI Extension to real HubSpot CRM API and NymAI API
- Implemented modular architecture in `packages/clients/hubspot/src/app/cards/` (api/, hooks/, types/, lib/)
- Added `HubSpotAPIClient` for fetching/updating Notes, Emails, and Calls (v3/v4 API)
- Added `NymAIClient` for direct calls to DigitalOcean-hosted detection engine
- Added `usePIIScanner` orchestration hook with concurrency guards and auto-cleanup
- Parallel fetching of activities using `Promise.all`
- Multi-activity undo support with real HubSpot PATCH rollbacks
- **Build #6 successfully deployed to portal 244760488 (nym-ai)**

**Code Quality & Reliability**

- Fixed memory leak in undo timer using `useRef` and `useEffect` cleanup
- Implemented state-based concurrency guards to prevent double-click race conditions
- Optimized undo stack logic to only track successful redactions
- Improved state management: stale findings are cleared after undo

### Changed

- Updated `nymai-panel.tsx` to use the new modular hook-based architecture

---

## [5.1.0] - 2026-01-04

### Added

**HubSpot UI Extension Scaffold (Option A Complete)**

- Created `packages/clients/hubspot/` with HubSpot CLI project structure
- UI Extension card (`nymai_panel`) deployed to CRM record sidebar
- Supports Contact, Company, Deal, Ticket object types
- Mock detection UI with confidence scores and masked previews
- "Scan for PII" / "Redact All" / "Rescan" button flow
- 10-second undo window implementation
- Trust footer: "NymAI processes data ephemerally. No raw content is stored."

**Key Files:**

- `src/app/app-hsmeta.json` - App config with static auth, scopes, permittedUrls
- `src/app/cards/nymai-panel.tsx` - React UI Extension (180 lines)
- `src/app/cards/nymai-panel-hsmeta.json` - Card location config

**HubSpot Integration Details:**

- App ID: 27806747
- Card ID: 102909968
- Location: `crm.record.sidebar`
- Auth: Static (dev), OAuth 2.0 (marketplace)

### Changed

- Renamed `packages/clients/zendesk` → `packages/clients/zendesk-legacy`
- Architecture updated: No serverless (free plan limitation), UI Extension calls NymAI API directly via `hubspot.fetch()`

### Technical Notes

- HubSpot free plan does not support serverless functions
- UI Extension uses `hubspot.fetch()` with `permittedUrls` for direct API calls
- Mock data currently hardcoded; Option B will wire real API integration

---

## [5.0.0] - 2026-01-04

### Changed

**Strategic Documentation Overhaul**

- Revised timeline from 6 months to 12-15 months for $41K MRR target (de-risking for solo founder)
- Updated milestone structure: MVP (Month 1-2) → Growth (Month 3-12, $15K MRR) → Scale (Month 12-15, $41K MRR)
- Clarified ICP hierarchy: RevOps Manager primary (Individual/Pro), CISO/DPO secondary (Business/Enterprise)
- Added Founder-Led Sales Playbook (Section 8.5 in MARKET.md) for Month 0-3 direct outreach
- Added Churn Prevention Strategy (Section 13.3 in MARKET.md) targeting <3% monthly churn
- Added Trust Badge Positioning (Section V in VISION.md) for ephemeral processing narrative
- Added Support Scaling Plan (Section 12 in ADMIN.md) with customer volume thresholds
- Added Partnership Revenue Model (Section 13 in ADMIN.md) for HubSpot Solutions Partners

**Files Updated**

- ROADMAP.md v5.0
- MARKET.md v5.0
- VISION.md v5.0
- ADMIN.md v5.0
- project_spec.md v3.0
- project_status.md

---

## [0.3.0] - 2026-01-02

### Added

**Detection Enhancement**

- 7 new PII patterns: DOB, PASSPORT, BANK_ACCOUNT, ROUTING, IP_ADDRESS, MEDICARE, ITIN
- ABA routing number checksum validation
- Multi-comment scanning support (scans all public comments, capped at 20)
- Parallel scanning with concurrency limit
- Findings grouped by comment ID in sidebar

### Changed

- Replaced `latestComment` logic with `publicComments` array
- Updated `FindingsList` to show visual grouping by comment

## [0.2.0] - 2026-01-02

### Added

**Attachment Scanning and Redaction (Client-Side OCR)**

- Full OCR implementation using Tesseract.js v6.0.1
- PDF.js v3.11.174 integration for PDF rendering
- Canvas-based redaction with black box overlays over PII regions
- Supported formats: PNG, JPG/JPEG, WEBP, PDF
- Word-level OCR output with bounding box coordinates (x0, y0, x1, y1)
- Sliding window algorithm matching OCR text to PII findings
- Client-side image manipulation (no server uploads)
- Redacted images uploaded directly to Zendesk
- 10-second undo window for attachment redactions
- Visual preview with PII highlighting (red boxes, semi-transparent fill)
- Zoom controls (50% - 300%) for detailed inspection
- Progress tracking with stage indicators (downloading, processing, detecting)

**Components**

- AttachmentCard - Expandable cards showing OCR status and findings
- AttachmentPreview - Canvas-based image viewer with redaction preview
- AttachmentList - Aggregate statistics and bulk operations
- OCRFindings - Grouped findings display with confidence scores
- UndoBanner - 10-second undo window with expiration

**Hooks**

- useOCR - Attachment scanning orchestration with AbortController support
- useAttachmentRedaction - Redaction workflow with blob URL cleanup

**Services**

- ocr.service - Tesseract.js worker integration, PDF to canvas conversion
- downloader - Zendesk attachment fetch with metadata enrichment
- uploader - Canvas redaction, Zendesk upload API integration, mergeBoundingBoxes utility

**Dependencies**

- tesseract.js v6.0.1 - Client-side OCR engine
- pdfjs-dist v3.11.174 - PDF rendering library

### Changed

**UI/UX**

- Added "Attachments" tab to sidebar (switch between Comments/Attachments)
- Attachment cards show Clean/PII/Error status badges
- Processing time display for each attachment
- Visual feedback during OCR processing (progress bar, stage labels)

### Fixed

**Critical Runtime Bug**

- Fixed undefined `client` variable in App.tsx - properly destructured from useZAF() hook
- Fixed prop naming in useAttachmentRedaction call ({ zaf: client })

**Code Quality**

- Removed all unused imports across 6 files
- Prefixed intentionally unused parameters with underscore (\_)
- Added eslint-disable comments for TODO scaffolding code
- All ESLint errors resolved (0 errors, 0 warnings)
- Security-critical PII memory cleanup in ocr.service.ts with explicit eslint-disable rationale

### Technical Notes

**Memory Security**

- Explicit PII cleanup in ocr.service.ts using (w as any).text = '' for Tesseract word objects
- Blob URLs for attachments revoked after use
- Undo state cleared after 10-second window
- No images or PII stored in browser memory beyond processing window

**Performance**

- Vite 5 native worker support (no separate worker files)
- AbortController for cancellable OCR operations
- Processing time tracking (ms precision)

---

## [0.1.0] - 2026-01-01

### Added

**Core Detection Engine (@nymai/core)**

- Regex-based PII detection for 5 data types:
  - SSN (###-##-####) - 90% confidence
  - Credit Card (16 digits, various formats) - 95% confidence with Luhn validation
  - Email addresses - 98% confidence
  - Phone numbers (US formats) - 85% confidence
  - Driver's License (state patterns) - 70% confidence
- Masking strategies preserving last 4 digits/characters for context
- Zero-dependency package for maximum portability
- 57 unit tests passing with accuracy targets met

**API Server (@nymai/api)**

- Hono-based REST API with TypeScript
- Endpoints:
  - `POST /api/detect` - Detection-only mode
  - `POST /api/redact` - Detection + masking
  - `GET /api/logs` - Metadata log queries
  - `GET/PUT /api/settings` - Workspace configuration
  - `GET /health` - Health check
- Middleware for auth, logging (no body logging), request ID
- Ephemeral text processing with explicit memory clearing
- 12 integration tests passing

**Admin Console (packages/admin)**

- React + Vite SPA with Tailwind CSS + Shadcn/ui
- Pages:
  - Dashboard with detection statistics
  - Settings for PII type configuration
  - Audit log viewer with filtering
- Supabase Auth integration (Google OAuth)
- Protected routes with loading states

**Zendesk Sidebar App (packages/clients/zendesk)**

- ZAF SDK integration for Zendesk iframe
- Real-time PII scanning on ticket load
- Visual findings display grouped by type
- One-click "Redact All" functionality
- 10-second undo window for reversals
- Detection-only mode support
- Automatic sidebar resize

**Database (Supabase)**

- PostgreSQL schema for metadata storage:
  - `workspace_configs` - PII type toggles, mode settings
  - `metadata_logs` - Audit trail (NO raw PII stored)
- Row-Level Security (RLS) policies applied
- Automatic timestamps via triggers

**Infrastructure**

- pnpm monorepo with workspaces
- Shared TypeScript config
- Vitest test framework
- ESLint + Prettier configuration
- DigitalOcean App Platform config (`.do/app.yaml`) - Primary deployment
- Render deployment config (`render.yaml`) - Alternative deployment
- Environment variable templates (`.env.example`)

### Security

- Ephemeral processing model - text never persisted
- Explicit memory clearing after request processing
- No body logging in middleware
- Error message sanitization (max 20 chars)
- Service key authentication for server-side operations
- RLS enabled on all database tables

---

## [Unreleased]

### Added

**HubSpot Pivot Documentation**

- Completely rewritten `security_overview.md` for HubSpot-first architecture
- Documented HubSpot Serverless + NymAI API integration model
- Documented OAuth 2.0 security controls for HubSpot
- Added HubSpot-specific data flow diagrams (Scan/Redact/OAuth)
- Updated data surfaces for HubSpot CRM (Notes, Emails, Calls, Conversations)

### Planned

**Competitive Intelligence Documentation**

- Added COMPETITIVE.md with full competitive analysis (internal only)
- Updated MARKET.md with Zendesk Marketplace competitors
- Updated VISION.md with 10x positioning framework
- Updated security_overview.md with competitive FAQ

### Pending

- Zendesk Marketplace submission
- Manual E2E testing in Zendesk sandbox
- Zendesk App configuration with production URLs
