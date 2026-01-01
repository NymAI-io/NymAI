# MARKET.md

**Version:** 2.0 (Bootstrapped Path)  
**Last Updated:** December 30, 2025  
**Related Documents:** [VISION.md](./VISION.md), [ROADMAP.md](./ROADMAP.md), [ADMIN.md](./ADMIN.md)

---

## Table of Contents

1. [Business Context](#1-business-context)
2. [Market Overview](#2-market-overview)
3. [Target Market: Zendesk Security](#3-target-market-zendesk-security)
4. [Ideal Customer Profile](#4-ideal-customer-profile)
5. [Jobs-To-Be-Done](#5-jobs-to-be-done)
6. [Competitive Landscape](#6-competitive-landscape)
7. [Positioning & Differentiation](#7-positioning--differentiation)
8. [Channels & Distribution](#8-channels--distribution)
9. [Messaging & Hooks](#9-messaging--hooks)
10. [Pricing](#10-pricing)
11. [Success Metrics](#11-success-metrics)
12. [Risks & Assumptions](#12-risks--assumptions)
13. [Appendix: Market Intelligence](#appendix-market-intelligence-reference-only)

---

## 1. Business Context

### Stairstep Position

NymAI is a **bootstrapped Step 2 SaaS** following Rob Walling's Stairstep Method:

| Step | Description | NymAI Status |
|------|-------------|--------------|
| Step 1 | One-time product | ✅ Complete |
| **Step 2** | First SaaS; single surface | 🎯 **Current Focus** |
| Step 3 | Expanded SaaS | ⏳ Optional (at $30k MRR) |
| Step 4 | VC-backed platform | ❌ Not pursuing |

### What This Means for Market Focus

| Dimension | Our Approach |
|-----------|--------------|
| **Target Market** | Zendesk security buyers only |
| **ICP** | CISO / Security Lead at B2B SaaS (20-200 agents) |
| **Revenue Target** | $30k–$50k MRR |
| **Customers Target** | 30–50 paying workspaces |
| **NOT Targeting** | Enterprise multi-platform, dev tools (Step 3), large enterprise (Step 4) |

### Reading This Document

- **Sections 2-12:** Focused on Zendesk market — this is what we're executing
- **Appendix:** Market intelligence on adjacent markets (dev tools, AI guardrails, enterprise) — reference only, not pursuing

---

## 2. Market Overview

### 2.1 Category

NymAI is a **Zendesk PII redaction tool** that prevents sensitive data from persisting in support tickets.

We sit in the broader category of:
- **SaaS DLP (Data Loss Prevention):** Tools that detect/redact PII in SaaS apps
- **Support Security:** Tools that protect customer data in ticketing systems

### 2.2 Problem in One Sentence

Support agents paste SSNs, credit cards, and government IDs into Zendesk tickets. When Zendesk or a BPO is breached, that data is exposed.

### 2.3 Why Now (2025)

**Primary Driver: Discord Breach (October 2025)**

- ~70,000 government ID photos confirmed exposed from Zendesk
- Hackers gained access via compromised BPO credentials for 58 hours
- Proves vendor compromise is the real threat vector
- Every B2B SaaS company using Zendesk is now asking: "Could this happen to us?"

**Secondary Drivers:**

| Driver | Implication |
|--------|-------------|
| Zendesk ADPP limitations | Forward-looking only; 5 patterns; leaves gap |
| Regulatory pressure | CCPA, GDPR, state privacy laws require data minimization |
| BPO outsourcing growth | More third-party agents = more risk |
| Security questionnaires | Customers asking "How do you protect PII in Zendesk?" |

---

## 3. Target Market: Zendesk Security

### 3.1 Market Sizing

| Segment | Size | NymAI Target |
|---------|------|--------------|
| **Total Zendesk customers** | ~170,000 | — |
| **With 10-60 agents** | ~15,000 orgs | Addressable |
| **With security awareness** | ~5,000 orgs | Primary |
| **B2B SaaS/Fintech (sweet spot)** | ~2,000 orgs | Target |

**Addressable Market:**

| Metric | Calculation | Value |
|--------|-------------|-------|
| **Target orgs** | 2,000 companies with 10-60 agents | — |
| **Average deal** | $499/month × 12 | $6,000/year |
| **SAM** | 2,000 × $6,000 | ~$12M/year |
| **Target (Year 1)** | 60 customers × $6,000 | $360k/year |
| **Market share** | 60 / 2,000 | 3% |

**Why this is achievable:** We only need 60 customers (3% of target market) to hit $30k MRR.

### 3.2 Why This Market

| Factor | Assessment |
|--------|------------|
| **Problem clarity** | Clear (Discord breach proves it) |
| **Buyer clarity** | Clear (CISO / Security Lead) |
| **Distribution** | Built-in (Zendesk Marketplace) |
| **Competition** | Manageable (no dominant SMB player) |
| **Price point** | Bootstrappable ($500-$2k/month) |

### 3.3 Market NOT Targeting (Step 2)

| Market | Why Not |
|--------|---------|
| Intercom/Freshdesk | Dilutes focus; same buyer, different integration |
| Enterprise multi-platform | Requires sales team, SOC 2, 6-month cycles |
| Developer tools | Different buyer; Step 3 scope |
| AI guardrails | Different buyer; Step 3 scope |

---

## 4. Ideal Customer Profile

### 4.1 Primary ICP: Zendesk Security Buyer

**Who:**

| Attribute | Value |
|-----------|-------|
| **Title** | Security Lead, Compliance Officer, IT Manager, VP Ops |
| **Company size** | 50–500 employees |
| **Support agents** | 10–60 |
| **Industry** | B2B SaaS, fintech, e-commerce, marketplaces |
| **Revenue** | $5M–$100M ARR |
| **Primary ticketing** | Zendesk Support |

**Secondary Buyer:**
- Zendesk Admin with security/compliance responsibilities
- Head of Support who owns the Zendesk budget

> **Why 10-60 agents?** This is the "solo founder safe zone." Companies with 60+ agents typically have dedicated security teams, procurement processes, and SOC 2 requirements. Companies with 10-60 agents have budget but can still put software on a credit card.

### 4.2 Core Pain Points

1. **Vendor breach risk:** "What if Zendesk or our BPO is breached?"
2. **Agent behavior:** "Agents paste SSNs and IDs into tickets without thinking"
3. **Compliance pressure:** "Customers ask how we protect PII in Zendesk"
4. **ADPP limitations:** "Zendesk ADPP only scans new data and has 5 patterns"

### 4.3 Buying Triggers

| Trigger | Urgency |
|---------|---------|
| Discord breach news (or similar) | 🔴 High |
| Enterprise customer security questionnaire | 🔴 High |
| SOC 2 / HIPAA audit finding | 🔴 High |
| BPO contract renewal with security clause | 🟡 Medium |
| Internal risk assessment on Zendesk | 🟡 Medium |
| New security hire reviewing tooling | 🟢 Lower |

### 4.4 Buying Process

```
Discovery (Marketplace browse or cold email)
    ↓
14-day free trial (detection-only mode)
    ↓
Internal evaluation (1-2 weeks)
    ↓
CISO approval (if not already the buyer)
    ↓
Self-serve purchase OR 30-min call
    ↓
Zendesk admin implements

Timeline: 2-4 weeks
Decision makers: 1-2 (CISO + Zendesk admin)
```

### 4.5 Budget

| Tier | Monthly Budget | Annual Budget | Purchase Method |
|------|----------------|---------------|-----------------|
| Small (10-20 agents) | $299 | $3,600 | Credit card |
| Mid (20-40 agents) | $499 | $6,000 | Credit card / VP approval |
| Upper (40-60 agents) | $799 | $9,600 | VP approval |

**The $499 magic number:** This is often the limit for a department head's corporate card. Staying under $500/month means faster sales with no procurement involvement.

**Budget source:** Support/Ops budget, security budget, or Zendesk line item

### 4.6 Who We're NOT Targeting

| Profile | Why Not |
|---------|---------|
| **60+ agent companies** | Security teams, procurement, SOC 2 required — sales cycle too long |
| **Enterprise (150+ agents)** | Always need SOC 2; 6-month sales cycles; refer to Nightfall/Strac |
| **Startups (<10 agents)** | Low budget; ADPP may be sufficient |
| **Non-Zendesk users** | Different product needed |

> **The 60-agent ceiling:** A support team of 60+ agents typically means 500+ employees, a dedicated IT security function, and procurement processes that require SOC 2. These deals will trap a solo founder in 6-month security questionnaire cycles. If a 100-agent company reaches out, take the call — but don't build outbound strategy around them.

---

## 5. Jobs-To-Be-Done

### Primary JTBD

> "When my support agents paste sensitive data into tickets, I want it redacted before it becomes a liability, so that a vendor or BPO breach cannot expose my customers."

### Key Dimensions

| Dimension | Requirement |
|-----------|-------------|
| **Prevention** | Stop data before it persists (not just detect after) |
| **Speed** | Redaction completes in <5 seconds |
| **Simplicity** | One-click for agents; no workflow change |
| **Auditability** | Log what was detected and redacted |
| **Compliance** | Demonstrate "data minimization" to auditors |

### Secondary JTBD

> "When customers or auditors ask how we protect PII in Zendesk, I want clear documentation and audit logs, so that I can prove due diligence."

---

## 6. Competitive Landscape

### 6.1 Direct Competitors (Zendesk DLP)

| Competitor | Positioning | Strengths | Weaknesses | Pricing |
|------------|-------------|-----------|------------|---------|
| **Zendesk ADPP** | Native DLP | Bundled; zero integration | Forward-only; 5 patterns; no ephemeral | Included |
| **Strac** | Enterprise DLP | Real-time; multi-platform; vault | Stores originals; enterprise pricing | Custom ($10k+/year) |
| **Nightfall AI** | Enterprise DLP | 95%+ precision; broad coverage | Cloud-first; enterprise-only; stores data | Custom ($50k+/year) |
| **Polymer DLP** | Mid-market DLP | Affordable | Narrower coverage | $95+/user/month |

### 6.2 Competitive Analysis: NymAI vs. Each

**vs. Zendesk ADPP (Primary Competitor)**

| Dimension | Zendesk ADPP | NymAI | Winner |
|-----------|--------------|-------|--------|
| Pricing | Included with Enterprise | $500-$2k/month | ADPP |
| Data coverage | Forward-looking only | All data | **NymAI** |
| Patterns | 5 fixed | Extensible (10+) | **NymAI** |
| Data handling | Zendesk stores detected values | Ephemeral (<500ms) | **NymAI** |
| Historical data | Cannot scan | Can scan | **NymAI** |

**Positioning:** "NymAI does what ADPP can't — scan all data, not just new, with ephemeral processing."

**vs. Strac**

| Dimension | Strac | NymAI | Winner |
|-----------|-------|-------|--------|
| Pricing | Enterprise custom | $500-$2k/month | **NymAI** |
| Data handling | Vault storage | Ephemeral | **NymAI** |
| Multi-platform | Zendesk + Salesforce + Slack | Zendesk only | Strac |
| Target market | Enterprise | SMB/Mid-market | Different |

**Positioning:** "NymAI for teams who don't need (or can't afford) enterprise DLP."

**vs. Nightfall**

| Dimension | Nightfall | NymAI | Winner |
|-----------|-----------|-------|--------|
| Precision | 95%+ | 90%+ | Nightfall |
| Pricing | $50k+/year | $6k-$24k/year | **NymAI** |
| Sales motion | Enterprise sales | Self-serve | **NymAI** |
| Data handling | Cloud storage | Ephemeral | **NymAI** |

**Positioning:** "Nightfall precision at SMB prices, with ephemeral processing."

### 6.3 Competitive Summary

| Factor | NymAI Advantage |
|--------|-----------------|
| **Win when** | Customer wants ephemeral processing; can't afford enterprise DLP; needs all-data scanning |
| **Lose when** | Customer needs multi-platform (Strac); has Nightfall budget; ADPP is "good enough" |

### 6.4 Native Vendor Risk

**Risk:** Zendesk ADPP improves and eliminates our differentiation.

**Features to Monitor:**

| Feature | Current State | If Added |
|---------|---------------|----------|
| Ephemeral mode | ❌ Not available | Major threat |
| Historical scanning | ❌ Forward-only | Major threat |
| Pattern expansion | 5 patterns | Minor threat |
| Custom patterns | ❌ Not available | Minor threat |

**Mitigation:**
- Monitor Zendesk changelog monthly
- If ADPP improves significantly, consider Step 3 pivot to dev tools

---

## 7. Positioning & Differentiation

### 7.1 Positioning Statement

> **For B2B SaaS security leaders** who need to protect PII in Zendesk tickets, **NymAI** is a **Zendesk redaction tool** that **prevents sensitive data from persisting** — unlike Zendesk ADPP which only scans new data, or enterprise DLP which costs $50k+/year.

### 7.2 Key Differentiators

| Differentiator | What It Means | Proof Point |
|----------------|---------------|-------------|
| **Ephemeral processing** | Raw PII never stored anywhere | <500ms in memory, then cleared |
| **All-data scanning** | Works on historical data, not just new | Scan existing tickets on demand |
| **SMB pricing** | Accessible without enterprise budget | $500/month starting |
| **Self-serve** | No 6-month sales cycle | 14-day trial → purchase |

### 7.3 One-Liner

> "Redact PII from Zendesk tickets before the next breach — without storing your data."

### 7.4 Elevator Pitch

> "The Discord breach exposed 70,000 government IDs from Zendesk. Your agents paste sensitive data into tickets every day. NymAI detects and redacts that data in real-time — and unlike traditional DLP, we never store it. Detection happens in under 500 milliseconds, then we forget everything. ADPP only scans new data; we scan everything. And we're $500/month, not $50,000/year."

---

## 8. Channels & Distribution

### 8.1 Primary Channel: Zendesk Marketplace

| Aspect | Details |
|--------|---------|
| **Why primary** | Built-in distribution to target buyers |
| **Discovery** | Buyers search "DLP," "PII," "redaction," "security" |
| **Conversion** | One-click install → 14-day trial |
| **Effort** | Low (after initial listing) |

**Marketplace Optimization:**
- Title: "NymAI – PII Detection & Redaction"
- Keywords: DLP, PII, redaction, SSN, security, compliance, GDPR
- Screenshots: Sidebar with detections, redaction in action
- Reviews: Solicit from early customers

### 8.2 Secondary Channel: Cold Outreach

| Aspect | Details |
|--------|---------|
| **Volume** | 50-100 emails/week |
| **Target** | CISOs at B2B SaaS companies using Zendesk |
| **Hook** | Discord breach + "How do you protect PII in Zendesk?" |
| **Tools** | Apollo, LinkedIn Sales Navigator |

**Email Template:**

```
Subject: Saw you use Zendesk—quick question about PII

Hi [Name],

The Discord breach exposed 70K government IDs from Zendesk 
via a compromised BPO. Made me wonder how [Company] handles 
this risk.

We built NymAI to detect and redact PII in Zendesk tickets 
before it becomes a liability. Unlike ADPP, we scan all data 
(not just new), and we never store it.

Worth a 15-minute call to see if it's relevant?

[Your name]
```

### 8.3 Tertiary Channel: Content Marketing

| Content Type | Purpose | Frequency |
|--------------|---------|-----------|
| Blog posts | SEO for "Zendesk security," "Zendesk PII" | 2/month |
| Case studies | Social proof | After each major customer |
| Security guide | Lead magnet | Once |

### 8.4 Channels NOT Using (Step 2)

| Channel | Why Not |
|---------|---------|
| Enterprise sales team | Solo founder; self-serve only |
| Conference sponsorships | Too expensive for Step 2 |
| Paid ads | CAC likely too high |
| Product Hunt | Wrong audience (not developers) |

---

## 9. Messaging & Hooks

### 9.1 Primary Hook: Discord Breach

> **"The Discord breach exposed 70,000 government IDs from Zendesk. Your agents paste sensitive data into tickets every day."**

**Why it works:**
- Recent (Oct 2025)
- Specific (70K IDs, 58 hours, BPO credentials)
- Relatable (every Zendesk user has this risk)

### 9.2 Secondary Hook: ADPP Limitations

> **"Zendesk ADPP only scans new data. What about the SSNs already in your tickets?"**

**Why it works:**
- Specific objection to native tool
- Creates urgency (historical data is exposed)
- Positions NymAI as complementary

### 9.3 Tertiary Hook: Ephemeral Processing

> **"Traditional DLP stores your data to train their models. We never store it—detection happens in 500 milliseconds, then we forget everything."**

**Why it works:**
- Differentiation from Nightfall/Strac
- Compliance benefit (GDPR data minimization)
- Trust signal

### 9.4 Objection Handling

| Objection | Response |
|-----------|----------|
| "We already have ADPP" | "ADPP only scans new data. We scan everything and guarantee ephemeral processing." |
| "We're too small to worry about this" | "Discord had a BPO with access to their Zendesk. Do you have any contractors or agencies?" |
| "We can't afford another tool" | "We're $500/month, not $50k/year like enterprise DLP. And the cost of a breach is far higher." |
| "We need SOC 2 certified vendors" | "We're working toward SOC 2. In the meantime, our architecture actually helps your compliance—we never store PII." |

---

## 10. Pricing

### 10.1 Pricing Tiers

| Tier | Agents | Features | Price |
|------|--------|----------|-------|
| **Starter** | Up to 15 | Detection + redaction; basic dashboard | $299/month |
| **Growth** | Up to 40 | + All patterns; CSV export | $499/month |
| **Scale** | Up to 75 | + Priority support; API access | $799/month |

> **Why these limits?** Our target market is 10-60 agents. The Scale tier (up to 75) exists for opportunistic deals, not outbound targeting. Companies with 75+ agents typically require SOC 2 and are outside our target market.

### 10.2 Pricing Philosophy

**The $499 sweet spot:**
- Under $500/month = credit card purchase
- No procurement involvement
- Decision in days, not months
- Department head can approve

**Why no enterprise tier:**
- Enterprise (100+ agents) requires SOC 2
- 6-month sales cycles kill solo founders
- Refer them to Nightfall/Strac instead

### 10.3 Pricing Notes

- **No free tier** — trials only (14 days)
- **No enterprise tier** — refer 75+ agent companies to competitors
- **Annual discount** — 2 months free (17% off)
- **Workspace-based** — simple; no counting seats

### 10.4 Pricing vs. Competition

| Vendor | Entry Price | Annual Cost |
|--------|-------------|-------------|
| Zendesk ADPP | Included | $0 (with Enterprise) |
| Polymer | $95/user/month | $22,800/year (20 users) |
| Strac | Custom | $10,000+/year |
| Nightfall | Custom | $50,000+/year |
| **NymAI** | **$299/month** | **$3,600/year** |

**Positioning:** Credit-card friendly pricing for teams that don't need (or can't afford) enterprise DLP.

### 10.5 The Math to $30k MRR

| Approach | Customers Needed | Sales Difficulty |
|----------|------------------|------------------|
| 100 × $299 | 100 customers | Easy (credit card) |
| **60 × $499** | **60 customers** | **Easy (credit card)** |
| 38 × $799 | 38 customers | Medium (VP approval) |

**Target:** 60 customers at $499/month average = $30k MRR

This is achievable because:
- 2-week sales cycles (not 6 months)
- Credit card purchases (no procurement)
- No SOC 2 required
- Solo founder can handle the volume

---

## 11. Success Metrics

### 11.1 Bootstrapped Milestones

| Milestone | Target | Timeline |
|-----------|--------|----------|
| MVP launched | Working Zendesk app | Month 2 |
| First paying customer | $299-$499 MRR | Month 3 |
| Validation | 10 paying customers | Month 4 |
| Traction | $5k MRR (~12 customers) | Month 6 |
| Momentum | $15k MRR (~35 customers) | Month 9 |
| **Step 2 Complete** | **$30k MRR (~60 customers)** | **Month 12** |

### 11.2 Key Metrics

| Category | Metric | Target |
|----------|--------|--------|
| **Acquisition** | Marketplace installs | 100+/month |
| **Activation** | Trial → Active use (10+ redactions) | 50%+ |
| **Conversion** | Trial → Paid | 25%+ |
| **Revenue** | MRR | $30k (Month 12) |
| **Customers** | Paying workspaces | 60 |
| **ARPU** | Average revenue per customer | ~$500 |
| **Retention** | Monthly churn | <5% |
| **Quality** | Detection precision (SSN/CC) | ≥90% |

### 11.3 Metrics NOT Tracking (Step 2)

| Metric | Why Not |
|--------|---------|
| Multi-surface adoption | Zendesk-only |
| Enterprise deal size | Not targeting enterprise |
| VS Code / CLI installs | Step 3 scope |
| MCP deployments | Step 3 scope |

---

## 12. Risks & Assumptions

### 12.1 Key Assumptions

| Assumption | Confidence | Validation |
|------------|------------|------------|
| Discord breach creates urgency | High | Already seeing increased Zendesk security searches |
| CISOs will pay $500-$2k/month | Medium | Validate with first 10 customers |
| ADPP limitations are real pain | Medium | Validate in sales conversations |
| Self-serve motion works | Medium | If not, add light sales touch |
| Ephemeral processing resonates | High | Strong differentiator in messaging |

### 12.2 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **ADPP improves significantly** | Medium | High | Monitor monthly; pivot to Step 3 if needed |
| **Nightfall drops prices** | Low | Medium | Compete on ephemeral + self-serve |
| **No one buys at $500/month** | Low | High | Test lower price point; add features |
| **Precision too low** | Medium | High | Iterate on regex; add more patterns |
| **Zendesk Marketplace rejection** | Low | High | Have direct-install backup |

### 12.3 Competitive Response Scenarios

| Scenario | Signal | Response |
|----------|--------|----------|
| **ADPP adds ephemeral** | Zendesk announcement | Accelerate Step 3 (dev tools) |
| **ADPP adds historical scan** | Feature update | Emphasize pattern breadth; consider Step 3 |
| **Strac launches SMB tier** | Pricing announcement | Compete on ephemeral; faster support |
| **Nightfall enters SMB** | New product tier | Compete on ephemeral + self-serve |

---

## Appendix: Market Intelligence (Reference Only)

> ⚠️ **This section is for reference only.** We are NOT targeting these markets in Step 2. This intelligence is preserved for future strategic decisions.

### A.1 Adjacent Markets (Step 3 Scope)

If Step 3 is pursued, these markets become relevant:

| Market | Size | Competition |
|--------|------|-------------|
| **Developer Tools (DevSecOps)** | $10B/year | GitGuardian, Gitleaks, TruffleHog |
| **AI Guardrails** | $5B/year | Lakera (Check Point), Guardrails AI, NVIDIA NeMo |
| **Browser DLP** | $2B/year | Purview, Strac, Caviard |

### A.2 ICP #2: Developer / DevSecOps (Step 3)

**Not targeting in Step 2.** For reference:

| Attribute | Value |
|-----------|-------|
| Title | Staff engineer, DevSecOps lead |
| Company | 20-500 employees |
| Pain | Secrets + PII in code; AI leakage |
| Budget | Free–$100/month per team |

### A.3 ICP #3: Enterprise Multi-Platform (Step 4)

**Not pursuing.** For reference:

| Attribute | Value |
|-----------|-------|
| Title | CISO, Chief Privacy Officer |
| Company | 500-10k+ employees |
| Pain | PII scattered across 10+ tools |
| Budget | $10k–$50k/month |
| Sales cycle | 3-6 months |

### A.4 Competitive Landscape: Dev Tools (Step 3)

**Not competing here in Step 2.** For reference:

| Competitor | Focus | Pricing |
|------------|-------|---------|
| GitGuardian | Secrets scanning | $18/dev/month |
| Gitleaks | Open-source secrets | Free |
| TruffleHog | Secrets + verification | Free / Enterprise |
| Bearer | PII data flows | Custom |

### A.5 Competitive Landscape: AI Guardrails (Step 3)

**Not competing here in Step 2.** For reference:

| Competitor | Focus | Status |
|------------|-------|--------|
| Check Point Lakera | Enterprise AI security | Acquired for $300M |
| Guardrails AI | Open-source guardrails | Active |
| NVIDIA NeMo | Enterprise guardrails | Active |
| Nightfall for GenAI | Prompt scanning | Active |

### A.6 2025 AI Security M&A Wave

For market context (not directly relevant to Step 2):

| Acquirer | Target | Value | Date |
|----------|--------|-------|------|
| Check Point | Lakera | ~$300M | Sept 2025 |
| Cato Networks | Aim Security | Undisclosed | 2025 |
| SentinelOne | Prompt Security | Undisclosed | 2025 |
| F5 | CalypsoAI | Undisclosed | 2025 |

**Implication:** Large vendors paying $100M-$300M validates the AI security market. But also signals consolidation — standalone players may be absorbed.

### A.7 Regulatory Landscape

| Regulation | Relevance to NymAI |
|------------|-------------------|
| **GDPR** | Data minimization (ephemeral processing helps) |
| **CCPA/CPRA** | Consumer data rights; PII redaction supports compliance |
| **HIPAA** | PHI protection; BAA may be requested (Step 3) |
| **EU AI Act** | AI transparency; relevant if pursuing AI guardrails |
| **21+ US State Laws** | Various PII requirements; data minimization helps |

---

## Document Maintenance

### Update Triggers

Update this document when:
- Major competitor move (pricing, features, acquisition)
- Win/loss patterns emerge from sales
- Market assumptions are validated or invalidated
- Step 2 → Step 3 decision is made

### Quarterly Review

- [ ] Verify Zendesk ADPP hasn't changed significantly
- [ ] Check competitor pricing
- [ ] Review win/loss reasons
- [ ] Validate ICP assumptions with customer feedback

---

**End of Market Document**

*Version: 2.0 (Bootstrapped Path)*  
*Last Updated: December 30, 2025*  
*Next Review: Monthly until $30k MRR*
