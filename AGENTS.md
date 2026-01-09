# AGENTS.md

Project memory for NymAI — a HubSpot CRM Hygiene tool with ephemeral processing.

> **Purpose:** This file serves as a quick reference guide for day-to-day development. For the complete technical specification and canonical source of truth, refer to [`docs/internal/project_spec.md`](docs/internal/project_spec.md).
>
> **Maintenance:** This file should be updated periodically after important milestones, implementations, or architectural changes **with user approval** to keep it aligned with the evolving codebase.
>
> **Note:** Claude Code is compatible with OpenCode, so any mention of the Claude ecosystem is compatible with you.

---

## 1. Architecture Overview

```
NymAI/
├── packages/
│   ├── core/                  # @nymai/core — Detection engine (regex, no deps)
│   │   ├── src/detection/     # Pattern matching (12 types: SSN, CC, DOB, etc.)
│   │   ├── src/redaction/     # Masking strategies
│   │   └── tests/             # Golden set accuracy tests
│   ├── api/                   # Hono API server (DigitalOcean $5/mo)
│   │   ├── src/routes/        # /redact, /detect, /logs, /settings
│   │   ├── src/services/      # HubSpot API client (was Zendesk)
│   │   ├── src/db/            # Supabase client
│   │   └── src/middleware/    # Auth, logging (no body logging!)
│   ├── clients/hubspot/       # HubSpot UI Extensions (Direct API calls)
│   │   ├── src/app/cards/     # React UI Extension Components
│   │   │   ├── api/           # HubSpot and NymAI API clients
│   │   │   ├── hooks/         # usePIIScanner orchestration hook
│   │   │   ├── lib/           # Utils and constants
│   │   │   └── types/         # TypeScript definitions
│   └── admin/                 # React + Vite SPA (Vercel)
├── docs/                      # Project documentation (see §9)
├── .env.example               # Template for secrets
└── pnpm-workspace.yaml        # Monorepo config
```

---

## 2. Data Flow

**Agent Redaction (HubSpot v2025.2):**

```
Agent opens record → UI Extension loads → Calls NymAI API with context.token
    ↓
NymAI API fetches Notes/Emails/Calls via HubSpot CRM API (using token)
    ↓
NymAI API runs detection → Returns grouped findings to UI Extension
    ↓
Agent clicks [Redact All] → UI Extension calls POST /api/redact
    ↓
NymAI API PATCHes HubSpot records (using token) → UI shows [Undo - 10s]
```

**Key v2025.2 Pattern:**

- `hubspot.fetch()` only works for external APIs, NOT HubSpot APIs directly
- Serverless functions removed in platform v2025.2
- UI Extension passes `context.token` to external backend
- External backend uses token to call HubSpot CRM API

**Attachment Scanning:**

```
Agent clicks [Scan] → Fetch into browser → Tesseract.js (Client-side OCR)
    ↓
Extracted text sent to /api/detect (NO image data sent) → Findings displayed
```

---

## 3. Design Style Guide

**Tech Stack:**
| Component | Technology |
|-----------|------------|
| Core Engine | TypeScript (zero deps) |
| API Server | Hono on DigitalOcean |
| Database | Supabase PostgreSQL (metadata only) |
| Admin Console | React + Vite on Vercel |
| HubSpot App | React UI Extensions (v2025.2 - External Backend) |

**Naming Conventions:**

- Files/folders: `kebab-case` → `metadata-logs.ts`
- React components: `PascalCase` → `Dashboard.tsx`
- Variables/functions: `camelCase` → `handleRedact()`
- Constants: `SCREAMING_SNAKE_CASE` → `MAX_UNDO_WINDOW_MS`
- Database/API fields: `snake_case` → `workspace_id`

---

## 4. Constraints & Policies

**Security — MUST follow:**

- NEVER expose `.env.local` or any API keys
- NEVER log request/reponse bodies (contains PII)
- NEVER store raw record text — metadata only
- Sanitize error logs to first 20 chars max
- Explicit memory clearing after processing (`text = null`)

**Code Quality:**

- TypeScript strict mode across all packages
- No `any` types without justification
- Run `pnpm lint` before committing
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `chore:`

