# NymAI Vision: CRM Hygiene for HubSpot

**Mission:** Ensure HubSpot remains a secure system of record by detecting and redacting PII at the point of entry across all communication channels.

**Tagline:** "Clean CRM. Clear Conscience."

**Version:** 5.0 (The De-risked Timeline)  
**Last updated:** January 4, 2026

---

## Document Purpose

This document describes NymAI's vision, market opportunity, and execution strategy following our pivot to an accuracy-focused, tiered hygiene model for HubSpot.

**Timeline Update (v5.0):** This version reflects a "de-risked timeline" (12-15 months) accounting for solo founder realities, aligning with [ROADMAP.md](../memory/project_status.md) v5.0. We have shifted from aggressive 6-month targets to a sustainable growth path.

**Important Context:** NymAI is being built as a **bootstrapped Step 2 SaaS** following Rob Walling's Stairstep Method. This means:

- Focus on a single surface (HubSpot) until profitable
- Solo founder execution
- No venture capital
- Optional expansion to Step 3 (dev tools) only after achieving $41k MRR

The research and market analysis in this document covers the broader opportunity, but **execution is focused on HubSpot only** until PMF is proven.

---

## Table of Contents

1. [The Problem: The Data Concentrator Liability](#i-the-problem-the-data-concentrator-liability)
2. [The 6 Dimensions of CRM Hygiene](#ii-the-6-dimensions-of-crm-hygiene)
3. [Business Model: Bootstrapped Path](#iii-business-model-bootstrapped-path)
4. [Product Strategy: Tiered Accuracy](#iv-product-strategy-tiered-accuracy)
5. [Ephemeral Architecture: The Trust Shortcut](#v-ephemeral-architecture-the-trust-shortcut)
6. [Future Optionality: Step 3 Expansion](#vi-future-optionality-step-3-expansion)
7. [Market Analysis & Competitive Positioning](#vii-market-analysis--competitive-positioning)
8. [Go-to-Market Strategy](#viii-go-to-market-strategy)
9. [Competitive Moats](#ix-competitive-moats--why-were-hard-to-displace)
10. [Success Metrics](#x-success-metrics--key-numbers)
11. [FAQ](#xi-faq--addressing-common-questions)
12. [Summary](#xii-summary-why-now-why-nymai)

---

## I. The Problem: The Data Concentrator Liability

### The HubSpot "Data Concentrator" Effect

HubSpot has evolved from a simple CRM into a **data concentrator**. A single integration (Gmail/Outlook sync) pulls every customer interaction into one searchable database. While powerful for sales, this creates a massive security and compliance liability.

Sensitive data (SSNs, credentials, PHI, payment info) leaks into HubSpot through five primary surfaces:

#### 1. Synced Emails (Gmail & Outlook)

- **The Leak:** Sales and success teams sync their entire inboxes. Customers send credit card numbers, passwords, and IDs in "quick replies."
- **The Risk:** PII is now searchable by every CRM user and stored in HubSpot's cloud indefinitely.

#### 2. Logged Calls (Zoom, HubSpot Calling)

- **The Leak:** Automated transcriptions (AI) record and index sensitive data spoken during sales calls or support sessions.
- **The Risk:** Audio and transcripts contain raw PII that bypasses traditional email-only DLP.

#### 3. Conversations (WhatsApp, Facebook Messenger, Live Chat)

- **The Leak:** Customers use mobile messaging for "convenience," often sharing photos of IDs or sensitive account details.
- **The Risk:** Instant messaging data is often less scrutinized but just as regulated.

#### 4. Forms & Notes

- **The Leak:** Users paste sensitive context into internal notes; customers put PII into "Comments" fields on web forms.
- **The Risk:** Notes are the most permanent and least structured data in the CRM.

#### 5. Tickets & Deals

- **The Leak:** Support agents and sales reps attach PII to records to "speed up" workflows.
- **The Risk:** High-volume data entry leads to frequent accidental exposure.

### Why Zendesk Failed and HubSpot Wins (Marketplace Discovery)

| Feature               | Zendesk Marketplace                                | HubSpot Marketplace                             |
| --------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Discovery**         | Broken (Nightfall: $60M funding, only 50 installs) | Working (Zapier: 175K+ installs)                |
| **Revenue Share**     | 20%                                                | 0%                                              |
| **Growth Category**   | Legacy Support                                     | "CRM Hygiene" (Hot for GDPR/SOC2)               |
| **Integration Power** | Siloed Tickets                                     | Data Concentrator (Emails, Calls, Chats, Notes) |

**The Gap NymAI Fills:** Unified CRM Hygiene. We move beyond "redaction" into "CRM integrity," ensuring your system of record doesn't become a system of liability.

---

## II. The 6 Dimensions of CRM Hygiene

NymAI is defined by a 6-dimension framework that separates us from legacy DLP and native platform tools:

1. **Distribution** – Only PII app in the HubSpot Marketplace (not tiered). We own the "Hygiene" category through marketplace dominance.
2. **Trust** – Ephemeral processing; nothing to breach (not tiered). Data is held in memory for <500ms then purged instantly.
3. **Coverage** – All data surfaces (Emails, Calls, Notes), not just properties (not tiered). We protect the activity stream.
4. **Workflow** – Manual → Automated (tiered). Move from reactive agent-led redaction to proactive system-wide enforcement.
5. **Price** – 10x cheaper than enterprise competitors (tiered). Transparent, per-seat pricing that fits a corporate credit card.
6. **Accuracy** – HubSpot-tuned detection + ML enhancement (tiered). Specialized patterns built for CRM-specific data leaks.

```typescript
// One engine, multiple HubSpot surfaces
import { detect, redact } from '@nymai/core';

const findings = detect(content, { types: ['SSN', 'CC', 'EMAIL', 'API_KEY'] });
const masked = redact(content, findings);
```

---

## III. Business Model: Bootstrapped Path

### Stairstep Position

NymAI follows Rob Walling's Stairstep Method:

| Step       | Description                       | NymAI Status                   |
| ---------- | --------------------------------- | ------------------------------ |
| Step 1     | One-time product; learn to ship   | ✅ Complete                    |
| **Step 2** | First SaaS; single surface; niche | 🎯 **Current Focus (HubSpot)** |
| Step 3     | Expanded SaaS; multi-surface      | ⏳ Optional (at $30k MRR)      |

### Financial Parameters

- **Funding:** Bootstrapped (0% Rev Share on HubSpot helps maintain margins)
- **Target MRR:** $41k–$50k
- **Pricing Strategy:** "Credit Card Sweet Spot" (<$500/mo for mid-market teams)
- **Sales Motion:** Self-serve via HubSpot Marketplace + Low-touch support

---

## IV. Product Strategy: Tiered Accuracy

### 1. New Pricing Structure

All new users start with a **14-day Free Trial** including all Pro features. A work email is required (no personal domains). Up to 500 scans are included during the trial. After 14 days, the account downgrades to "Viewer" mode (past redactions are visible, but new scans are disabled) unless a plan is selected.

| Tier           | Base Price    | Per Seat  | Included Seats | Scans/mo  |
| -------------- | ------------- | --------- | -------------- | --------- |
| **Individual** | $29/mo        | —         | 1 (fixed)      | 1K        |
| **Pro**        | $99/mo        | +$15/seat | 5 included     | 15K       |
| **Business**   | $249/mo       | +$12/seat | 15 included    | 75K       |
| **Enterprise** | Contact Sales | Custom    | Unlimited      | Unlimited |

### 2. Accuracy Tiering

| Tier           | Detection Method                     | Expected Accuracy |
| -------------- | ------------------------------------ | ----------------- |
| **Individual** | Smart Regex + Confidence scores      | ~85%              |
| **Pro**        | + "Not PII" feedback learning        | ~88%              |
| **Business**   | + ML enhancement for ambiguous cases | ~95%              |
| **Enterprise** | + Custom patterns                    | ~97%+             |

### 3. Feature Matrix

| Feature                  | Individual | Pro | Business | Enterprise |
| ------------------------ | :--------: | :-: | :------: | :--------: |
| Full Surface Coverage    |     ✅     | ✅  |    ✅    |     ✅     |
| Ephemeral Processing     |     ✅     | ✅  |    ✅    |     ✅     |
| Confidence Scores        |     ✅     | ✅  |    ✅    |     ✅     |
| Feedback Learning        |     ❌     | ✅  |    ✅    |     ✅     |
| Bulk Operations          |     ❌     | ✅  |    ✅    |     ✅     |
| Client-side OCR          |     ❌     | ✅  |    ✅    |     ✅     |
| Scheduled Scans          |     ❌     | ❌  |    ✅    |     ✅     |
| GDPR Workflow Automation |     ❌     | ❌  |    ✅    |     ✅     |
| ML Enhancement           |     ❌     | ❌  |    ✅    |     ✅     |
| Custom Patterns          |     ❌     | ❌  |    ❌    |     ✅     |
| SSO & API Access         |     ❌     | ❌  |    ❌    |     ✅     |
| Dedicated SLA            |     ❌     | ❌  |    ❌    |     ✅     |

---

## V. Ephemeral Architecture: The Trust Shortcut

### 5.1 Trust Badge Positioning

Ephemeral processing is a **TRUST SHORTCUT** for buyers. In security sales, the biggest friction is the security questionnaire and data privacy review. By processing data in memory and never storing the raw content, NymAI eliminates 90% of security objections.

- **The SMB Question:** "Do you store our data?"
- **The NymAI Answer:** "No." (This ends the objection instantly).
- **Positioning:** Use Ephemeral Architecture as a trust badge in all marketing. It is not just a technical feature; it is a promise that "We can't leak what we don't have."
- **Outcome-First:** Lead with outcomes ("Find PII in 2 seconds"), support with architecture ("Processed in memory, never stored").

### 5.2 Technical Implementation

By using HubSpot Serverless Functions and @nymai/core's zero-dependency engine, we eliminate the biggest objection in security sales: "Where do you store our data?" We don't. Data is held in volatile memory for <500ms then purged instantly. This is a structural moat that legacy DLP vendors (who built on persistent databases) cannot easily copy.

---

## VI. Future Optionality: Step 3 Expansion

Expansion to Step 3 will only be considered after achieving $41k MRR sustained for 3+ months.

### Potential Step 3 Surfaces

- **VS Code Extension:** Protection for developers working with CRM APIs.
- **CLI:** Automating hygiene for bulk data imports.
- **MCP Server:** Guardrails for AI agents making tool calls to HubSpot.

---

## VII. Market Analysis & Competitive Positioning

### Target Market (Step 2)

**Focus:** HubSpot users in regulated industries (FinTech, HealthTech, B2B SaaS).

| Segment                   | Size     | NymAI Target     |
| ------------------------- | -------- | ---------------- |
| HubSpot Total Customers   | 200,000+ | -                |
| HubSpot Marketplace Users | 100,000+ | 60–100 customers |
| Regulated Mid-Market      | 15,000+  | Primary target   |

### Positioning Against Competitors

#### vs. Nightfall AI

- **The Competitive Gap:** Nightfall is a general-purpose DDR that scans 30+ apps with a generic model.
- **The NymAI Edge:** We scan HubSpot with CRM-tuned detection. We understand the specific context of sales emails and support notes, leading to higher precision with less noise.
- **Trust Narrative:** "We can't leak what we don't have." While Nightfall stores metadata and often raw snippets for their dashboard, NymAI's ephemeral approach means zero data persistence. This is the 30-second elevator pitch for security buyers.

#### vs. HubSpot Native

- **The Competitive Gap:** HubSpot Native focuses on protecting "properties" (structured fields). It has no proactive detection for unstructured text.
- **The NymAI Edge:** They can't detect PII hiding in plain sight. We find the data you didn't know to look for across the entire activity stream.

---

## VIII. Go-to-Market Strategy

### ICP (Ideal Customer Profile)

- **Title:** DPO, Compliance Officer, RevOps Lead, or CISO.
- **Company:** 50–500 employees, HubSpot-centric revenue operations.
- **Pain:** "We're going through a SOC2 audit and I'm terrified of what's in our sales reps' Gmail sync."

### Distribution Channels

1. **HubSpot App Marketplace:** Primary driver (SEO, "Hygiene" category).
2. **LinkedIn/Twitter:** Content targeting "RevOps" and "Compliance" (Problem education).
3. **Cold Outreach:** Targeting DPOs at companies with recent funding or SOC2 requirements.

---

## IX. Competitive Moats & Why We're Hard to Displace

### 1. The "Data Concentrator" Insight

We aren't just a "redaction tool." We are the "Clean CRM" layer. By integrating once into HubSpot, we cover Gmail, Outlook, Zoom, WhatsApp, and internal notes. This "one-to-many" coverage is our primary value prop.

### 2. HubSpot-Native UX

Built using HubSpot's newest React UI Extensions, the app feels like a part of the CRM, not a third-party bolt-on.

---

## X. Success Metrics & Key Numbers

| Metric               | Target (Month 6)  | Target (Month 12) | Target (Month 15) |
| -------------------- | ----------------- | ----------------- | ----------------- |
| **MRR**              | $5,000            | $15,000           | $41,030           |
| **Active Customers** | 25                | 75                | 175               |
| **Marketplace Rank** | Top 10 (Security) | Top 5 (Security)  | Top 3 (Security)  |
| **Churn**            | < 4%              | < 3%              | < 3%              |
| **Precision**        | 92% (Business+)   | 95% (Business+)   | 95%+ (Business+)  |

---

## XI. FAQ: Addressing Common Questions

**Q: Why HubSpot instead of Zendesk?**  
A: Marketplace discovery. We can reach 200k+ customers on HubSpot with 0% revenue share and working search. Zendesk's marketplace is stagnant for new entrants.

**Q: Is "CRM Hygiene" different from "PII Redaction"?**  
A: Yes. Redaction is a utility; Hygiene is a state of being. We sell the peace of mind that the CRM is clean and compliant for audits like SOC2 or GDPR.

**Q: How do you handle call transcripts?**  
A: HubSpot syncs call transcripts to the activity timeline. NymAI scans the timeline content via the same engine used for emails and notes.

**Q: Does NymAI work with custom objects?**  
A: Yes. Because our detection is surface-agnostic, we can be deployed across any HubSpot object (Contacts, Companies, Deals, Tickets, and Custom Objects).

---

## XII. Summary: Why Now, Why NymAI

HubSpot is no longer just a CRM; it is the central repository for all customer communications. This concentration of data is a ticking time bomb for compliance.

NymAI provides the only **ephemeral, marketplace-native, and tiered** solution to this problem. We are building the "Hygiene" layer for the world's most popular CRM, starting with HubSpot and scaling to $41k MRR through the Stairstep Method.

**Redact before the breach. Clean CRM. Clear Conscience.**

---

_Version: 5.0 (The De-risked Timeline)_  
_Last updated: January 4, 2026_  
_Next review: Monthly until $41k MRR_
