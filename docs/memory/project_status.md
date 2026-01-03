# Project Status

> Last updated: 2026-01-02

## Current Phase: MVP Enhancement

The NymAI MVP core is complete. Detection capabilities have been significantly enhanced with 7 new patterns and historical comment scanning. Attachment scanning is also complete.

---

## Milestone Progress

### MVP (v0.1.0) - 100% Complete

| Component       | Status | Tests         | Notes                               |
| --------------- | ------ | ------------- | ----------------------------------- |
| @nymai/core     | Done   | 91/91 passing | 12 PII patterns supported           |
| @nymai/api      | Done   | 12/12 passing | All endpoints functional            |
| Admin Console   | Done   | Builds        | Needs Supabase config for auth      |
| Zendesk Sidebar | Done   | Builds        | Shows loading state outside Zendesk |
| Database Schema | Done   | Applied       | 3 migrations in Supabase            |
| Monorepo Setup  | Done   | -             | pnpm workspaces configured          |

### Post-MVP (In Progress)

| Component               | Status       | Notes                                                               |
| ----------------------- | ------------ | ------------------------------------------------------------------- |
| Production Deployment   | Complete     | API + Admin live                                                    |
| **Attachment Scanning** | **Complete** | **Client-side OCR with Tesseract.js, canvas redaction implemented** |
| **Detection Engine**    | **Complete** | **Enhanced with 7 new patterns + multi-comment scanning**           |
| Zendesk Marketplace     | Pending      | Submission required                                                 |
| E2E Testing             | Pending      | Sandbox testing                                                     |

**Detection Enhancement Sub-Tasks:**
| Task | Status | Notes |
|------|--------|-------|
| Pattern Expansion | Complete | Added DOB, PASSPORT, BANK, ROUTING, IP, MEDICARE, ITIN |
| Validation | Complete | ABA checksum implemented |
| Historical Scanning | Complete | Scans all public comments (capped at 20) |
| UI Updates | Complete | Findings grouped by comment ID |
| Testing | Complete | 91/91 core tests passing |

**Attachment Scanning Sub-Tasks:**
| Task | Status | Notes |
|------|--------|-------|
| Technical research | Complete | Tesseract.js v6.0.1 selected |
| Documentation updates | Complete | ROADMAP, project_spec, architecture updated |
| Implementation | Complete | All components, hooks, services implemented |
| Code quality | Complete | All ESLint errors resolved |
| Testing | Complete | Manual testing passed, ready for E2E |

**Other Post-MVP Items:**
| Feature | Priority | Status |
|---------|----------|--------|
| AI/ML Classification | Low | Out of scope |

---

## Test Results

### Core Detection Engine

```
 PASS  src/detection/detection.test.ts
 PASS  src/detection/luhn.test.ts
 PASS  src/redaction/redaction.test.ts

 Test Files  3 passed (3)
 Tests       91 passed (91)
```

**Accuracy Metrics:**

- SSN: 90%+ precision
- Credit Card: 95%+ precision (with Luhn validation)
- Email: 98%+ precision
- Phone: 85%+ precision
- Driver's License: 70%+ precision
- **NEW:** DOB, Passport, Bank Account, Routing (ABA check), IP, Medicare, ITIN

### API Server

```
 PASS  src/routes/detect.test.ts
 PASS  src/routes/redact.test.ts

 Test Files  2 passed (2)
 Tests       12 passed (12)
```

---

## What's Working

**Detection:**

- **12 PII types** detected with target accuracy
- **Historical scanning:** Scans all public comments in a ticket
- Credit card Luhn validation working
- ABA routing number validation working
- Masking preserves last 4 digits for context

**API:**

- Health check endpoint responding
- Detection endpoint returns findings
- Redaction endpoint returns masked text
- Settings and logs endpoints functional
- Auth middleware validates workspace ID

**Admin Console:**

- Builds and serves locally
- Login screen displays
- Protected routes work
- Dashboard, Settings, Logs pages render

**Zendesk Sidebar:**

- Builds and serves locally
- Loading state displays correctly
- Component structure complete
- ZAF hooks implemented
- **Multi-comment redaction** supported

**Database:**

- Schema applied via Supabase MCP
- RLS policies in place
- Tables: `workspace_configs`, `metadata_logs`

**Attachment Scanning:**

