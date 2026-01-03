# NymAI Vision: The Ephemeral PII Detection Tool for Zendesk

**Mission:** Prevent sensitive data from persisting in support systems by detecting and redacting at the point of entry.

**Tagline:** "Redact before the breach."

**Version:** 2.1 (Bootstrapped Path)  
**Last updated:** December 30, 2025

---

## Document Purpose

This document describes NymAI's vision, market opportunity, and execution strategy.

**Important Context:** NymAI is being built as a **bootstrapped Step 2 SaaS** following Rob Walling's Stairstep Method. This means:

- Focus on a single surface (Zendesk) until profitable
- Solo founder execution
- No venture capital
- Optional expansion to Step 3 (dev tools) only after achieving $30k MRR

The research and market analysis in this document covers the broader opportunity, but **execution is focused on Zendesk only** until PMF is proven.

---

## Table of Contents

1. [The Problem](#i-the-problem-sensitive-data-everywhere-2025)
2. [NymAI's Competitive Advantage](#ii-nymai-competitive-advantage-one-engine-multiple-surfaces)
3. [Business Model: Bootstrapped Path](#iii-business-model-bootstrapped-path) ← **New**
4. [Product Strategy: Zendesk First](#iv-product-strategy-zendesk-first)
5. [Future Optionality: Step 3 Expansion](#v-future-optionality-step-3-expansion)
6. [Market Analysis](#vi-market-analysis--competitive-positioning)
7. [Go-to-Market Strategy](#vii-go-to-market-strategy)
8. [Competitive Moats](#viii-competitive-moats--why-were-hard-to-displace)
9. [Success Metrics](#ix-success-metrics--key-numbers)
10. [FAQ](#x-faq--addressing-common-questions)
11. [Summary](#xi-summary-why-now-why-nymai)

---

## I. The Problem: Sensitive Data Everywhere (2025)

### The Leak Surface

Sensitive data (SSNs, APIs, credentials, PHI, payment info) leaks through multiple channels that traditional security tools don't cover:

#### 1. Support Tickets (Zendesk, Intercom, Jira Service Desk, Freshdesk)

- **What happens:** Agents paste customer IDs, payment codes, tracking numbers, government IDs into tickets.
- **Why it's dangerous:** When Zendesk or a BPO is breached, millions of records exposed at once.
- **Case study:** Discord breach (Oct 2025) → ~70,000 government ID photos confirmed exposed from Zendesk (hackers claimed 2.1M; Discord disputed); attackers gained access via compromised BPO credentials for 58 hours.
- **Current solution:** Zendesk ADPP detects new data only (forward-looking); can't address historical exposure; doesn't cover other support SaaS.

#### 2. Code Repositories (GitHub, GitLab, Bitbucket)

- **What happens:** Developers commit API keys, credentials, .env files, test data containing customer PII.
- **Why it's dangerous:** Once in git history, nearly impossible to fully remove; breaches expose dev environment and customer records simultaneously.
- **Scale:** GitHub secret scanning caught 23.77M new secrets in public repos (2024); ~1 new secret every 8 seconds.
- **Current solution:** GitGuardian, Gitleaks, TruffleHog cover _secrets_ well but almost ignore PII entirely; no unified detection.

#### 3. Developer Browsers & Emails

- **What happens:** Developers copy-paste customer data from emails into tickets, code, Slack, CI/CD logs.
- **Why it's dangerous:** No friction; data leaks casually and widely; ends up in searchable internal systems.

#### 4. Coding Agents & LLMs (Claude, ChatGPT, custom agents)

- **What happens:** Engineers paste logs/errors/configs containing secrets and PII into AI for debugging; AI agents make tool calls with sensitive data.
- **Why it's dangerous:** LLMs train on your data by default; agent workflows persist data in long-lived sessions; no built-in guardrails for PII.
- **Scale:** 8.5% of ChatGPT prompts contain sensitive data; 42% of 2024 enterprise leaks traced to AI services.

#### 5. Internal Communications (Slack, Teams, email, Discord)

- **What happens:** Teams share raw production data, PII, credentials in group chats.
- **Why it's dangerous:** Slack is searchable forever; breaches expose years of data at once.

### Why Existing Solutions Fail

| Category                     | Solution                                | Problem                                                            | Market Leader(s)         |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------ | ------------------------ |
| **DLP (Post-hoc detection)** | Strac, Nightfall, Polymer               | Detect _after_ data is stored; store customer data for ML training | Nightfall ($60M raised)  |
| **Native vendor tools**      | Zendesk ADPP, GitHub native             | Forward-looking only; limited patterns (ADPP has 5)                | Native/bundled           |
| **Secrets scanners**         | GitGuardian, Gitleaks, TruffleHog       | Excellent for secrets; ignore PII entirely                         | GitGuardian (600K+ devs) |
| **AI guardrails**            | Lakera (now Check Point), Guardrails AI | Slow (50ms–500ms); not MCP-native; cloud-dependent                 | Check Point Lakera       |

**The Gap NymAI Fills:** Prevention at the point of entry + ephemeral processing + local-first architecture.

---

## II. NymAI's Competitive Advantage: One Engine, Multiple Surfaces

### The Core Insight

NymAI is a **unified PII detection/redaction engine** that can run anywhere:

- Server-side (API, for Zendesk integration)
- Client-side (browser, IDE, CLI — future)
- Agent-integrated (MCP — future)

```typescript
// One engine, multiple clients
import { detect, redact } from '@nymai/core';

const findings = detect(text, { types: ['SSN', 'CC', 'EMAIL', 'API_KEY'] });
const masked = redact(text, findings);
```

### Three Differentiators

1. **Real-time Prevention (vs. Post-hoc Detection)**
   - Every competitor detects _after_ data is stored/sent.
   - NymAI prevents data from reaching vendors in the first place.

2. **Local / Ephemeral Processing (vs. Cloud Data Storage)**
   - DLP vendors store customer data to train models; we don't.
   - On servers: data held in memory <500ms, then discarded.
   - **Compliance win:** Simplifies HIPAA/GDPR (no long-term custody = less liability).

3. **Unified Detection Engine**
   - Secrets-only tools miss PII (GitGuardian).
   - PII-only tools miss secrets (Nightfall).
   - NymAI detects both in one engine.

---

## III. Business Model: Bootstrapped Path

### Stairstep Position

NymAI follows Rob Walling's Stairstep Method:

| Step       | Description                       | NymAI Status              |
| ---------- | --------------------------------- | ------------------------- |
| Step 1     | One-time product; learn to ship   | ✅ Complete               |
| **Step 2** | First SaaS; single surface; niche | 🎯 **Current Focus**      |
| Step 3     | Expanded SaaS; multi-surface      | ⏳ Optional (at $30k MRR) |
| Step 4     | VC-backed platform                | ❌ Not pursuing           |

### What This Means

| Dimension                     | Our Approach                         |
| ----------------------------- | ------------------------------------ |
| **Funding**                   | Bootstrapped (no VC)                 |
| **Entity**                    | Michigan LLC                         |
| **Team**                      | Solo founder; contractors as needed  |
| **Scope**                     | Zendesk only (Step 2)                |
| **Revenue Target**            | $30k–$50k MRR                        |
| **Timeline to Profitability** | 12 months                            |
| **Exit Options**              | Lifestyle business OR sell for $1–3M |

### What We're NOT Doing

- ❌ Raising venture capital
- ❌ Converting to C-Corp
- ❌ Building Slack/Teams/Salesforce integrations (Step 4 scope)
- ❌ Hiring full-time employees
- ❌ Enterprise sales team
- ❌ SOC 2 certification (unless customer-required)
- ❌ Pursuing "platform" positioning

### Why Bootstrapped?

1. **Solo founder sustainability** — VC-backed companies require growth rates incompatible with solo execution.
2. **Optionality** — Can always raise later from a position of strength ($30k+ MRR).
3. **Alignment** — Revenue goals match what one person can realistically build and support.
4. **Exit flexibility** — Lifestyle income OR micro-PE acquisition; no board pressure.

### The Stairstep Within NymAI

```
Step 2: Zendesk Only (Month 0–12)
├── Target: $30k–$50k MRR
├── Solo founder
├── Prove PMF
└── Decision point at $30k MRR
    │
    ├── Option A: Stay here (lifestyle)
    │   └── $360k–$600k/year income
    │
    ├── Option B: Sell
    │   └── $1–2M to micro-PE
    │
    └── Option C: Expand to Step 3
        └── Add VS Code, CLI, MCP
        └── Target $100k–$200k MRR
        └── Sell for $3–6M when ready
```

---

## IV. Product Strategy: Zendesk First

### Phase 1: Zendesk Dominance (Months 0–12)

**Goal:** Become the obvious choice for Zendesk PII redaction. Reach $30k MRR.

**What Ships:**

- Agent-initiated redaction (one-click in sidebar)
- Detection-only mode (risk visibility without enforcement)
- Admin console (toggles, logs, basic reporting)
- Ephemeral backend (no PII custody)
- Zendesk Marketplace distribution

**Why This Wedge:**

- **Clear problem:** 70K+ IDs exposed in Discord breach via Zendesk.
- **Clear buyer:** CISO, security lead, Zendesk admin.
- **Clear distribution:** Zendesk Marketplace (integrated, frictionless).
- **Clear differentiation:** Only vendor guaranteeing ephemeral processing.

**Pricing:**

| Tier        | Agents   | Price      | Target      |
| ----------- | -------- | ---------- | ----------- |
| **Starter** | Up to 15 | $299/month | Small teams |
| **Growth**  | Up to 40 | $499/month | Sweet spot  |
| **Scale**   | Up to 75 | $799/month | Upper limit |

> **The $499 sweet spot:** Under $500/month means credit card purchases, no procurement, and 2-week sales cycles instead of 6 months. Our target is 60 customers at ~$500 average = $30k MRR.

**Why Not Intercom/Freshdesk?**
Same buyer, same problem—but building multiple integrations dilutes focus. Scope them; build only if a deal requires it.

### Bootstrapped Milestones

| Milestone             | Target                       | Timeline     |
| --------------------- | ---------------------------- | ------------ |
| MVP launched          | Working Zendesk app          | Month 2      |
| First paying customer | $299-$499 MRR                | Month 3      |
| Validation            | 10 paying customers          | Month 4      |
| Traction              | $5k MRR (~12 customers)      | Month 6      |
| Momentum              | $15k MRR (~35 customers)     | Month 9      |
| **Step 2 Complete**   | **$30k MRR (~60 customers)** | **Month 12** |

### Key Differentiator vs. Zendesk ADPP

| Dimension     | Zendesk ADPP                    | NymAI                        |
| ------------- | ------------------------------- | ---------------------------- |
| Coverage      | Forward-looking only (new data) | All data                     |
| Patterns      | 5 fixed patterns                | Dynamic regex; extensible    |
| Data handling | Zendesk stores detected values  | Ephemeral (<500ms in memory) |
| Pricing       | Included in Enterprise          | Standalone ($500–$2k/mo)     |

**Positioning:** We're a _complement_ to ADPP, not a replacement. Different architecture, different coverage.

---

## V. Future Optionality: Step 3 Expansion

> **Important:** This section describes _optional_ expansion that will only be considered after achieving $30k MRR sustained for 3+ months. This is NOT a committed roadmap.

### Step 3 Expansion Criteria

**Expand to Step 3 when ALL of these are true:**

| Criterion          | Threshold                                  |
| ------------------ | ------------------------------------------ |
| Zendesk MRR        | ≥ $30k sustained (3+ months)               |
| Monthly churn      | < 5%                                       |
| Support burden     | < 10 hrs/week                              |
| Customer demand    | Dev tools requests from existing customers |
| Personal readiness | Want to grow (not just income)             |

### Potential Step 3 Surfaces

If Step 3 is pursued, these surfaces share the same `@nymai/core` engine:

| Surface               | Why                                                            | Effort |
| --------------------- | -------------------------------------------------------------- | ------ |
| **VS Code Extension** | PLG distribution; local processing; developers adopt bottom-up | Medium |
| **CLI**               | Same buyer as VS Code; npm distribution                        | Low    |
| **MCP Server**        | AI agent guardrails; first-mover opportunity                   | Medium |
| **Chrome Extension**  | Clipboard/paste protection; lead gen for enterprise            | Medium |

**Step 3 Revenue Target:** $100k–$200k MRR combined

**Step 3 Exit Options:**

- Lifestyle: $1.2–$2.4M/year income
- Acquisition: $3–6M to PE or strategic buyer

### What We're NOT Building (Step 4 Scope)

These require enterprise sales, compliance certifications, and/or VC funding:

- ❌ Slack/Teams integration
- ❌ Salesforce integration
- ❌ GitHub integration
- ❌ Jira/Confluence integration
- ❌ Enterprise bundle pricing ($10k–$50k/mo)
- ❌ SOC 2 Type II certification
- ❌ Multi-surface platform positioning

---

## VI. Market Analysis & Competitive Positioning

### Target Market (Step 2)

**Focus:** Zendesk security buyers only.

| Segment                        | Size         | NymAI Target     |
| ------------------------------ | ------------ | ---------------- |
| Zendesk Enterprise customers   | ~10,000 orgs | 50–100 customers |
| With security/compliance needs | ~3,000 orgs  | Primary target   |
| Addressable (SMB/Mid-market)   | ~1,500 orgs  | Sweet spot       |

**Realistic SAM:** ~$50M (1,500 orgs × $3k/month average × 12 months)

**NymAI Target (Step 2):** $360k–$600k ARR (0.7–1.2% of SAM)

### Competitive Landscape (Zendesk Only)

| Competitor       | Positioning                    | Weakness                      | NymAI Advantage        |
| ---------------- | ------------------------------ | ----------------------------- | ---------------------- |
| **Zendesk ADPP** | Native; included in Enterprise | Forward-only; 5 patterns      | All data; extensible   |
| **Strac**        | Enterprise DLP for Zendesk     | Enterprise pricing ($10k+)    | SMB pricing; ephemeral |
| **Metomic**      | SaaS data discovery            | Detection-only; no redaction  | Prevention + redaction |
| **Nightfall**    | Multi-platform DLP             | Enterprise sales; stores data | SMB; ephemeral         |

**Positioning:** "The ephemeral PII redaction tool for Zendesk teams who can't afford enterprise DLP."

### Pricing vs. Competition

| Vendor    | Entry Price         | Data Handling          |
| --------- | ------------------- | ---------------------- |
| Nightfall | Custom (enterprise) | Stores for ML training |
| Strac     | Custom ($10k+/year) | Vault storage          |
| **NymAI** | **$500/month**      | **Ephemeral (<500ms)** |

---

## VII. Go-to-Market Strategy

### ICP (Step 2 Only)

**Primary Buyer:**

- **Title:** Security Lead, CISO, or Compliance Officer
- **Company:** B2B SaaS, 20–200 support agents
- **Revenue:** $10M–$500M ARR
- **Pain:** "We don't control what agents paste; exposed if Zendesk is breached."

**Secondary Buyer:**

- **Title:** Zendesk Admin or IT Manager
- **Company:** Same as above
- **Pain:** "I need to prove we're protecting customer data."

### Distribution Channels

| Channel                    | Priority     | Effort                      |
| -------------------------- | ------------ | --------------------------- |
| **Zendesk Marketplace**    | 🔴 Primary   | Low (built-in distribution) |
| **Cold outreach to CISOs** | 🟡 Secondary | Medium (50–100 emails/week) |
| **Content marketing**      | 🟡 Secondary | Medium (blog, case studies) |
| **Security communities**   | 🟢 Tertiary  | Low (r/infosec, HN)         |

### Sales Motion

**Self-Serve + Light Touch:**

```
Discovery (Marketplace or cold email)
    ↓
Free trial (14 days, detection-only)
    ↓
Sales call (30 min, if requested)
    ↓
Paid conversion ($500–$2k/mo)
    ↓
Expansion (more agents, more features)
```

**No enterprise sales team.** If a deal requires custom contracts, legal review, or 6-month cycles, it's likely not a fit for Step 2.

### Messaging

**Headline:** "Redact PII from Zendesk tickets before the next breach."

**Hook:** "The Discord breach exposed 70,000 government IDs from Zendesk. Don't be next."

**Differentiator:** "Unlike enterprise DLP, NymAI never stores your data. Detection and redaction happen in under 500ms, then we forget everything."

**CTA:** "Start free trial → See what's lurking in your tickets."

---

## VIII. Competitive Moats & Why We're Hard to Displace

> **See [COMPETITIVE.md](./COMPETITIVE.md) for detailed competitor analysis, gap matrix, and messaging playbook.**

### The 10x Framework

We don't just compete—we're structurally different from every alternative:

| Competitor Type                                   | Their Model                          | Our Model                  | Why We Win                         |
| ------------------------------------------------- | ------------------------------------ | -------------------------- | ---------------------------------- |
| **Enterprise DLP** (Strac, Nightfall)             | Stores data for ML; enterprise sales | Ephemeral; self-serve      | SMBs priced out of them come to us |
| **Attachment-only** (Redact Attachments, Redacto) | Single capability                    | Unified text + attachments | "Why use two apps?"                |
| **AI Assistants** (eesel AI)                      | PII is a feature                     | PII is the product         | Purpose-built wins trust           |
| **Native** (Zendesk ADPP)                         | Forward-only; 5 patterns             | All data; extensible       | Complement, not compete            |
| **Open Source** (OpenRedaction)                   | Developer CLI                        | Agent-friendly sidebar     | Same patterns, better UX           |
| **Platform DLP** (Teleskope)                      | Enterprise implementation            | 5-minute install           | Speed wins SMB deals               |

### Why Competitors Can't Easily Copy Us

| Moat                       | Barrier to Competitors                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| **Ephemeral Architecture** | Nightfall/Strac would have to rebuild their ML pipeline—their models need stored data to train |
| **SMB Pricing**            | Enterprise vendors can't profitably serve $500/mo customers with their sales motion            |
| **Unified App**            | Knots.io would need to build text detection; Redacto would need sidebar UX                     |
| **Zendesk-Native UX**      | OpenRedaction is CLI-only—they'd need to build a Zendesk app from scratch                      |
| **Preview + Undo**         | No competitor offers both; requires architectural commitment                                   |

### Our Four Structural Moats

### 1. Ephemeral-First Architecture

- **Unique:** Only vendor guaranteeing "raw PII never persists anywhere."
- **Hard to replicate:** Requires different product architecture + compliance model.
- **Advantage:** Simplifies HIPAA/GDPR (no long-term custody = less liability).
- **Why competitors can't copy:** Strac/Nightfall's ML models require stored training data.

### 2. SMB Price Point

- **Unique:** $500–$2k/month vs. enterprise DLP at $10k+/year.
- **Advantage:** Accessible to mid-market teams priced out of Nightfall/Strac.
- **Why competitors can't copy:** Their sales motion requires enterprise deal sizes to be profitable.

### 3. Zendesk-Native Experience

- **Unique:** Sidebar integration; works where agents already work.
- **Advantage:** No workflow change; adoption friction is near-zero.
- **Why competitors can't copy:** Redact Attachments/Redacto are automation-only; no agent UI.

### 4. Complete Package (Text + Attachments + Preview + Undo)

- **Unique:** Only tool combining all four capabilities in one app.
- **Advantage:** "Why use two apps when one does everything?"
- **Why competitors can't copy:** Would require significant re-architecture.

---

## IX. Success Metrics & Key Numbers

### Bootstrapped Milestones

| Milestone             | Target              | Timeline     | Status |
| --------------------- | ------------------- | ------------ | ------ |
| LLC formed            | Entity exists       | Month 0      | ☐      |
| MVP launched          | Working Zendesk app | Month 2      | ☐      |
| First paying customer | $500 MRR            | Month 3      | ☐      |
| Validation            | 5 paying customers  | Month 4      | ☐      |
| Ramen profitable      | $5k MRR             | Month 6      | ☐      |
| Sustainable           | $15k MRR            | Month 9      | ☐      |
| **Step 2 Complete**   | **$30k MRR**        | **Month 12** | ☐      |

### Product Metrics

| Metric                       | Target      |
| ---------------------------- | ----------- |
| Detection precision (SSN/CC) | ≥ 90%       |
| Redaction latency (p95)      | < 5 seconds |
| Monthly churn                | < 5%        |
| NPS                          | > 40        |

### Financial Targets (Step 2)

| Metric    | Month 6 | Month 12 |
| --------- | ------- | -------- |
| MRR       | $5k     | $30k     |
| ARR       | $60k    | $360k    |
| Customers | 10      | 30–50    |
| ARPU      | $500    | $600–$1k |

---

## X. FAQ & Addressing Common Questions

**Q: Isn't this just regex?**  
A: **Yes, MVP is regex.** Regex is fast, cheap, and covers 95% of common PII. We'll add ML/NER later if customers need edge-case detection—not before.

**Q: Why not build multi-platform from the start?**  
A: **Vertical first wins sales.** Zendesk customers have a sharp problem and clear buyer. Multi-platform dilutes focus and requires enterprise sales we don't have.

**Q: Why not raise VC?**  
A: **Misaligned incentives.** VC requires aggressive growth incompatible with solo execution. Bootstrapping keeps optionality: lifestyle OR raise later from strength.

**Q: How do you compete with Zendesk's native ADPP?**  
A: **We complement it.** ADPP is forward-looking (new data only) with 5 patterns. We work on all data, have extensible patterns, and guarantee ephemeral processing. Different architecture, different use case.

**Q: What if Zendesk improves ADPP?**  
A: **Accelerate Step 3.** If native catches up, pivot to dev tools (VS Code, CLI, MCP) where there's no native competition.

**Q: What about enterprise customers?**  
A: **Not our focus.** If enterprise deals require SOC 2, custom contracts, or 6-month sales cycles, they're not a fit for Step 2. We'll refer them to Nightfall/Strac.

**Q: Will you ever raise money?**  
A: **Maybe.** At $30k+ MRR, we have optionality. Could raise seed to accelerate Step 3, or keep bootstrapping. Decision from position of strength, not desperation.

---

## XI. Summary: Why Now, Why NymAI

### Why Now

- **Discord breach (Oct 2025)** proved vendor compromise is the real threat vector.
- **Zendesk ADPP limitations** (forward-only, 5 patterns) leave a clear gap.
- **SMB/mid-market underserved** by enterprise-only DLP vendors.

### Why NymAI

- **Ephemeral-first:** Only vendor guaranteeing no data persistence.
- **SMB pricing:** $500–$2k/month vs. $10k+/year for competitors.
- **Zendesk-native:** Works where agents already work; zero workflow change.

### Why Bootstrapped

- **Sustainable:** Revenue targets match solo founder capacity.
- **Optionality:** Lifestyle OR sell OR raise later.
- **Focus:** One surface, one buyer, one problem—until it's solved.

### The Path

```
Month 0–12: Zendesk Only (Step 2)
├── Build MVP
├── Get to $30k MRR
├── Prove PMF
└── Decide: Stay / Sell / Expand

If Expand (Step 3):
├── Add VS Code, CLI, MCP
├── Target $100k–$200k MRR
└── Decide: Stay / Sell
```

---

## XII. Execution Mindset

**Remember:**

- **Zendesk only until $30k MRR.** No distractions.
- **Revenue over features.** Ship what customers pay for.
- **Ephemeral-first is the moat.** We don't just detect PII; we never store it.
- **Bootstrapped means saying no.** No enterprise sales. No SOC 2. No platform.
- **Optionality is the goal.** Build to $30k MRR, then decide from strength.

**This vision guides every decision. Everything we build should move us closer to: "$30k MRR from Zendesk customers who trust us because we never store their data."**

---

_Version: 2.1 (Bootstrapped Path)_  
_Last updated: December 30, 2025_  
_Next review: Monthly until $30k MRR_

---

## Appendix: Market Intelligence (Reference Only)

> **Note:** The following sections contain market research that informed our strategy. This is reference material, not a committed roadmap. These opportunities exist but are NOT being pursued in Step 2.

### Broader Market Opportunity

If NymAI were to pursue Step 4 (VC-backed platform), these would be the addressable markets:

| Segment                     | Market Size | Opportunity |
| --------------------------- | ----------- | ----------- |
| Zendesk Security            | $500M/year  | $50M        |
| Developer Tools (DevSecOps) | $10B/year   | $500M       |
| Enterprise GRC              | $50B/year   | $200M       |
| AI Safety / Agent Tools     | $5B/year    | $50M        |

**We are NOT pursuing these.** This is market intelligence only.

### Surfaces Not Being Built (Step 4 Scope)

These integrations would require VC funding, enterprise sales, and compliance certifications:

- Slack/Teams (requires enterprise sales)
- Salesforce (complex integration; enterprise buyer)
- GitHub (GitGuardian entrenched; requires data residency story)
- Jira/Confluence (enterprise Atlassian sales)
- Multi-platform bundle ($10k–$50k/month)

**We are NOT building these.** Documented for completeness only.

### Competitive Intelligence (Full Landscape)

For reference, the full competitive landscape includes:

| Category         | Key Players             | Why We're Not Competing        |
| ---------------- | ----------------------- | ------------------------------ |
| Enterprise DLP   | Nightfall, Strac        | Enterprise sales required      |
| Secrets Scanning | GitGuardian, TruffleHog | Different buyer; entrenched    |
| AI Guardrails    | Check Point Lakera      | Enterprise; VC-backed          |
| SASE/CASB        | Zscaler, Netskope       | Platform play; $30B+ companies |

**We are focused on Zendesk SMB/mid-market only.**

---

**End of VISION.md**