**Dependencies:**

- Minimize external deps for MVP
- `@nymai/core` must remain zero-dependency
- Prefer Supabase client over raw SQL for RLS

**MVP Scope — Do NOT build:**

- ❌ Automatic redaction (agent-initiated only)
- ❌ Other SaaS integrations (HubSpot only)
- ❌ AI/ML classification (regex only) — ML enhancement available at Business+ tier

---

## 5. Repository Etiquette

**Branching:**

- ALWAYS create feature branch before major changes
- NEVER commit directly to `main`
- Branch naming: `feature/description` or `fix/description`

**Git Workflow:**

1. Create branch: `git checkout -b feature/your-feature`
2. Develop and commit on feature branch
3. Test locally before pushing
4. Push: `git push -u origin feature/your-feature`
5. Create PR to merge into `main`

**Commits:**

- Clear messages describing the change
- Keep commits focused on single changes
- NEVER force push to `main`

**Before Pushing:**

1. Run `pnpm lint`
2. Run `pnpm build` to catch type errors

---

## 6. Commands

**Windows PowerShell — Common commands:**

```powershell
# Install dependencies
pnpm install

# Run API server (dev mode)
pnpm --filter @nymai/api dev

# Run admin console (dev mode)
pnpm --filter admin dev

# Run HubSpot app (dev mode)
cd packages/clients/hubspot
hs project dev

# Deploy to HubSpot
hs project upload

# Run all tests
pnpm test

# Run core detection tests only
pnpm --filter @nymai/core test

# Lint all packages
pnpm lint

# Build for production
pnpm build

# Copy env templates
Copy-Item packages/api/.env.example packages/api/.env.local
Copy-Item packages/admin/.env.example packages/admin/.env.local
```

---

## 7. Testing

**Framework:** Vitest (configured in each package)

**Detection Accuracy Targets:**

- Precision ≥90% for SSN and credit cards
- Precision ≥85% for email/phone
- Precision ≥75% for new types (DOB, Passport, etc.)
- Recall ≥70% across all types

**Pre-Release Checklist:**

- [ ] `pnpm --filter @nymai/core test` passes
- [ ] `pnpm --filter @nymai/api test` passes
- [ ] Detection accuracy meets targets
- [ ] No raw text in any logs
- [ ] Manual E2E in HubSpot sandbox (detect → redact → undo)

---

## 8. Pricing Reference

| Tier       | Base    | Per Seat           |
| ---------- | ------- | ------------------ |
| Individual | $29/mo  | —                  |
| Pro        | $99/mo  | +$15/seat after 5  |
| Business   | $249/mo | +$12/seat after 15 |
| Enterprise | Custom  | Custom             |

---

## 9. Documentation

**Quick Reference — docs folder:**
| File | Contents |
|------|----------|
| [Project Spec](docs/internal/project_spec.md) | Complete technical spec (source of truth) |
| [Security Overview](docs/internal/security_overview.md) | Security architecture, ephemeral processing |
| [Roadmap](docs/vision/ROADMAP.md) | Product roadmap and scope boundaries |
| [Admin](docs/vision/ADMIN.md) | Business structure, compliance |
| [Market](docs/vision/MARKET.md) | Target market, pricing strategy |
| [Vision](docs/vision/VISION.md) | Long-term vision and philosophy |
| [Architecture](docs/memory/architecture.md) | System design and data flow |
| [Changelog](docs/memory/changelog.md) | Version history and breaking changes |
| [Project Status](docs/memory/project_status.md) | Current project status and milestones |

**Files to update (after major milestones and significant project additions):**
| File | Contents | Update Frequency |
|------|----------|------------------|
| **CLAUDE.md** | This file — quick reference for AI/developers | After major milestones, implementations, or architectural changes (with user approval) |
| [Architecture](docs/memory/architecture.md) | System design and data flow | After architectural changes |
| [Changelog](docs/memory/changelog.md) | Version history and breaking changes | After each release |
| [Project Status](docs/memory/project_status.md) | Current project status and milestones | After milestone completions |
| [Project Spec](docs/internal/project_spec.md) | Complete technical spec (source of truth) | After scope changes or major technical decisions |

