# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
