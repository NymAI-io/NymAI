# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Production deployment to DigitalOcean (primary) or Render (alternative)
- Admin console deployment to Vercel
- Zendesk Marketplace submission
- Manual E2E testing in Zendesk sandbox
- Performance optimization for large tickets
