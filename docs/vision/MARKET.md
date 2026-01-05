# MARKET.md

**Version:** 5.0 (Clarified ICP & Sales Playbook)  
**Last Updated:** January 4, 2026  
**Related Documents:** [VISION.md](./VISION.md), [ROADMAP.md](./ROADMAP.md), [security_overview.md](./security_overview.md)

---

## Table of Contents

1. [Business Context](#1-business-context)
2. [Market Overview](#2-market-overview)
3. [Target Market: HubSpot CRM Hygiene](#3-target-market-hubspot-crm-hygiene)
4. [Ideal Customer Profile](#4-ideal-customer-profile)
5. [Jobs-To-Be-Done](#5-jobs-to-be-done)
6. [Competitive Landscape](#6-competitive-landscape)
7. [Positioning & Differentiation](#7-positioning--differentiation)
8. [Channels & Distribution (GTM Strategy)](#8-channels--distribution-gtm-strategy)
9. [Conversion Funnel](#9-conversion-funnel)
10. [Messaging & Hooks](#10-messaging--hooks)
11. [Pricing](#11-pricing)
12. [Success Metrics](#12-success-metrics)
13. [Risks & Assumptions](#13-risks--assumptions)

---

## 1. Business Context

### Stairstep Position

NymAI is a **bootstrapped Step 2 SaaS** following Rob Walling's Stairstep Method:

| Step       | Description                | NymAI Status                   |
| ---------- | -------------------------- | ------------------------------ |
| Step 1     | One-time product           | ✅ Complete                    |
| **Step 2** | First SaaS; single surface | 🎯 **Current Focus (HubSpot)** |
| Step 3     | Expanded SaaS              | ⏳ Optional (at $30k MRR)      |
| Step 4     | VC-backed platform         | ❌ Not pursuing                |

### The Pivot: Why HubSpot?

Following an analysis of the CRM ecosystem, NymAI has focused on HubSpot as its primary surface for three strategic reasons:

1.  **Marketplace Discovery:** The HubSpot Marketplace has working discovery and search optimization, providing superior distribution for specialized tools.
2.  **Revenue Share:** HubSpot offers 0% revenue share for app developers, significantly improving margins for a bootstrapped founder.
3.  **Data Concentrator Effect:** HubSpot pulls data from Gmail, Outlook, Zoom, and WhatsApp into one place, creating a massive "Data Concentrator Liability" that requires a unified hygiene solution.

---

## 2. Market Overview

### 2.1 Category

NymAI is a **HubSpot CRM Hygiene tool** that detects and redacts PII across the entire HubSpot activity stream.

We sit in the intersection of:

- **CRM Hygiene:** Tools that maintain data quality and integrity in the CRM.
- **SaaS DLP (Data Loss Prevention):** Tools that prevent sensitive data from leaking into SaaS apps.
- **Privacy Operations:** Tools that automate GDPR/CCPA compliance tasks.

### 2.2 Problem: The Data Concentrator Liability

HubSpot is no longer just a database; it is a **data concentrator**. When a sales rep syncs their Gmail or records a Zoom call into HubSpot, they are inadvertently importing every credit card number, SSN, and password contained in those interactions.

### 2.3 Why Now (2026)

**Primary Driver: Compliance Audit Readiness (SOC2/GDPR)**

- **GDPR Article 17 (Right to Erasure):** Companies are struggling to find and redact PII across synced emails and call transcripts when a "Right to be Forgotten" request arrives.
- **SOC2 Trust Principles:** Auditors are increasingly looking at CRM data as a "high-risk" area for PII exposure.
- **AI Transcription Leakage:** The rise of automated call summaries (HubSpot AI, Zoom AI) has created thousands of new text records containing raw PII spoken during meetings.

---

## 3. Target Market: HubSpot CRM Hygiene

### 3.1 Market Sizing

| Segment                       | Size          | NymAI Target   |
| ----------------------------- | ------------- | -------------- |
| **Total HubSpot customers**   | ~228,000      | —              |
| **HubSpot Service/Sales Hub** | ~120,000      | Addressable    |
| **Regulated Mid-Market**      | ~20,000 orgs  | Primary SAM    |
| **Active Marketplace Users**  | ~100,000 orgs | Discovery Pool |

### 3.2 TAM / SAM / SOM (Year 1)

| Metric                | Calculation                                      | Value        |
| --------------------- | ------------------------------------------------ | ------------ |
| **TAM (Total)**       | 228,000 HubSpot customers × $500/mo avg          | ~$1.37B/year |
| **SAM (Serviceable)** | 20,000 customers with compliance needs × $500/mo | ~$120M/year  |
| **SOM (Target)**      | 175 customers (blended avg)                      | **$41K MRR** |

**Why this is achievable:** We only need to capture 0.8% of the SAM (20k orgs) to reach our goal of $41k MRR by Month 15.

---

## 4. Ideal Customer Profile

### 4.1 Primary ICP (Individual/Pro Tiers): Revenue Operations Leader

**Who:**

| Attribute           | Value                                                |
| ------------------- | ---------------------------------------------------- |
| **Title**           | RevOps Manager, Sales Ops Lead, HubSpot Admin        |
| **Company size**    | 50–500 employees                                     |
| **Hub usage**       | Sales Hub Pro/Enterprise, Service Hub Pro            |
| **Industry**        | FinTech, HealthTech, B2B SaaS, Professional Services |
| **Secondary Buyer** | Compliance Officer, DPO, CISO                        |

#### 4.1.1 Why RevOps First

RevOps is our primary entry point for the Individual and Pro tiers because:

- **Workflow Efficiency:** They care about the "2 hours → 2 seconds" story for GDPR requests.
- **Credit Card Buyer:** They often have discretionary budget for tools under $200/mo.
- **Faster Sales Cycle:** Can install and trial without extensive security reviews for low-tier spend.

### 4.2 Secondary ICP (Business/Enterprise Tiers): Compliance Buyer

**Who:**

| Attribute          | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Title**          | CISO, Data Protection Officer (DPO), VP Compliance |
| **Company size**   | 250+ employees                                     |
| **Buying Trigger** | SOC2 Audit, GDPR Audit, HIPAA Compliance           |
| **Requirement**    | Enterprise-grade security (SSO, Audit Logs, RLS)   |

**The Compliance Play:**

- **Audit Readiness:** Sells on being "always ready" for the next auditor visit.
- **VP Approval Needed:** Longer sales cycle requiring security committee review.
- **Risk Mitigation:** Sells on the cost of a data breach vs. the cost of NymAI.

### 4.3 Buying Strategy

Our messaging should **LEAD** with operational benefits for RevOps ("Save 10 hours/week on redaction") and **SUPPORT** with compliance outcomes for the CISO ("Maintain 100% audit readiness").

### 4.4 Core Pain Points

1.  **The "Gmail Sync" Fear:** "Our reps sync their whole inboxes. I know there are credit cards and passwords in there, but I can't find them."
2.  **Audit Liability:** "We have a SOC2 audit next month and our CRM is a mess of PII."
3.  **Manual Redaction Cost:** "It takes our team 2 hours to manually find and redact data for a single GDPR request."

### 4.5 Buying Triggers

- **Upcoming SOC2 Audit:** The #1 driver for PII inventory and hygiene.
- **GDPR Deletion Request:** Realizing they don't know where the PII is hidden.
- **New HubSpot Implementation:** Setting up "clean" from day one.
- **Security Hire:** A new CISO/DPO reviewing the company's data footprint.

### 4.6 Budget

| Tier           | Monthly Budget | Annual Budget | Purchase Method |
| -------------- | -------------- | ------------- | --------------- |
| **Individual** | $29            | $348          | Credit card     |
| **Pro**        | $99 - $399     | $1k - $5k     | Credit card     |
| **Business**   | $249 - $1,200+ | $3k - $15k+   | VP Approval     |

---

## 5. Jobs-To-Be-Done

### Primary JTBD

> "When my revenue team syncs their communications (emails, calls, chats) into HubSpot, I want PII detected and redacted automatically, so that our CRM remains a system of record rather than a system of liability."

### Key Dimensions

- **Visibility:** "Show me exactly where the PII is hiding across all objects."
- **Speed:** "Redact historical data in bulk, not just one record at a time."
- **Frictionless:** "Don't break the sales rep's workflow or slow down the CRM UI."
- **Verification:** "Give me a log I can show an auditor to prove the CRM is clean."

---

## 6. Competitive Landscape

### 6.1 Direct Competitors

| Competitor         | Category        | Strength                             | Weakness                                               | Pricing             |
| ------------------ | --------------- | ------------------------------------ | ------------------------------------------------------ | ------------------- |
| **Nightfall AI**   | Enterprise DLP  | High precision; broad coverage       | $10k+ price; high friction; stores your data           | Custom ($10k-$50k+) |
| **Strac**          | Enterprise DLP  | 100+ file types; ML-heavy            | Vault storage (stores PII); sales-led motion           | Custom ($10k+)      |
| **Native HubSpot** | Native Platform | Bundled; zero integration            | Property-only; misses emails/calls/notes; few patterns | Included            |
| **Insycle**        | Data Quality    | Powerful bulk editing; deduplication | Not a security tool; no PII redaction engine           | $200-$1k+/mo        |
| **NymAI**          | **CRM Hygiene** | **Ephemeral; affordable; UI-native** | **HubSpot-only (for now)**                             | **$29-$249+ base**  |

### 6.2 Why NymAI Wins

1.  **Ephemeral Processing:** Unlike Nightfall/Strac, we never store your PII. We process it in memory and forget it.
2.  **Activity Stream Focus:** We scan the _content_ of synced emails and call transcripts—the primary leak vectors—which native HubSpot tools ignore.
3.  **Marketplace Native:** We are built with HubSpot's modern React UI extensions; we feel like a native part of the CRM.

---

## 7. Positioning & Differentiation

### 7.1 Positioning Statement

> **For Mid-Market RevOps leaders** who need to maintain a compliant HubSpot instance, **NymAI** is a **CRM Hygiene tool** that **automatically detects and redacts PII across the entire activity stream** — unlike enterprise DLP which is too expensive and stores your data, or native HubSpot tools which only look at properties.

### 7.2 The 10x Differentiators

- **Ephemeral Architecture:** Zero data retention (structural security advantage).
- **The "Activity Stream" Edge:** Coverage for Synced Emails, Call Transcripts, and Notes.
- **One-Click Redaction:** Integrated sidebar for reps to fix data issues without leaving the record.
- **Audit-Ready Logs:** Metadata-only logging for SOC2/GDPR compliance.

### 7.3 One-Liner

> "Clean CRM. Clear Conscience. Automated PII redaction for the HubSpot activity stream."

---

## 8. Channels & Distribution (GTM Strategy)

### 8.1 Primary: HubSpot App Marketplace

- **Marketplace SEO:** Dominate category ownership by optimizing for keywords: "GDPR," "PII," "Redaction," "SOC2," "DLP."
- **Strategy:** Leverage 0% revenue share and high discovery for the "Hygiene" and "Security" categories.

### 8.2 Partnerships & Networks

- **HubSpot Partner Network:** Build relationships with HubSpot Solutions Partners and agencies who manage CRM hygiene for multiple clients.
- **Community Infiltration:** Active participation and value-add in RevOps Co-op, r/hubspot, and Pavilion.

### 8.3 Content & Inbound

- **Content Marketing:** "GDPR Horror Stories" series and "The Hidden Risk of HubSpot Gmail Sync" to educate on the Data Concentrator Liability.
- **Product-Led Virality:** In-app triggers during trial to invite team members, accelerating seat-based expansion.

### 8.4 Launch Plays

- **Phase 1:** Product Hunt launch focused on the "Free PII Scanner" hook.
- **Phase 2:** Targeted Hacker News and LinkedIn campaigns targeting DPOs and RevOps leads.
- **Phase 3:** Direct account-based outreach to companies with upcoming SOC2 audits.

### 8.5 Founder-Led Sales Playbook (Month 0-3)

Before marketplace discovery kicks in, we will execute a manual outreach strategy:

- **Target:** 10-20 customers via direct outreach.
- **Audience:** DPOs/RevOps at Series A-B SaaS companies (30-100 employees) preparing for SOC2.
- **Channels:** LinkedIn DMs, cold email, founder personal network.
- **Hook:** "Preparing for SOC2? We'll scan your HubSpot CRM for PII in 60 seconds—free."
- **Goal:** Prove product-market fit with 10 paying customers before investing in marketplace assets.
- **Time investment:** 5-10 hours/week on outreach during Month 1-3.

---

## 9. Conversion Funnel

```
Visit Marketplace → Install (work email) → 14-day trial → Find PII → Trial ends (Viewer mode) → Convert to paid
```

---

## 10. Messaging & Hooks

### 10.1 Hook: The Data Concentrator Liability

> "HubSpot syncs every email and transcribes every call. Your CRM is now a PII magnet. Redact it before the next audit."

### 10.2 Hook: The Ephemeral Advantage

> "Why trust another vendor with your PII? NymAI redacts data in memory and forgets it instantly. We can't leak what we don't have."

---

## 11. Pricing

### 11.1 Free Trial

- 14 days, Pro features, work email required.
- 500 scans, downgrades to Viewer mode after trial ends.

### 11.2 Pricing Structure (Per-Seat)

| Tier       | Base Price    | Per Seat After | Included Seats | Scans/mo  |
| ---------- | ------------- | -------------- | -------------- | --------- |
| Individual | $29/mo        | —              | 1 (fixed)      | 1K        |
| Pro        | $99/mo        | +$15/seat      | 5 included     | 15K       |
| Business   | $249/mo       | +$12/seat      | 15 included    | 75K       |
| Enterprise | Contact Sales | Custom         | Unlimited      | Unlimited |

### 11.3 Per-Seat Examples

**Pro Tier:**

- 5 users: $99
- 10 users: $99 + (5 × $15) = $174
- 25 users: $99 + (20 × $15) = $399

**Business Tier:**

- 15 users: $249
- 50 users: $249 + (35 × $12) = $669
- 100 users: $249 + (85 × $12) = $1,269

---

## 12. Success Metrics

### 12.1 Key Targets

- **MRR:** $5,000 MRR (Month 6) → $15,000 MRR (Month 12) → $41,000 MRR (Month 15).
- **Active Customers:** 50 (Month 6) → 100 (Month 12) → 175 (Month 15).
- **Marketplace Rank:** Top 5 in "Data Quality" or "Security" categories.
- **Churn:** < 3% monthly.

### 12.2 Revenue Math (Target Model - Month 15)

| Tier           | Customers | Avg Seats | Avg Price | MRR         |
| -------------- | --------- | --------- | --------- | ----------- |
| Individual $29 | 80        | 1         | $29       | $2,320      |
| Pro            | 60        | 12        | $204      | $12,240     |
| Business       | 30        | 40        | $549      | $16,470     |
| Enterprise     | 5         | 150+      | $2,000    | $10,000     |
| **Total**      | **175**   | —         | —         | **$41,030** |

### 12.3 Quality Metrics

- **Precision:** ≥ 92% for core patterns (SSN, CC, Email).
- **Latency:** Redaction completes in < 500ms.
- **Support Load:** < 5 hours/week for the founder.

---

## 13. Risks & Assumptions

### 13.1 Key Risks

- **HubSpot Native Expansion:** If HubSpot adds robust activity-stream PII scanning to the "Enterprise" tier.
- **API Limitations:** HubSpot API changes that restrict access to email bodies or transcripts.
- **Competitor Down-Market Move:** Nightfall or Strac launching a $99/mo self-serve tier.

### 13.2 Mitigations

- **Focus on UX:** Maintain the best native-feeling UI for manual redaction.
- **Privacy-First Moat:** Double down on the ephemeral/zero-trust messaging.
- **Surface Agnostic Engine:** Keep @nymai/core flexible enough to pivot to Step 3 (Dev Tools) if Step 2 is commoditized.

### 13.3 Churn Prevention Strategy

To maintain a <3% monthly churn target, we will implement the following:

- **Onboarding:** Week 1 email sequence demonstrating value (reporting # of PII found, time saved vs. manual).
- **Health Scoring:** Track scans per week, login frequency, and support ticket volume.
- **At-Risk Triggers:**
  - No scans in 14 days.
  - Multiple failed detections in 48 hours.
  - Support escalation for "feature missing" requests.
- **Intervention Playbook:**
  - Automated "Check-in" email from founder.
  - 1:1 onboarding call offer for accounts with >5 seats.
- **Win-Back:** 30-day grace period for failed payments, "We miss you" campaign with final usage stats.

---

**End of Market Document**

_Version: 5.0 (Clarified ICP & Sales Playbook)_  
_Last Updated: January 4, 2026_  
_Next Review: Monthly until $41k MRR_
