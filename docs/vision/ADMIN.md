# ADMIN.md

**Version:** 5.0  
**Last Updated:** January 4, 2026  
**Confidentiality:** Internal Use Only  
**Related Documents:** [VISION.md](./VISION.md), [ROADMAP.md](./ROADMAP.md), [project_spec.md](../project_spec.md)

---

## Table of Contents

1. [Business Stage](#1-business-stage)
2. [Legal Entity](#2-legal-entity)
3. [Administrative Stack](#3-administrative-stack)
4. [Pricing Structure](#4-pricing-structure)
5. [Payment & Trial Infrastructure](#5-payment--trial-infrastructure)
6. [HubSpot Marketplace Requirements](#6-hubspot-marketplace-requirements)
7. [Intellectual Property](#7-intellectual-property)
8. [Bootstrapped Milestones](#8-bootstrapped-milestones)
9. [Compliance Requirements](#9-compliance-requirements)
10. [Annual Obligations](#10-annual-obligations)
11. [Formation Checklist](#11-formation-checklist)
12. [Support Scaling Plan](#12-support-scaling-plan)
13. [Partnership Revenue Model](#13-partnership-revenue-model)

---

## 1. Business Stage

### 1.1 Stairstep Position

NymAI follows Rob Walling's Stairstep Method:

| Step       | Description                           | NymAI Status                |
| ---------- | ------------------------------------- | --------------------------- |
| Step 1     | One-time product; learn to ship       | ✅ Complete (prior project) |
| **Step 2** | First SaaS; single surface; niche     | 🎯 **Current Focus**        |
| Step 3     | Expanded SaaS; multi-surface (NyxEDA) | ⏳ Long-term target         |

### 1.2 Current Scope

| Dimension          | Step 2 (Now)                 | Step 3 (NyxEDA)        |
| ------------------ | ---------------------------- | ---------------------- |
| **Surface**        | HubSpot only                 | + VS Code, CLI, MCP    |
| **ICP**            | HubSpot-using security teams | + DevSecOps leads      |
| **Revenue Target** | $41K MRR                     | $100K+ MRR             |
| **ARPU**           | ~$300–$500/month             | ~$500-$1,000/month     |
| **Timeline**       | Month 0–12                   | Month 12+              |
| **Team**           | Solo Founder                 | Solo + 1-2 contractors |

### 1.3 Strategic Focus

- **Bootstrapped Growth**: Focused on organic growth within the HubSpot ecosystem.
- **Single Surface**: Dominating the PII redaction niche within HubSpot before expanding.
- **Efficiency**: Low overhead, high automation, solo execution.

---

## 2. Legal Entity

### 2.1 Entity Information

| Field                   | Value                         |
| ----------------------- | ----------------------------- |
| **Legal Name**          | NymAI LLC                     |
| **Entity Type**         | Limited Liability Company     |
| **Formation State**     | Michigan                      |
| **Formation Cost**      | $50 (via Michigan LARA)       |
| **Operating Agreement** | Single-member                 |
| **EIN**                 | Required for business banking |

### 2.2 Why Michigan LLC?

- **Local Nexus**: Founder is a University of Michigan student; simpler compliance.
- **Cost Effective**: $50 formation fee is among the lowest in the U.S.
- **Simplicity**: No complex franchise taxes or foreign qualification requirements initially.
- **Pass-through Taxation**: Profits flow directly to the founder's personal tax return.

---

## 3. Administrative Stack

### 3.1 Banking & Finance

| Service               | Provider | Cost | Status      |
| --------------------- | -------- | ---- | ----------- |
| **Business Checking** | Mercury  | Free | Recommended |
| **Business Savings**  | Mercury  | Free | Recommended |

### 3.2 Communication & Identity

| Service            | Provider              | Cost                                    |
| ------------------ | --------------------- | --------------------------------------- |
| **Business Email** | Google Workspace      | $6/user/month (or free Gmail initially) |
| **Domains**        | nymai.io (or similar) | ~$30–$50/year                           |

### 3.3 Infrastructure

| Service          | Purpose                   | Cost      |
| ---------------- | ------------------------- | --------- |
| **DigitalOcean** | API Server (App Platform) | $5/month  |
| **Supabase**     | Metadata Database         | $25/month |
| **Vercel**       | Admin Console             | Free tier |
| **HubSpot**      | Developer Account         | Free      |

### 3.4 Estimated Monthly Costs (MVP)

| Service            | Monthly Cost   |
| ------------------ | -------------- |
| DigitalOcean       | $5             |
| Supabase Pro       | $25            |
| Google Workspace   | $6             |
| Domain (amortized) | ~$4            |
| **Total**          | **~$40/month** |

---

## 4. Pricing Structure

| Tier       | Base Price    | Per Seat After | Included Seats |
| ---------- | ------------- | -------------- | -------------- |
| Individual | $29/mo        | —              | 1 (fixed)      |
| Pro        | $99/mo        | +$15/seat      | 5 included     |
| Business   | $249/mo       | +$12/seat      | 15 included    |
| Enterprise | Contact Sales | Custom         | Unlimited      |

---

## 5. Payment & Trial Infrastructure

### 5.1 Trial Infrastructure

- **Work Email Validation**: Block generic providers (gmail.com, yahoo.com, etc.) to ensure B2B focus.
- **Trial Tracking**: Automated tracking of trial start/end dates and usage in Supabase.
- **Nurturing Sequences**: Automated email sequences for trial onboarding and conversion.

### 5.2 Payment Processing

- **Self-Serve**: Stripe integration for Individual, Pro, and Business tiers.
- **Enterprise**: Manual invoicing and custom contracts for Enterprise customers.
- **Automation**: Per-seat billing automation linked to HubSpot workspace seat count.

---

## 6. HubSpot Marketplace Requirements

### 6.1 Developer Account Setup

- Register for a [HubSpot Developer Account](https://developers.hubspot.com/).
- Create a developer portal to manage app listings and OAuth credentials.

### 6.2 App Listing Requirements

| Requirement         | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| **App Name**        | NymAI - PII Detection & Redaction                                   |
| **Description**     | Clear explanation of value proposition and features.                |
| **Screenshots**     | High-quality UI captures showing detection and redaction workflows. |
| **Pricing**         | Transparent pricing tiers (e.g., Free, Starter, Pro).               |
| **Support Contact** | Dedicated email (support@nymai.io) and response time SLA.           |

### 6.3 Technical & Security Requirements

- **OAuth 2.0**: Must implement HubSpot's OAuth flow for secure authentication.
- **Data Handling**: Disclosure of what data is processed and stored (Metadata only).
- **Security Review**: Compliance with HubSpot's app partner security guidelines.
- **Privacy/ToS**: Publicly accessible links to Privacy Policy and Terms of Service.

---

## 7. Intellectual Property

### 7.1 IP Ownership

All intellectual property, including code, documentation, and trademarks, is owned by **NymAI LLC**.

### 7.2 Protection Strategy

- **Copyright**: All source code is protected under copyright law.
- **Trade Secrets**: Detection patterns and redaction strategies are treated as trade secrets.
- **Trademarks**: NymAI (Common law trademark).

---

## 8. Bootstrapped Milestones

| Milestone | Target                    | How                         |
| --------- | ------------------------- | --------------------------- |
| Month 1   | MVP on Marketplace        | Submit app, get approved    |
| Month 2   | First 10 paying customers | Trial conversions           |
| Month 3   | $3K MRR                   | ~40 Individual + 10 Pro     |
| Month 12  | $15K MRR                  | Mix of tiers, some Business |
| Month 15  | $41K MRR                  | 175 customers across tiers  |

---

## 9. Compliance Requirements

### 9.1 Mandatory Documentation

- **Privacy Policy**: Detailed data processing and retention policy (Required for HubSpot).
- **Terms of Service**: Legal agreement between NymAI and its users (Required for HubSpot).
- **DPA**: Data Processing Agreement template for enterprise-grade customers.

### 9.2 Regulatory Alignment

- **GDPR**: Alignment with EU data protection rules (critical for HubSpot's global base).
- **CCPA**: Alignment with California consumer privacy requirements.
- **Ephemeral Processing**: Core architectural feature ensuring no PII is stored long-term.

### 9.3 SOC 2 Strategy

- **MVP Phase**: No SOC 2 (cost-prohibitive for $40/mo infra).
- **Scale Phase**: Evaluate SOC 2 Type I/II when MRR exceeds $40K and enterprise demand justifies the cost.

---

## 10. Annual Obligations

| Obligation         | Entity        | Cost            |
| ------------------ | ------------- | --------------- |
| **Annual Report**  | Michigan LARA | $25             |
| **Domain Renewal** | Registrar     | ~$50            |
| **Infrastructure** | Providers     | ~$120 (minimum) |
| **Total**          |               | **~$195/year**  |

---

## 11. Formation Checklist

1.  **Search Name Availability**: Verify "NymAI LLC" is available on Michigan LARA.
2.  **Register LLC**: File Articles of Organization with Michigan LARA ($50).
3.  **Get EIN**: Apply for an Employer Identification Number from the IRS (Free).
4.  **Open Banking**: Set up a Mercury business account using LLC docs and EIN.
5.  **Register Domain**: Purchase nymai.io or similar through a reputable registrar.
6.  HubSpot Account: Create a HubSpot Developer account and set up the app portal.
7.  Google Workspace: (Optional) Set up professional email for support/admin.
8.  Draft Legal Docs: Create baseline Privacy Policy and Terms of Service.
9.  Setup Infrastructure: Connect DigitalOcean, Supabase, and Vercel accounts to the LLC email.

---

## 12. Support Scaling Plan

- **Philosophy:** Self-serve first. Support burden should not scale linearly with customers.
- **Strategy by Customer Count:**
  - **0-50 customers:** Founder-led support (10-15 hrs/week). Focus on building self-serve documentation and identifying common friction points.
  - **50-100 customers:** Invest in a comprehensive knowledge base and automated help center. Hire a part-time support contractor (10 hrs/week) to handle routine inquiries.
  - **100-175 customers:** Dedicated part-time support hire or contractor (20 hrs/week). Founder involvement limited to complex technical escalations.
- **Self-Serve Infrastructure:**
  - In-app tooltips and guided tours.
  - Searchable FAQ and Knowledge Base.
  - Video walkthroughs for complex redaction workflows.
- **Channels:**
  - **Phase 1 (0-100 customers):** Email-only support (support@nymai.io).
  - **Phase 2 (100+ customers):** Add in-app chat support.
- **SLA Targets:**
  - **Individual/Pro:** <24 hour response time.
  - **Business:** <4 hour response time.
  - **Enterprise:** <1 hour response time (Priority Support).

---

## 13. Partnership Revenue Model

- **Target Partners:** HubSpot Solutions Partners (Agencies managing CRM for clients).
- **Value Proposition:** Partners can offer PII scanning and redaction as a value-add service during data migrations, CRM audits, and periodic hygiene projects.
- **Commission Structure:** 15-20% referral commission on the first-year revenue generated by referred customers.
- **Partner Enablement:**
  - Co-marketing materials and case studies.
  - Dedicated partner portal for tracking referrals.
  - Deal registration system to protect partner efforts.
- **White-Labeling:** Future consideration for agencies wanting to offer a branded PII hygiene solution as part of their proprietary service stack.
- **Goal:** Utilize partners as a primary distribution channel to increase reach and build ecosystem stickiness (switching costs).

---

**End of ADMIN.md**
