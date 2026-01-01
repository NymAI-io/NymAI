# ROADMAP.md

**Version:** 2.0 (Bootstrapped Path)  
**Last Updated:** December 30, 2025  
**Related Documents:** [VISION.md](./VISION.md), [ADMIN.md](./ADMIN.md), [project_spec.md](./project_spec.md)

---

## Table of Contents

1. [Business Context](#1-business-context)
2. [Guiding Principles](#2-guiding-principles)
3. [Step 2: Zendesk MVP & Growth](#3-step-2-zendesk-mvp--growth-months-0-12)
4. [Decision Gate: Step 2 → Step 3](#4-decision-gate-step-2--step-3)
5. [Step 3: Optional Expansion](#5-step-3-optional-expansion-months-12-24)
6. [Explicit Non-Goals](#6-explicit-non-goals)
7. [Failure Modes & Responses](#7-failure-modes--responses)
8. [Skills & Resources](#8-skills--resources)
9. [Document Maintenance](#9-document-maintenance)
10. [Appendix: Step 4 Reference](#appendix-step-4-reference-not-pursuing)

---

## 1. Business Context

### Stairstep Position

NymAI follows Rob Walling's Stairstep Method:

| Step | Description | NymAI Status |
|------|-------------|--------------|
| Step 1 | One-time product; learn to ship | ✅ Complete |
| **Step 2** | First SaaS; single surface; niche | 🎯 **Current Focus** |
| Step 3 | Expanded SaaS; multi-surface | ⏳ Optional (at $30k MRR) |
| Step 4 | VC-backed platform | ❌ Not pursuing |

### What This Means for the Roadmap

| Dimension | Our Approach |
|-----------|--------------|
| **Funding** | Bootstrapped (no VC) |
| **Team** | Solo founder; contractors as needed |
| **Scope** | Zendesk only (Step 2) |
| **Revenue Target** | $30k–$50k MRR |
| **Timeline** | 12 months to Step 2 complete |
| **Expansion** | Step 3 only if Step 2 succeeds |

### Reading This Document

- **Step 2 (Sections 3-4):** This is the committed roadmap. Execute this.
- **Step 3 (Section 5):** Optional expansion. Read for context, but don't build until Step 2 is complete.
- **Appendix (Step 4):** Reference only. We are NOT pursuing this.

---

## 2. Guiding Principles

1. **Zendesk only until $30k MRR**
   - No distractions. No "quick" additions. One surface, one buyer, one problem.

2. **Revenue over features**
   - Ship what customers pay for. Cut features that don't drive revenue.

3. **Core-first architecture**
   - `@nymai/core` is the product; Zendesk is the first client.
   - Build the engine to be portable, even if we only use one surface.

4. **Ephemeral & local by default**
   - No raw content stored; this is our moat.

5. **Solo founder reality**
   - Every feature has maintenance cost. Minimize surface area.
   - Prefer simple solutions that work over complex solutions that impress.

---

## 3. Step 2: Zendesk MVP & Growth (Months 0-12)

### 3.1 Overview

| Dimension | Target |
|-----------|--------|
| **Surface** | Zendesk only |
| **Revenue** | $30k–$50k MRR |
| **Customers** | 30–50 paying workspaces |
| **Timeline** | 12 months |
| **Team** | Solo |

### 3.2 Phase 0: Foundation & MVP (Months 0-3)

**Objective:** Ship a working Zendesk app that proves the detection/redaction engine works.

**Timeline:** ~8-10 weeks  
**Revenue Target:** $0–$500 MRR (validation)

#### Product Scope

**Zendesk App (Ticket Sidebar):**
- Detection summary: list of detected items per ticket (SSN, CC, email, phone, DL)
- Agent-initiated `[Redact All]` with 10-second undo
- Detection-only mode (no redaction controls)

**Admin Console (Web):**
- Workspace-level configuration:
  - Toggle detection types (SSN, CC, email, phone, DL)
  - Mode: `detection` vs `redaction`
- Log viewer:
  - Ticket ID, data types, action, timestamp
- Simple detection summary dashboard

**Backend API:**
- `/api/redact` – detection + masking, Zendesk comment update, metadata logging
- `/api/detect` – detection-only, no mutation
- `/api/logs` – paginated log retrieval for admin console
- `/api/settings` – workspace settings CRUD
- Strict ephemeral guarantees (no raw text stored)

#### Technical Scope

> **Reference:** See [project_spec.md](./project_spec.md) for detailed technical specification.

**Monorepo:**
- pnpm workspaces
- Packages:
  - `@nymai/core` – regex-based detection + redaction
  - `@nymai/api` – Hono API server + Zendesk adapter
  - `packages/clients/zendesk` – ZAF app
  - `packages/admin` – React/Vite SPA console

**Infrastructure:**
- API on Render (Starter, $7/mo)
- Supabase for metadata/logs ($25/mo)
- Admin console on Vercel (free tier)
- **Total MVP Cost:** ~$32/month

#### Phase 0 Success Criteria

| Category | Metric | Target |
|----------|--------|--------|
| **Performance** | Redaction completes | <5s p95 |
| **Accuracy** | Detection precision (SSN/CC) | ≥90% |
| **Accuracy** | Detection precision (email/phone) | ≥85% |
| **Adoption** | Workspaces installed | ≥3 (beta or paid) |
| **Usage** | Redactions per customer | ≥10/week average |

**Exit Criteria:**
- If precision or UX is weak → Stay in Phase 0 and iterate
- If 3+ customers use it regularly → Move to Phase 1

---

### 3.3 Phase 1: Growth & Hardening (Months 3-12)

**Objective:** Reach $30k MRR with a repeatable sales motion.

**Timeline:** Months 3-12  
**Revenue Target:** $30k–$50k MRR

#### Product Enhancements

**Zendesk App:**
- Polished sidebar UX (clear severity indicators, better error states)
- Improved undo UX and error handling
- More detection patterns (tuned for real-world data)

**Admin Console:**
- Better dashboards (per-agent and per-queue statistics)
- Exportable reports (CSV/PDF for compliance reviews)
- More granular toggles (per-group or per-form)

**Security/Compliance:**
- Polished security overview document
- Draft DPA template for enterprise requests
- Basic access controls (multi-admin support)

#### Bootstrapped Milestones

| Milestone | Target | Timeline |
|-----------|--------|----------|
| MVP launched | Working Zendesk app | Month 2 |
| First paying customer | $299-$499 MRR | Month 3 |
| Validation | 10 paying customers | Month 4 |
| Traction | $5k MRR (~12 customers) | Month 6 |
| Momentum | $15k MRR (~35 customers) | Month 9 |
| **Step 2 Complete** | **$30k MRR (~60 customers)** | **Month 12** |

#### Monthly Revenue Trajectory

| Month | MRR Target | Customers | ARPU |
|-------|------------|-----------|------|
| 3 | $499 | 1-2 | $299-$499 |
| 4 | $3k | 6-8 | $400-$450 |
| 6 | $5k | 10-12 | $400-$500 |
| 9 | $15k | 30-35 | $450-$500 |
| 12 | $30k | 55-65 | $480-$520 |

#### Phase 1 Success Criteria

| Category | Metric | Minimum Target |
|----------|--------|----------------|
| **Revenue** | MRR | $30k |
| **Customers** | Paying workspaces | 60 |
| **ARPU** | Average revenue per customer | ~$500 |
| **Retention** | Monthly churn | <5% |
| **Quality** | Customer references | 5+ willing to provide testimonial |
| **Product** | Detection precision | ≥90% |

**Exit Criteria (Step 2 → Step 3 Decision):**
- $30k MRR sustained for 3+ months
- ~60 paying customers
- Monthly churn <5%
- Support burden <10 hrs/week
- Personal decision: Do I want to expand?

---

### 3.4 Pricing (Step 2)

| Tier | Agents | Price | Target |
|------|--------|-------|--------|
| **Starter** | Up to 15 | $299/month | Small teams (10-15 agents) |
| **Growth** | Up to 40 | $499/month | Sweet spot (20-40 agents) |
| **Scale** | Up to 75 | $799/month | Upper limit (40-60 agents) |

**Notes:**
- No free tier (trials only)
- No enterprise tier (refer 75+ agent companies to competitors)
- Annual discount: 2 months free (17% off)
- **$499 is the target ARPU** — under $500/month means credit card purchases

**The Math:**
- Target: 60 customers × $499 average = $30k MRR
- Why this works: Credit card sales, 2-week cycles, no SOC 2

---

### 3.5 Distribution & Sales (Step 2)

**Primary Channel:** Zendesk Marketplace
- Built-in distribution to target buyers
- Low effort; high quality leads

**Secondary Channel:** Cold Outreach
- 50-100 emails/week to CISOs at B2B SaaS companies
- Focus on companies with 20-200 Zendesk agents
- Use Discord breach as hook

**Tertiary Channel:** Content Marketing
- Blog posts on Zendesk security
- Case studies with early customers
- Security community presence (r/infosec, HN)

**Sales Motion:**
```
Marketplace discovery OR cold email
    ↓
14-day free trial (detection-only)
    ↓
Self-serve upgrade OR 30-min call
    ↓
Paid conversion ($500–$2k/mo)
```

**What We're NOT Doing:**
- Enterprise sales (6-month cycles)
- Custom contracts
- SOC 2 certification (unless customer pays for it)
- Conference sponsorships

---

### 3.6 Architectural Preparation (For Future Portability)

Even though we're Zendesk-only, build the engine to be portable:

- `@nymai/core` remains:
  - Platform-agnostic
  - Zero/low dependency
  - Pure functions (`detect`, `redact`) with clean types

- Zendesk-specific logic isolated:
  - `services/zendesk.ts` (not in core)
  - API routes under `/zendesk` namespace

**Why?** If Step 3 happens, the core engine is ready. If Step 3 never happens, the clean architecture still makes the codebase maintainable.

---

## 4. Decision Gate: Step 2 → Step 3

At $30k MRR sustained for 3+ months, explicitly decide:

### Option A: Stay at Step 2 (Lifestyle)

| Metric | Value |
|--------|-------|
| Annual income | $360k–$600k/year |
| Work required | ~20-30 hrs/week (maintenance) |
| Stress level | Low |
| Exit option | Sell for $1–2M when ready |

**Choose this if:** You're happy with the income and don't want to grow complexity.

### Option B: Sell

| Metric | Value |
|--------|-------|
| Likely valuation | 3-5x ARR ($1–2M) |
| Buyers | Micro-PE (XO Capital, SureSwift, etc.) |
| Timeline | 3-6 months to close |

**Choose this if:** You want to move on to something else.

### Option C: Expand to Step 3

| Metric | Value |
|--------|-------|
| Target MRR | $100k–$200k |
| Additional surfaces | VS Code, CLI, MCP, Chrome |
| Team | Solo + 1-2 contractors |
| Timeline | 12 more months |
| Exit option | Sell for $3–6M |

**Choose this if:** You want to grow AND have validated demand from existing customers.

### Step 3 Expansion Criteria

**Expand ONLY when ALL of these are true:**

| Criterion | Threshold |
|-----------|-----------|
| Zendesk MRR | ≥$30k sustained (3+ months) |
| Monthly churn | <5% |
| Support burden | <10 hrs/week |
| Customer demand | Existing customers asking for dev tools |
| Personal readiness | Want to grow (not just income) |

---

## 5. Step 3: Optional Expansion (Months 12-24)

> ⚠️ **Important:** This section is for reference only. Do NOT build any of this until Step 2 is complete ($30k MRR sustained) and you've explicitly decided to expand.

### 5.1 Overview

| Dimension | Target |
|-----------|--------|
| **Surfaces** | Zendesk + VS Code + CLI + MCP + Chrome |
| **Revenue** | $100k–$200k MRR |
| **Timeline** | Months 12-24 |
| **Team** | Solo + 1-2 contractors |

### 5.2 Priority Order (If Expanding)

| Priority | Surface | Effort | Revenue Potential |
|----------|---------|--------|-------------------|
| 1 | **VS Code Extension** | Medium | $20-40k MRR |
| 2 | **CLI** | Low (shares code with VS Code) | Bundled with VS Code |
| 3 | **MCP Server** | Medium | $10-20k MRR (enterprise) |
| 4 | **Chrome Extension** | Medium | $10-20k MRR (enterprise) |

### 5.3 VS Code Extension + CLI

**Goal:** Unified secrets + PII detection in the IDE, with local processing.

**Product Scope:**
- VS Code Extension:
  - On-demand commands ("Scan file", "Redact selection")
  - Diagnostics (underline detected PII/secrets)
  - Quick-fix to redact or ignore
  - Local-only by default

- CLI:
  - `nymai detect <file|dir>` – print findings
  - `nymai redact <file> --out redacted.txt`
  - Pre-commit hook integration

**Pricing:**
- Free: Detection only (local)
- Pro: $50–$100/month per team (enforcement, team dashboard)

**Why This First?**
- Shares `@nymai/core` engine
- PLG distribution (VS Code Marketplace, npm)
- Different buyer than Zendesk = diversified revenue

### 5.4 MCP Server

**Goal:** AI agent guardrails with sub-10ms latency.

**Product Scope:**
- MCP server exposing:
  - `detect_pii` – scans text, returns findings
  - `redact_pii` – returns redacted text
- Local processing (no cloud dependency)
- Example integrations (Claude Desktop, custom agents)

**Pricing:**
- Free: Basic detection
- Enterprise: Custom pricing for high-volume deployments

**Why Include?**
- First-mover opportunity (6-12 month window)
- Same `@nymai/core` engine
- Strategic positioning for AI safety market

### 5.5 Chrome Extension

**Goal:** Clipboard/paste protection for developers.

**Product Scope:**
- Clipboard guardian (detect PII before paste)
- Form scanner (highlight PII in inputs)
- Two-tier: Free (SSN+CC only) / Enterprise (all types, MDM)

**Pricing:**
- Free: Awareness / lead gen
- Enterprise: Bundled ($5-10/user/month)

### 5.6 Step 3 Success Criteria

| Category | Metric | Target |
|----------|--------|--------|
| **Revenue** | Combined MRR | $100k+ |
| **VS Code** | Installs | 1,000+ |
| **VS Code** | Weekly active devs | 100+ |
| **MCP** | Production deployments | 20+ |
| **Chrome** | Free installs | 2,000+ |

### 5.7 Step 3 Exit Options

At $100k+ MRR:
- **Lifestyle:** $1.2–$2.4M/year income
- **Sell:** $3–6M to PE or strategic buyer
- **Raise (Optional):** Convert to C-Corp, raise seed, pursue Step 4

---

## 6. Explicit Non-Goals

To maintain focus, the following are **explicitly out of scope**:

### Not Doing (Step 2)

| Non-Goal | Rationale |
|----------|-----------|
| Intercom/Freshdesk integration | Dilutes Zendesk focus |
| VS Code/CLI/MCP | Step 3 scope only |
| Chrome Extension | Step 3 scope only |
| Enterprise sales team | Solo founder; self-serve only |
| SOC 2 certification | Cost ($30k+) not justified until $100k+ MRR |
| HIPAA BAA | Requires SOC 2 first |
| Custom contracts | Refer to competitors instead |

### Not Doing (Step 3 — Even If Expanding)

| Non-Goal | Rationale |
|----------|-----------|
| Slack/Teams integration | Requires enterprise sales |
| Salesforce integration | Complex; different buyer |
| GitHub integration | GitGuardian entrenched |
| Jira/Confluence | Enterprise Atlassian sales |
| ML/NLP detection | Regex is sufficient for PMF |
| Attachment scanning | Complex; deferred indefinitely |
| Self-hosted deployment | Enterprise scope only |

### Never Doing (Step 4 Scope)

| Non-Goal | Rationale |
|----------|-----------|
| VC funding | Misaligned with bootstrapped path |
| C-Corp conversion | Only if selling to PE that requires it |
| Enterprise bundle ($10k+/mo) | Requires sales team |
| Multi-surface platform | Requires VC scale |
| Prosumer Chrome tier ($3-5/mo) | Support burden not worth it |

---

## 7. Failure Modes & Responses

### 7.1 Step 2 Failure Modes

| Failure Mode | Signal | Response |
|--------------|--------|----------|
| **Can't get first customers** | <3 trials after Month 2 | Revisit positioning; try direct outreach vs. Marketplace |
| **Low conversion** | <20% trial-to-paid | Improve onboarding; add detection-only free tier |
| **High churn** | >10% monthly | Interview churned customers; fix product gaps |
| **Zendesk ADPP improves** | Ephemeral mode or more patterns | Accelerate messaging on "all data, not just new" |
| **Support burden too high** | >15 hrs/week at $15k MRR | Automate; improve docs; raise prices |
| **Competitor enters SMB** | Nightfall or Strac launches SMB tier | Compete on ephemeral + price; consider pivot to dev tools |

### 7.2 Native Vendor Monitoring

**Risk:** Zendesk ADPP improves and eliminates our differentiation.

**Mitigation:**
- Track Zendesk changelog monthly
- Key features to watch:
  - ADPP ephemeral mode (our main differentiator)
  - ADPP pattern expansion beyond 5 types
  - ADPP retroactive scanning (currently forward-only)

**If ADPP catches up:**
- Option A: Pivot to Step 3 surfaces (VS Code, MCP) earlier
- Option B: Position as "multi-platform" even with just Zendesk + one other
- Option C: Sell the business while it still has value

### 7.3 Decision Framework

At any point, ask:

1. **Is revenue growing month-over-month?**
   - Yes → Keep going
   - No → Diagnose (product, positioning, or market issue?)

2. **Is the work sustainable?**
   - Yes → Keep going
   - No → Automate, raise prices, or sell

3. **Am I still enjoying this?**
   - Yes → Keep going
   - No → Sell or wind down

---

## 8. Skills & Resources

### 8.1 Solo Founder Skills (Step 2)

You need to be competent at:
- Full-stack TypeScript (Node + React)
- Zendesk App Framework (ZAF)
- Basic infrastructure (Render, Supabase, Vercel)
- Cold outreach and sales conversations
- Customer support and success
- Basic security concepts

You do NOT need:
- Enterprise sales experience
- SOC 2/compliance expertise
- ML/NLP experience
- Mobile development

### 8.2 Contractor Skills (Step 3 — If Expanding)

| Surface | Skills Needed | Estimated Cost |
|---------|---------------|----------------|
| VS Code Extension | VS Code API, TypeScript | $5-10k |
| CLI | Node.js, npm publishing | $2-5k |
| MCP Server | MCP protocol, JSON-RPC | $3-5k |
| Chrome Extension | Manifest V3, Chrome APIs | $5-10k |

### 8.3 Monthly Costs (Step 2)

| Category | Cost |
|----------|------|
| Infrastructure (Render, Supabase, Vercel) | ~$50/month |
| Domain + Email (Google Workspace) | ~$15/month |
| Tools (GitHub, misc.) | ~$20/month |
| **Total** | **~$85/month** |

Breakeven: ~1 customer at $500/month

---

## 9. Document Maintenance

### Update Triggers

Update this roadmap when:
- Monthly revenue crosses a milestone ($5k, $15k, $30k)
- Significant product decision is made
- Competitive landscape changes (ADPP improvement, new competitor)
- Step 2 → Step 3 decision is made

### Related Documents

| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| [VISION.md](./VISION.md) | Strategy, market analysis | Quarterly |
| [ADMIN.md](./ADMIN.md) | Entity, admin stack, milestones | Upon changes |
| [project_spec.md](./project_spec.md) | Technical specification | Per-release |
| [security_overview.md](./security_overview.md) | Customer-facing security | Per-release |

---

## Appendix: Step 4 Reference (NOT PURSUING)

> ⚠️ **This section is for reference only.** We are NOT pursuing Step 4 (VC-backed platform). This information is preserved for market context and in case of future strategic shifts.

### What Step 4 Would Require

| Requirement | Why We're Not Doing It |
|-------------|------------------------|
| VC funding ($1-2M seed) | Misaligned incentives; forces aggressive growth |
| C-Corp conversion | Complexity; only needed for VC |
| Enterprise sales team | 3-6 month cycles; requires dedicated headcount |
| SOC 2 Type II | $30k+ cost; 6-12 month process |
| Multi-surface platform | 8+ integrations; requires team of 5-10 |

### Step 4 Surfaces (NOT Building)

These integrations would be Step 4 scope:

| Surface | Why Not Building |
|---------|------------------|
| Slack/Teams | Requires enterprise sales |
| Salesforce | Complex integration; different buyer |
| GitHub | GitGuardian entrenched |
| Jira/Confluence | Enterprise Atlassian sales |
| Intercom/Freshdesk | Dilutes focus; similar to Zendesk |

### Step 4 Revenue Targets (For Reference)

If we were pursuing Step 4:
- Phase 3: $400k+ MRR
- Phase 4: $2-5M ARR
- Team: 10-15 engineers, 3-5 sales

**We are NOT pursuing these targets.**

---

**End of Roadmap**

*Version: 2.0 (Bootstrapped Path)*  
*Last Updated: December 30, 2025*  
*Next Review: Monthly until $30k MRR*
