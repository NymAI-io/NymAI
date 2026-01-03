# Launch Readiness Implementation Plan

**Version:** 1.0
**Created:** January 2, 2026
**Status:** Draft
**Related:** [project_spec.md](../project_spec.md), [ROADMAP.md](../vision/ROADMAP.md), [project_status.md](../memory/project_status.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Current State](#2-current-state)
3. [Remaining Tasks](#3-remaining-tasks)
4. [Implementation Steps](#4-implementation-steps)
5. [Testing Strategy](#5-testing-strategy)
6. [Zendesk Marketplace Submission](#6-zendesk-marketplace-submission)
7. [Success Metrics](#7-success-metrics)
8. [Risks & Mitigations](#8-risks--mitigations)

---

## 1. Overview

### Objective

Complete all remaining tasks to launch NymAI on the Zendesk Marketplace and onboard first beta customers.

### Scope

- **In Scope:**
  - Fix blocking build issues (tsconfig composite)
  - Zendesk sandbox E2E testing
  - Documentation (agent guide, admin guide, security overview)
  - Manual E2E testing checklist
  - Zendesk Marketplace submission
  - Beta customer onboarding (1-2 customers)

- **Out of Scope:**
  - New features beyond MVP
  - Automated CI/CD pipeline (deferred to post-launch)
  - SOC 2 certification (deferred to $100k+ MRR)

### Success Criteria

- ✅ All packages build successfully (`pnpm build` exits 0)
- ✅ All tests pass (`pnpm test` - 69 tests)
- ✅ E2E workflow validated in Zendesk sandbox
- ✅ Documentation complete and reviewed
- ✅ Zendesk Marketplace submission accepted
- ✅ 1-2 beta customers actively using NymAI

---

## 2. Current State

### What's Complete (MVP + Attachment Scanning)

| Component      | Status        | Notes                                        |
| -------------- | ------------- | -------------------------------------------- |
| @nymai/core    | ✅ Complete   | 57 tests passing, detection engine working   |
| @nymai/api     | ✅ Complete   | 12 tests passing, deployed to DigitalOcean   |
| admin          | ✅ Complete   | Deployed to Vercel (nymai-admin.vercel.app)  |
| @nymai/zendesk | ✅ Functional | OCR + redaction working, build issue pending |

### Blocking Issues

| Issue                    | Severity | Details                                                                                                                                     |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| tsconfig composite error | 🔴 High  | zendesk package fails `pnpm build` because @nymai/core needs `"composite": true` in tsconfig.json for TypeScript project references to work |

### Live Deployments

| Service     | URL                                        | Status             |
| ----------- | ------------------------------------------ | ------------------ |
| API         | https://nymai-api-dnthb.ondigitalocean.app | ✅ Healthy         |
| Admin       | https://nymai-admin.vercel.app             | ✅ Healthy         |
| Zendesk App | Local dev only                             | ⚠️ Needs build fix |

---

## 3. Remaining Tasks

### Week 11-12 Checklist (from project_spec.md)

| #   | Task                                        | Priority    | Est. Time | Status      |
| --- | ------------------------------------------- | ----------- | --------- | ----------- |
| 1   | Fix zendesk package build (composite: true) | 🔴 Blocking | 0.5 days  | ✅ Complete |
| 2   | Test with Zendesk sandbox account           | 🟡 High     | 1 day     | ⬜ Pending  |
| 3   | Write agent guide                           | 🟢 Medium   | 0.5 days  | ✅ Complete |
| 4   | Write admin guide                           | 🟢 Medium   | 0.5 days  | ✅ Complete |
| 5   | Write security overview (CISO-ready)        | 🟡 High     | 1 day     | ✅ Complete |
| 6   | End-to-end testing (manual checklist)       | 🟡 High     | 1 day     | ✅ Complete |
| 7   | Submit to Zendesk Marketplace               | 🔴 Critical | 0.5 days  | ⬜ Pending  |
| 8   | Beta with 1-2 friendly customers            | 🟡 High     | Ongoing   | ⬜ Pending  |

**Total Estimated Time:** 5-6 days

---

## 4. Implementation Steps

### Step 1: Fix TypeScript Build Issue (0.5 days)

**Problem:** The zendesk package uses TypeScript project references to import from `@nymai/core`. This requires the referenced project to have `"composite": true` in its tsconfig.

**Error:**

```
Referenced project 'packages/core/tsconfig.json' must have setting "composite": true
```

**Solution:**

**Update:** `packages/core/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true, // ADD THIS
    "declaration": true, // Required for composite
    "declarationMap": true, // Recommended for debugging
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Verification:**

```bash
# After fix, this should succeed:
pnpm run build

# Expected output:
# @nymai/core: Build successful
# @nymai/api: Build successful
# admin: Build successful
# @nymai/zendesk: Build successful  <-- Currently failing
```

**Side Effects to Check:**

- Ensure `dist/` folder structure unchanged
- Ensure package exports still work
- Run full test suite after change

---

### Step 2: Zendesk Sandbox E2E Testing (1 day)

**Prerequisites:**

- Zendesk sandbox account configured
- ZAF CLI installed (`npm install -g @zendesk/zcli`)
- Build issue fixed (Step 1)

**Setup:**

```bash
# Build zendesk app
cd packages/clients/zendesk
pnpm build

# Package for Zendesk
zcli apps:create

# Upload to sandbox
zcli apps:update --app-id=<app_id>
```

**Test Scenarios:**

| #   | Scenario            | Steps                                 | Expected Result                                         |
| --- | ------------------- | ------------------------------------- | ------------------------------------------------------- |
| 1   | Text detection      | Open ticket with SSN in comment       | Sidebar shows "⚠️ SSN detected (94%)"                   |
| 2   | Text redaction      | Click [Redact All]                    | Comment updated with `***-**-XXXX`, undo banner appears |
| 3   | Undo redaction      | Click [Undo] within 10s               | Original text restored                                  |
| 4   | Undo expiry         | Wait >10s                             | Undo button disappears, redaction permanent             |
| 5   | Detection-only mode | Enable in admin, reload sidebar       | Redact button hidden, shows read-only summary           |
| 6   | Attachment scan     | Upload image with SSN, click [Scan]   | OCR runs, findings displayed                            |
| 7   | Attachment redact   | Click [Redact & Upload]               | Black boxes over PII, new attachment uploaded           |
| 8   | Attachment undo     | Click [Undo] within 10s               | Original attachment accessible                          |
| 9   | Multiple PII types  | Comment with SSN + CC + email + phone | All 4 types detected and displayed                      |
| 10  | Empty ticket        | Ticket with no PII                    | Shows "No sensitive data detected"                      |
| 11  | Error handling      | Upload unsupported file (DOCX)        | Shows "Format not supported" message                    |

**Record Results:**

- Screenshots of each test case
- Note any failures or unexpected behavior
- Performance timing (scan time, redaction time)

---

### Step 3: Write Agent Guide (0.5 days)

**Create:** `docs/agent-guide.md`

**Outline:**

```markdown
# NymAI Agent Guide

## What is NymAI?

- Brief description of PII detection/redaction
- How it protects customer data

## Getting Started

- Where to find the sidebar
- Understanding the detection summary

## Detecting Sensitive Data

- What types are detected (SSN, CC, Email, Phone, DL)
- Understanding confidence scores
- Detection-only mode vs redaction mode

## Redacting Text

- One-click redaction
- Understanding masking (what agents see after redaction)
- The 10-second undo window

## Scanning Attachments

- Supported formats (PNG, JPG, WEBP, PDF)
- How to scan an attachment
- Understanding OCR limitations

## Redacting Attachments

- Preview before redaction
- Black box redaction
- Uploading redacted version

## FAQ

- "What if I accidentally redact something?"
- "Does NymAI see my ticket data?"
- "What happens to the original attachment?"
```

---

### Step 4: Write Admin Guide (0.5 days)

**Create:** `docs/admin-guide.md`

**Outline:**

```markdown
# NymAI Admin Guide

## Overview

- What NymAI does
- Admin vs Agent capabilities

## Installation

- Zendesk Marketplace installation
- Initial configuration

## Admin Console Access

- URL: https://nymai-admin.vercel.app
- Login with Google (Supabase OAuth)
- Workspace ID derivation from email domain

## Configuration

- Detection type toggles (SSN, CC, Email, Phone, DL)
- Mode selection (Detection-only vs Redaction)
- When to use each mode

## Viewing Logs

- What's logged (metadata only, no PII)
- Filtering by date range
- Exporting logs

## Dashboard

- Understanding detection statistics
- Data type breakdown
- Trends and insights

## Security

- Link to security overview
- Data handling practices
- Compliance information

## Support

- Contact information
- Troubleshooting common issues
```

---

### Step 5: Write Security Overview (1 day)

**Update:** `docs/vision/security_overview.md`

**Expand to be CISO-ready with:**

```markdown
# NymAI Security Overview

## Executive Summary

- One-paragraph overview for executives

## Architecture

- Diagram showing data flow
- Ephemeral processing explanation

## Data Handling

### What We Process

- Ticket text (in memory <500ms)
- Attachment images (client-side only)

### What We Store

- Metadata only (ticket IDs, data types, timestamps)
- NO raw PII ever stored

### What We Never Do

- Store raw ticket text
- Store attachment contents
- Send images to our servers
- Train models on customer data
- Log request/response bodies

## Encryption

- In transit: TLS 1.3
- At rest: AES-256 (Supabase)

## Authentication & Authorization

- Zendesk OAuth for API access
- Supabase Auth for admin console
- Role-based access (Agent vs Admin)

## Infrastructure

- DigitalOcean App Platform (API)
- Vercel (Admin Console)
- Supabase (Database)
- All SOC 2 Type II certified providers

## Compliance

### Current

- GDPR-ready (no personal data storage)
- CCPA-compliant
- MVSP controls aligned

### Roadmap

- SOC 2 Type II (planned at $100k+ MRR)
- HIPAA BAA (available on request)

## Incident Response

- 24-hour notification commitment
- Contact: security@nymai.com

## Penetration Testing

- Schedule and results (once conducted)

## Vendor Security

- Supabase: SOC 2 Type II
- DigitalOcean: SOC 2 Type II, ISO 27001
- Vercel: SOC 2 Type II

## Contact

- Security questions: security@nymai.com
- DPA requests: legal@nymai.com
```

---

### Step 6: Manual E2E Testing Checklist (1 day)

**Create:** `docs/e2e-testing-checklist.md`

**Checklist:**

```markdown
# NymAI E2E Testing Checklist

**Tester:** **\*\***\_\_\_**\*\***
**Date:** **\*\***\_\_\_**\*\***
**Environment:** ☐ Sandbox ☐ Production

## Pre-Test Setup

- [ ] API server healthy (GET /health returns 200)
- [ ] Admin console accessible
- [ ] Zendesk app installed in sandbox
- [ ] Test account has agent permissions

## Text Detection Tests

| Test            | Steps                                     | Pass/Fail | Notes |
| --------------- | ----------------------------------------- | --------- | ----- |
| SSN Detection   | Add comment with "123-45-6789"            | ☐         |       |
| CC Detection    | Add comment with "4111111111111111"       | ☐         |       |
| Email Detection | Add comment with "test@example.com"       | ☐         |       |
| Phone Detection | Add comment with "(555) 123-4567"         | ☐         |       |
| Multiple PII    | Add comment with all 4 types              | ☐         |       |
| No PII          | Add comment with "Hello, how can I help?" | ☐         |       |

## Text Redaction Tests

| Test              | Steps                               | Pass/Fail | Notes |
| ----------------- | ----------------------------------- | --------- | ----- |
| Redact All        | Click [Redact All] with PII present | ☐         |       |
| Undo (within 10s) | Click [Undo] immediately            | ☐         |       |
| Undo Expiry       | Wait >10s, verify undo gone         | ☐         |       |
| Verify Masking    | Check SSN shows **\*-**-XXXX        | ☐         |       |

## Attachment Tests

| Test               | Steps                       | Pass/Fail | Notes |
| ------------------ | --------------------------- | --------- | ----- |
| PNG Scan           | Upload PNG with SSN, scan   | ☐         |       |
| JPG Scan           | Upload JPG with email, scan | ☐         |       |
| PDF Scan           | Upload PDF with CC, scan    | ☐         |       |
| Redact Attachment  | Scan then redact            | ☐         |       |
| Attachment Undo    | Undo within 10s             | ☐         |       |
| Unsupported Format | Upload DOCX, verify error   | ☐         |       |

## Admin Console Tests

| Test             | Steps                    | Pass/Fail | Notes |
| ---------------- | ------------------------ | --------- | ----- |
| Login            | Sign in with Google      | ☐         |       |
| Dashboard Load   | Verify stats display     | ☐         |       |
| Toggle Detection | Disable SSN, verify      | ☐         |       |
| Change Mode      | Switch to detection-only | ☐         |       |
| View Logs        | Load logs page           | ☐         |       |

## Performance Tests

| Metric                    | Target | Actual   | Pass/Fail |
| ------------------------- | ------ | -------- | --------- |
| Text detection time       | <500ms | \_\_\_ms | ☐         |
| Text redaction time       | <5s    | \_\_\_s  | ☐         |
| Attachment OCR time       | <15s   | \_\_\_s  | ☐         |
| Attachment redaction time | <3s    | \_\_\_s  | ☐         |

## Security Verification

| Check                  | Method                        | Pass/Fail | Notes |
| ---------------------- | ----------------------------- | --------- | ----- |
| No PII in network logs | DevTools Network tab          | ☐         |       |
| No PII in console logs | DevTools Console              | ☐         |       |
| Memory cleared         | Heap snapshot after redaction | ☐         |       |

## Sign-Off

- [ ] All critical tests pass
- [ ] Performance targets met
- [ ] No security issues found

**Approved for Marketplace submission:** ☐ Yes ☐ No

**Signed:** **\*\***\_\_\_**\*\*** **Date:** **\*\***\_\_\_**\*\***
```

---

### Step 7: Zendesk Marketplace Submission (0.5 days)

**Prerequisites:**

- All tests pass
- Documentation complete
- Build successful

**Submission Checklist:**

| #   | Item                                   | Status |
| --- | -------------------------------------- | ------ |
| 1   | App icon (128x128 PNG)                 | ⬜     |
| 2   | App screenshots (1280x800, 3-5 images) | ⬜     |
| 3   | Short description (80 chars)           | ⬜     |
| 4   | Long description (1000 chars)          | ⬜     |
| 5   | Installation instructions              | ⬜     |
| 6   | Support email                          | ⬜     |
| 7   | Privacy policy URL                     | ⬜     |
| 8   | Terms of service URL                   | ⬜     |
| 9   | Package built and validated            | ⬜     |
| 10  | Submitted via Partner Portal           | ⬜     |

**Marketing Copy:**

**Short Description:**

```
Detect and redact sensitive data (SSN, CC, email) in tickets. Privacy-first, no data stored.
```

**Long Description:**

```
NymAI helps support teams protect customer privacy by detecting and
redacting sensitive information in Zendesk tickets.

✓ One-click PII detection (SSN, credit cards, emails, phones)
✓ Agent-initiated redaction with 10-second undo
✓ Attachment scanning with client-side OCR
✓ Privacy-first: raw data never stored, processed in memory only
✓ Admin dashboard for configuration and audit logs

Perfect for teams handling sensitive customer data who need to
reduce breach liability without slowing down support workflows.
```

**Submission Process:**

1. Log into Zendesk Partner Portal
2. Navigate to Apps > Submit New App
3. Upload package (`zcli apps:package`)
4. Fill in marketing details
5. Submit for review
6. Expected review time: 5-10 business days

---

### Step 8: Beta Customer Onboarding (Ongoing)

**Target:** 1-2 friendly customers within 2 weeks of Marketplace approval

**Ideal Beta Customer Profile:**

- 10-50 agents
- Handles sensitive data (financial, healthcare, legal)
- Willing to provide feedback
- Not mission-critical (tolerant of early bugs)

**Onboarding Checklist (per customer):**

| #   | Task                               | Owner    | Status |
| --- | ---------------------------------- | -------- | ------ |
| 1   | Intro call (demo + expectations)   | Founder  | ⬜     |
| 2   | Install NymAI from Marketplace     | Customer | ⬜     |
| 3   | Configure settings together        | Founder  | ⬜     |
| 4   | Train 2-3 agents                   | Founder  | ⬜     |
| 5   | Week 1 check-in                    | Founder  | ⬜     |
| 6   | Week 2 feedback call               | Founder  | ⬜     |
| 7   | Collect testimonial (if satisfied) | Founder  | ⬜     |

**Feedback Collection:**

- Weekly 15-min calls
- In-app feedback widget (future)
- Email support@ for issues

---

## 5. Testing Strategy

### Automated Tests (Already Complete)

| Package     | Tests | Status       |
| ----------- | ----- | ------------ |
| @nymai/core | 57    | ✅ Passing   |
| @nymai/api  | 12    | ✅ Passing   |
| Total       | 69    | ✅ All green |

### Manual E2E Tests (Step 6)

Run full checklist before:

- Marketplace submission
- Any production deployment
- Major version releases

### Regression Testing

After any code change:

1. `pnpm test` — all 69 tests pass
2. `pnpm build` — all 4 packages build
3. `pnpm lint` — no errors

---

## 6. Zendesk Marketplace Submission

### Requirements

| Requirement        | Status | Notes                      |
| ------------------ | ------ | -------------------------- |
| Functional app     | ✅     | Core features working      |
| No breaking errors | ⬜     | Need build fix             |
| Documentation      | ⬜     | Agent/admin guides pending |
| Privacy policy     | ⬜     | Need to create             |
| Support contact    | ✅     | support@nymai.com          |
| Marketing assets   | ⬜     | Screenshots, icon pending  |

### Timeline

| Milestone                | Target Date | Status |
| ------------------------ | ----------- | ------ |
| Build fix complete       | Day 1       | ⬜     |
| E2E testing complete     | Day 2-3     | ⬜     |
| Documentation complete   | Day 3-4     | ⬜     |
| Marketing assets ready   | Day 4       | ⬜     |
| Submission               | Day 5       | ⬜     |
| Review (Zendesk)         | Day 5-15    | ⬜     |
| Approval                 | Day 15      | ⬜     |
| Beta customers onboarded | Day 15-30   | ⬜     |

---

## 7. Success Metrics

### Technical Metrics

| Metric         | Target | How to Measure         |
| -------------- | ------ | ---------------------- |
| Build success  | 100%   | `pnpm build` exit code |
| Test pass rate | 100%   | `pnpm test` results    |
| E2E test pass  | 100%   | Manual checklist       |
| API uptime     | >99.5% | DigitalOcean metrics   |

### Business Metrics

| Metric                | Target      | How to Measure       |
| --------------------- | ----------- | -------------------- |
| Marketplace approval  | ✅          | Zendesk confirmation |
| Beta customers        | 2           | Signed up + active   |
| Weekly redactions     | 10/customer | Supabase logs        |
| Customer satisfaction | ≥4/5        | Feedback calls       |

---

## 8. Risks & Mitigations

### Technical Risks

| Risk                                  | Probability | Impact | Mitigation                             |
| ------------------------------------- | ----------- | ------ | -------------------------------------- |
| Build fix breaks other packages       | Low         | High   | Run full test suite after fix          |
| Sandbox behaves differently than prod | Medium      | Medium | Test in prod-like environment          |
| Marketplace rejection                 | Low         | High   | Follow all guidelines, test thoroughly |

### Business Risks

| Risk                        | Probability | Impact | Mitigation                          |
| --------------------------- | ----------- | ------ | ----------------------------------- |
| No beta customers           | Medium      | High   | Prepare outreach list before launch |
| Negative early feedback     | Medium      | Medium | Set expectations, iterate quickly   |
| Competitor launches similar | Low         | Medium | Focus on privacy-first positioning  |

### Timeline Risks

| Risk                       | Probability | Impact | Mitigation                     |
| -------------------------- | ----------- | ------ | ------------------------------ |
| Marketplace review delayed | Medium      | Medium | Submit early, have buffer time |
| Documentation takes longer | Medium      | Low    | Timebox to 0.5 days per doc    |
| Build fix more complex     | Low         | High   | Escalate early if stuck        |

---

## 9. Next Steps

1. **Immediate (Today):**
   - [ ] Fix tsconfig composite issue (Step 1)
   - [ ] Verify build succeeds

2. **This Week:**
   - [ ] Complete Zendesk sandbox testing (Step 2)
   - [ ] Write agent guide (Step 3)
   - [ ] Write admin guide (Step 4)

3. **Next Week:**
   - [ ] Finalize security overview (Step 5)
   - [ ] Run full E2E checklist (Step 6)
   - [ ] Submit to Marketplace (Step 7)

4. **Post-Submission:**
   - [ ] Prepare beta customer outreach
   - [ ] Monitor for Marketplace feedback
   - [ ] Begin onboarding first customers

---

**End of Implementation Plan**

_Last Updated: January 2, 2026_
_Status: Draft - Ready for Implementation_