> **Rule:** `docs/memory/` files are updated after major milestones and significant project additions implicitly or when I perform `/`. Keep `project_spec.md` as the canonical source of truth for technical decisions. AGENTS.md updates require explicit user approval.

---

## 10. MCP Server Integration

**Configuration:**

- **Project-scoped servers**: `.mcp.json` (gitignored, contains API keys)
- **User-scoped servers**: Configured via Claude Code settings
- **Plugins**: Installed via `claude plugin install`

### CLI Tools (No MCP Required)

**DigitalOcean CLI (`doctl`)** _(Primary Deployment)_

- Purpose: Manage NymAI API server deployment on DigitalOcean App Platform
- Installation: `winget install DigitalOcean.Doctl` or `brew install doctl`
- Auth: `doctl auth init` (requires API token from DO dashboard)
- Common commands:
  ```bash
  doctl apps list                           # View all deployed apps
  doctl apps get <app-id>                   # Check app status and configuration
  doctl apps create-deployment <app-id>    # Trigger new deployment
  doctl apps logs <app-id>                  # Stream live logs
  doctl apps logs <app-id> --type=build    # View build logs
  doctl apps update <app-id> --spec=.do/app.yaml  # Update app config
  ```
- Note: $5/mo basic plan covered by student developer credits ($200)

**HubSpot CLI (`hs`)** _(HubSpot App Development)_

- Purpose: Develop and deploy HubSpot UI Extensions
- Installation: `npm install -g @hubspot/cli`
- Auth: `hs init` (creates hubspot.config.yml with portal credentials)
- Common commands:
  ```bash
  hs project dev                    # Start local dev server with hot reload
  hs project upload                 # Deploy app to HubSpot
  hs project logs                   # View serverless function logs (if any)
  hs accounts list                  # List connected HubSpot accounts
  hs sandbox create                 # Create developer sandbox for testing
  ```
- Working directory: `packages/clients/hubspot/`
- Note: UI Extensions call external backend with `context.token` (v2025.2 pattern, no serverless)

**Render CLI** _(Alternative Deployment)_

- Purpose: Alternative deployment platform for NymAI API
- Instance: NymAI workspace on Render
- Use for:
  - Fallback deployment if DigitalOcean unavailable
  - Checking API server deployment status
  - Viewing logs for debugging
  - Monitoring performance metrics
- Common operations:
  - `list_services` - View all deployed services
  - `get_logs` - Debug production issues
  - `get_metrics` - Monitor CPU/memory usage
  - `update_environment_variables` - Update API configuration
- Note: $7/mo starter plan (more expensive than DigitalOcean)

**Vercel (`mcp__vercel__*`)**

- Purpose: Manage NymAI admin console deployment
- Project: `admin` (React + Vite SPA)
- Use for:
  - Deploying admin console updates
  - Checking deployment status and logs
  - Managing preview deployments
  - Configuring environment variables
- Common operations:
  - `list_deployments` - Check deployment history
  - `get_deployment` - Inspect specific deployment
  - `deploy_to_vercel` - Trigger new deployment

### User-Scoped Servers (Development tools)

**GitHub (`mcp__github__*`)**

- Purpose: Repository and PR management
- Use for:
  - Creating/managing pull requests
  - Searching code across repositories
  - Managing issues and reviews
  - Checking commit history
- Common operations:
  - `create_pull_request` - Submit code for review
  - `search_code` - Find code patterns
  - `list_commits` - Review commit history
  - `add_issue_comment` - Respond to issues

**Supabase (`mcp__plugin_supabase_supabase__*`)**

- Purpose: Database operations for NymAI
- Instance: NymAI Supabase project
- Use for:
  - Querying metadata logs (NO raw PII!)
  - Managing database schema
  - Checking redaction statistics
  - Debugging data issues
- Common operations:
  - `execute_sql` - Query metadata tables
  - `list_tables` - Inspect schema
  - `apply_migration` - Update database schema
  - `get_advisors` - Check security/performance issues

**Playwright (`mcp__plugin_playwright_playwright__*`)**