- Client-side OCR using Tesseract.js v6.0.1 (browser-based)
- PDF.js v3.11.174 integration for PDF rendering
- Supported formats: PNG, JPG/JPEG, WEBP, PDF
- Canvas-based redaction with black box overlays
- Sliding window algorithm for PII region matching
- Visual preview with PII highlighting (red boxes, semi-transparent fill)
- Zoom controls (50% - 300%) for detailed inspection
- Progress tracking with stage indicators
- 10-second undo window for attachment redactions
- All lint errors resolved (0 errors, 0 warnings)
- Critical runtime bug fixed (undefined client variable)

---

## Known Issues

| Issue                            | Severity | Workaround              |
| -------------------------------- | -------- | ----------------------- |
| Zendesk app needs iframe context | Expected | Test in Zendesk sandbox |

**Resolved Issues:**

- ✓ API env vars configured on DigitalOcean
- ✓ Admin Supabase config deployed to Vercel
- ✓ CORS configured for production domains
- ✓ Settings page error fixed - Supabase env vars properly configured

---

## Environment Requirements

**Local Development:**

```bash
# Required environment variables
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=...  # (Note: not SUPABASE_SERVICE_KEY - use SECRET_KEY)
ZENDESK_CLIENT_ID=...
ZENDESK_CLIENT_SECRET=...
```

**Production (Deployed):**

| Service       | URL                                        | Status  |
| ------------- | ------------------------------------------ | ------- |
| API Server    | https://nymai-api-dnthb.ondigitalocean.app | Live    |
| Admin Console | https://nymai-admin.vercel.app             | Live    |
| Database      | Supabase PostgreSQL                        | Active  |
| Auth          | Google OAuth via Supabase                  | Enabled |

**Deployment Platforms:**

- API: DigitalOcean App Platform (basic plan, $5/mo - student credits)
  - Alternative: Render (starter plan, $7/mo)
- Admin: Vercel (free tier)
- Database: Supabase (free tier)

---

## Next Steps

### Immediate (Before Launch)

- [x] Deploy API to DigitalOcean App Platform ([nymai-api-dnthb.ondigitalocean.app](https://nymai-api-dnthb.ondigitalocean.app))
- [x] Deploy Admin Console to Vercel ([nymai-admin.vercel.app](https://nymai-admin.vercel.app))
- [x] Enable Google OAuth via Supabase Auth
- [x] Configure CORS for production domains
- [ ] Configure Zendesk App manifest with production URLs
- [ ] Deploy Zendesk App to Zendesk Sandbox
- [ ] Submit to Zendesk Marketplace

### Future Enhancements

1. [x] **Attachment Scanning Implementation** - Client-side OCR integration (Tesseract.js)
   - [x] Add [Scan Attachment] button to Zendesk sidebar
   - [x] Integrate Tesseract.js worker in browser
   - [x] Implement OCR progress indicator
   - [x] Add OCR findings display in sidebar
   - [x] Handle OCR errors and edge cases
   - [x] Canvas-based redaction with black box overlays
   - [x] Visual preview with zoom controls
   - [x] 10-second undo window for attachment redactions
2. [x] **Detection Enhancement (DETECTION_ENHANCEMENT_PLAN.md)**
   - [x] Phase 1: Add 7 new patterns (DOB, PASSPORT, BANK_ACCOUNT, ROUTING, IP_ADDRESS, MEDICARE, ITIN)
   - [x] Phase 2: Historical scanning - scan ALL comments, not just latest
3. [ ] Performance optimization for large tickets
4. [ ] Batch redaction history export
5. [ ] Custom masking patterns per workspace

---

## Architecture Decisions

| Decision      | Choice    | Rationale                                         |
| ------------- | --------- | ------------------------------------------------- |
| API Framework | Hono      | Lightweight, platform-agnostic, TypeScript-first  |
| Database      | Supabase  | Free tier, RLS, Auth included                     |
| UI Components | Shadcn/ui | Copy-paste, no vendor lock-in                     |
| Testing       | Vitest    | Fast, ESM-native, great DX                        |
| Monorepo      | pnpm      | Efficient disk usage, strict mode                 |
| Detection     | Regex     | Simple, no ML complexity, auditable               |
| Concurrency   | Inline    | Zero-dep queue for API calls, simple maintainance |

---

## References

- [Architecture](./architecture.md) - System design details
- [Changelog](./changelog.md) - Version history
- [Project Spec](../project_spec.md) - Technical specification
