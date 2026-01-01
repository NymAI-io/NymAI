# CLAUDE.md

Project memory for NymAI — a Zendesk PII detection and redaction tool with ephemeral processing.

---

## 1. Architecture Overview

```
NymAI/
├── packages/
│   ├── core/                  # @nymai/core — Detection engine (regex, no deps)
│   │   ├── src/detection/     # Pattern matching (SSN, CC, email, phone, DL)
│   │   ├── src/redaction/     # Masking strategies
│   │   └── tests/             # Golden set accuracy tests
│   ├── api/                   # Hono API server (DigitalOcean $5/mo)
│   │   ├── src/routes/        # /redact, /detect, /logs, /settings
│   │   ├── src/services/      # Zendesk API client
│   │   ├── src/db/            # Supabase client
│   │   └── src/middleware/    # Auth, logging (no body logging!)
│   ├── clients/zendesk/       # ZAF SDK sidebar app
│   └── admin/                 # React + Vite SPA (Vercel)
├── docs/                      # Project documentation (see §8)
├── .env.example               # Template for secrets
└── pnpm-workspace.yaml        # Monorepo config
```

---

## 2. Data Flow

**Agent Redaction:**
```
Agent opens ticket → Sidebar loads → Scans via /api/detect → Shows findings
    ↓
Agent clicks [Redact All] → POST /api/redact (text in memory <500ms)
    ↓
Regex detection → Mask text → Log metadata (NO raw text) → Clear memory
    ↓
Return masked text → Update Zendesk comment → Show [Undo - 10s]
```

**Detection-Only Mode:**
```
Sidebar scans → Shows read-only summary → No redaction buttons → Logs stats
```

---

## 3. Design Style Guide

**Tech Stack:**
| Component | Technology |
|-----------|------------|
| Core Engine | TypeScript (zero deps) |
| API Server | Hono on DigitalOcean (Render as alternative) |
| Database | Supabase PostgreSQL (metadata only) |
| Admin Console | React + Vite on Vercel |
| Zendesk App | ZAF SDK + React |

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
- NEVER log request/response bodies (contains PII)
- NEVER store raw ticket text — metadata only
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
- ❌ Attachment scanning
- ❌ AI/ML classification (regex only)
- ❌ Other SaaS integrations (Zendesk only)

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

# Run Zendesk app (dev mode)
cd packages/clients/zendesk; pnpm dev

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
- Recall ≥70% across all types

**Pre-Release Checklist:**
- [ ] `pnpm --filter @nymai/core test` passes
- [ ] `pnpm --filter @nymai/api test` passes
- [ ] Detection accuracy meets targets
- [ ] No raw text in any logs
- [ ] Manual E2E in Zendesk sandbox (detect → redact → undo)

---

## 8. Documentation

**Quick Reference — docs folder:**
| File | Contents |
|------|----------|
| [Project Spec](docs/project_spec.md) | Complete technical spec (source of truth) (NOTE: This is the only file you should read in your memory, DO NOT READ OTHER FILES UNLESS I EXPLICITLY TELL YOU TO) |
| [Security Overview](docs/vision/security_overview.md) | Security architecture, ephemeral processing |
| [Roadmap](docs/vision/ROADMAP.md) | Product roadmap and scope boundaries |
| [Admin](docs/vision/ADMIN.md) | Business structure, compliance |
| [Market](docs/vision/MARKET.md) | Target market, pricing strategy |
| [Vision](docs/vision/VISION.md) | Long-term vision and philosophy |
| [Architecture](docs/memory/architecture.md) | System design and data flow |
| [Changelog](docs/memory/changelog.md) | Version history and breaking changes |
| [Project Status](docs/memory/project_status.md) | Current project status and milestones |

**Files to update: (after major milestones and significant project additions) (docs/memory/)**
| File | Contents |
|------|----------|
| [Architecture](docs/memory/architecture.md) | System design and data flow |
| [Changelog](docs/memory/changelog.md) | Version history and breaking changes |
| [Project Status](docs/memory/project_status.md) | Current project status and milestones |
| [Project Spec](docs/project_spec.md) | Complete technical spec (source of truth) |