- Purpose: Browser automation and E2E testing
- Use for:
  - Testing HubSpot UI Extension components
  - Automated E2E testing workflows
  - Taking screenshots for documentation
  - Debugging browser-based issues
- Common operations:
  - `browser_navigate` - Open test pages
  - `browser_snapshot` - Capture accessibility tree
  - `browser_take_screenshot` - Document UI state
  - `browser_click` - Automate user interactions

**Context7 (`mcp__plugin_context7_context7__*`)**

- Purpose: Up-to-date library documentation
- Use for:
  - Looking up current API documentation
  - Finding code examples for libraries
  - Checking framework best practices
  - Verifying API compatibility
- Common operations:
  - `resolve-library-id` - Find library identifier
  - `query-docs` - Get documentation and examples

**Exa (`mcp__websearch_exa__*`)** _(Web Search & Code Context)_

- Purpose: AI-powered web search and code context retrieval
- Provider: Exa AI (https://mcp.exa.ai/mcp)
- Use for:
  - Finding up-to-date code documentation and examples
  - Searching GitHub repos, docs pages, StackOverflow
  - Real-time web searches with optimized results
  - Deep research on complex technical questions
  - Extracting content from specific URLs
- Available tools:
  - `web_search_exa` - Real-time web searches (enabled by default)
  - `get_code_context_exa` - Code snippets, examples, API patterns from OSS (enabled by default)
  - `deep_search_exa` - Deep web search with smart query expansion
  - `crawling_exa` - Extract content from specific URLs
  - `company_research_exa` - Comprehensive company research
  - `linkedin_search_exa` - LinkedIn search for companies/people
  - `deep_researcher_start` / `deep_researcher_check` - AI researcher for complex questions
- Note: Currently experiencing Cloudflare connectivity issues; configured but may be temporarily unavailable

### Plugins

**Serena (`mcp__plugin_serena_serena__*`)** _(REMOVED)_

- Status: Plugin removed from project configuration
- Was used for: Semantic code navigation and editing
- Alternative: Use LSP tools (`lsp_goto_definition`, `lsp_find_references`, `lsp_workspace_symbols`) for code navigation

### Common Workflows

**Testing PII Detection End-to-End:**

1. Use HubSpot sandbox or mock data (manual)
2. Open record in HubSpot UI Extension (manual)
3. Test detection via UI Extension
4. Use Supabase MCP: `execute_sql` to verify metadata logged (NO raw PII!)

**Debugging Production Issues:**

1. Use `doctl apps logs <app-id>` to check API errors (or Render MCP: `get_logs`)
2. Use `doctl apps get <app-id>` to check app health (or Render MCP: `get_metrics`)
3. Use Supabase MCP: `execute_sql` to check database state
4. Use GitHub MCP: `search_code` to find related code

**Deploying Changes:**

1. Use GitHub MCP: `create_pull_request` for code review
2. After merge: Use `doctl apps get <app-id>` to confirm auto-deploy (or Render MCP as alternative)
3. Use Vercel MCP: `list_deployments` to check admin console deploy
4. Use `doctl apps logs <app-id>` to verify no errors

**Researching Implementation:**

1. Use Context7 MCP: `resolve-library-id` for library docs
2. Use Context7 MCP: `query-docs` for deep-dive on specific libraries
3. Use GitHub MCP: `search_code` to find similar implementations
4. Use LSP tools: `lsp_workspace_symbols`, `lsp_find_references` to navigate codebase

### MCP Configuration Files

**Claude Code:**

- `.mcp.json` - MCP server config (gitignored)
- `.claude/` - Claude Code settings (gitignored)

**OpenCode:**

- `opencode.json` - MCP server config (gitignored)

**DO NOT commit:**

- `.mcp.json` - Contains API keys (gitignored)
- `opencode.json` - Contains API keys (gitignored)
- `.env.local` - Contains secrets (gitignored)

**Safe to commit:**

- `.env.example` - Template with MCP configuration section
- `.claude/mcp_settings.example.json` - Example MCP config (deprecated, use `.mcp.json`)
- `opencode.example.json` - Example OpenCode MCP config (use `{env:VAR_NAME}` for secrets)
- And files not inside .gitignore