> **Rule:** Update docs after major milestones and significant project additions implicitly or when I perform `/. Keep `project_spec.md` as the canonical source of truth for technical decisions.

---

## 9. MCP Server Integration

**Configuration:**
- **Project-scoped servers**: `.mcp.json` (gitignored, contains API keys)
- **User-scoped servers**: Configured via Claude Code settings
- **Plugins**: Installed via `claude plugin install`

### Project-Scoped Servers (NymAI-specific)

**DigitalOcean (`mcp__digitalocean__*`)** *(Primary Deployment)*
- Purpose: Manage NymAI API server deployment on DigitalOcean App Platform
- Instance: NymAI app on DigitalOcean
- Use for:
  - Deploying and managing API server
  - Viewing deployment logs
  - Managing environment variables
  - Monitoring app health and metrics
- Common operations:
  - `list_apps` - View all deployed apps
  - `get_app` - Check app status and configuration
  - `create_deployment` - Trigger new deployment
  - `get_logs` - Debug production issues
- Note: $5/mo basic plan covered by student developer credits ($200)

**Render (`mcp__render__*`)** *(Alternative Deployment)*
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

**Zendesk (`mcp__zendesk__*`)**
- Purpose: Manage support tickets and test PII detection
- Instance: nymai.zendesk.com
- Use for:
  - Creating test tickets with mock PII data
  - Testing redaction workflows end-to-end
  - Managing customer support tickets
  - Validating detection accuracy in real tickets
- Common operations:
  - `create_ticket` - Create test cases with PII
  - `search_tickets` - Find tickets by status/query
  - `get_ticket` - Inspect ticket details
  - `update_ticket` - Test status transitions
  - `add_ticket_comment` - Test comment redaction

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
  - Testing Zendesk sidebar app UI
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

### Plugins

**Serena (`mcp__plugin_serena_serena__*`)**
- Purpose: Semantic code navigation and editing
- Use for:
  - Finding symbols across codebase
  - Understanding code relationships
  - Refactoring at symbol level
  - Navigating dependencies
- Common operations:
  - `find_symbol` - Locate functions/classes
  - `find_referencing_symbols` - Track usage
  - `get_symbols_overview` - Understand file structure
  - `replace_symbol_body` - Refactor code
- Note: Dashboard auto-launches at `http://localhost:24282` (can be disabled)

### Common Workflows

**Testing PII Detection End-to-End:**
1. Use Zendesk MCP: `create_ticket` with mock PII data
2. Open ticket in Zendesk sidebar app (manual)
3. Test detection via sidebar
4. Use Supabase MCP: `execute_sql` to verify metadata logged (NO raw PII!)

**Debugging Production Issues:**
1. Use Render MCP: `get_logs` to check API errors
2. Use Render MCP: `get_metrics` to check resource usage
3. Use Supabase MCP: `execute_sql` to check database state
4. Use GitHub MCP: `search_code` to find related code

**Deploying Changes:**
1. Use GitHub MCP: `create_pull_request` for code review
2. After merge: Use DigitalOcean MCP: `get_app` to confirm auto-deploy (or Render MCP as alternative)
3. Use Vercel MCP: `list_deployments` to check admin console deploy
4. Use DigitalOcean MCP: `get_logs` to verify no errors

**Researching Implementation:**
1. Use Context7 MCP: `resolve-library-id` for library docs
2. Use Serena MCP: `find_symbol` to find existing patterns
3. Use GitHub MCP: `search_code` to find similar implementations

### MCP Configuration Files

**DO NOT commit:**
- `.mcp.json` - Contains API keys (gitignored)
- `.env.local` - Contains secrets (gitignored)

**Safe to commit:**
- `.env.example` - Template with MCP configuration section
- `.claude/mcp_settings.example.json` - Example MCP config (deprecated, use `.mcp.json`)
- And files not inside .gitignore
