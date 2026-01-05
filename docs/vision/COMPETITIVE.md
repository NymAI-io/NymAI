# COMPETITIVE.md

**Version:** 4.0 (The Per-Seat Shift)  
**Classification:** INTERNAL ONLY - Do not share externally  
**Last Updated:** January 3, 2026  
**Related Documents:** [VISION.md](./VISION.md), [MARKET.md](./MARKET.md), [security_overview.md](./security_overview.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Gap Matrix](#2-the-gap-matrix)
3. [Competitive Accuracy Positioning](#3-competitive-accuracy-positioning)
4. [Competitor Deep Dives](#4-competitor-deep-dives)
5. [10x Positioning Framework](#5-10x-positioning-framework)
6. [Competitive Messaging Playbook](#6-competitive-messaging-playbook)
7. [Defensive Positioning](#7-defensive-positioning)
8. [Win/Loss Scenarios](#8-winloss-scenarios)
9. [Monitoring & Updates](#9-monitoring--updates)

---

## 1. Executive Summary

### Competitive Landscape Overview

The HubSpot ecosystem for PII detection and redaction is in its infancy. While HubSpot recently introduced native encryption for specific fields, there is a massive gap in protecting the **Activity Timeline** (Notes, Emails, Call Transcripts) where the majority of PII leaks occur.

| Tier                  | Players                           | Our Position                                              |
| :-------------------- | :-------------------------------- | :-------------------------------------------------------- |
| **Native Storage**    | HubSpot Sensitive Data Properties | Protects fields (properties), ignores the timeline        |
| **Enterprise DLP**    | Nightfall ($10k+), Metomic        | Heavyweight, IT-focused, no native agent UI               |
| **Direct Challenger** | Strac                             | Strong integration, but complex and enterprise-priced     |
| **CRM Hygiene**       | Insycle, Dedupely                 | Adjacent; cleans data but doesn't redact unstructured PII |
| **NymAI**             | —                                 | **The "Timeline First" SMB Hygiene Layer**                |

### The 6-Dimension Advantage

NymAI is the ONLY solution that addresses all six dimensions of the HubSpot PII problem:

1. **Distribution:** Only PII app in HubSpot Marketplace.
2. **Trust:** Ephemeral processing (competitors store PII in vaults).
3. **Coverage:** All data surfaces (Notes, Emails, Calls, Chats, Forms, Properties).
4. **Workflow:** Agent-facing UI with 10-second remediation vs. days of IT tickets.
5. **Price:** $29-249/mo vs. $3,600-10,000+/mo for enterprise DLP.
6. **Accuracy:** HubSpot-tuned detection, confidence scores, and ML enhancement at Business+.

---

## 2. The Gap Matrix

### Feature Comparison

| Capability                | HubSpot Native |  Strac  | Nightfall | Metomic |   **NymAI**    |
| :------------------------ | :------------: | :-----: | :-------: | :-----: | :------------: |
| In Marketplace            |    Built-in    |   ❌    |    ❌     |   ❌    |       ✅       |
| Ephemeral (No PII Stored) |      N/A       |   ❌    |    ❓     | Claims  |       ✅       |
| Activity stream scanning  |       ❌       |   ✅    |    ❓     |   ❌    |       ✅       |
| Agent-facing UI           |       ❌       |   ✅    |    ❌     |   ❌    |       ✅       |
| SMB pricing               |       ❌       |   ❌    |    ❌     |   ❌    |       ✅       |
| **CRM-tuned accuracy**    |       ❌       | Generic |  Generic  |   ❓    |       ✅       |
| Confidence scores         |       ❌       |   ❌    |    ❌     |   ❌    |       ✅       |
| ML enhancement            |       ❌       |   ✅    |    ✅     |   ✅    | ✅ (Business+) |
| Preview before Redact     |      N/A       |   ✅    |    ❌     |   ❌    |       ✅       |
| Undo Capability           |       ❌       |   ✅    |    ❌     |   ❌    |       ✅       |
| Attachment OCR            |       ❌       |   ✅    |    ✅     |   ✅    |       ✅       |

### Key Takeaways

1. **HubSpot Native is not a DLP:** It is a secure storage feature. It leaves the entire unstructured activity stream exposed.
2. **Strac is the primary rival:** They have a sidebar app, but their "UI Vault" model (storing originals) is a security liability NymAI avoids.
3. **Enterprise tools are "Invisible":** Nightfall and Metomic operate in the background. They alert IT after a violation but don't empower agents to clean up their own mess.
4. **Accuracy is the new frontier:** Generic models for 30+ apps miss HubSpot-specific context (like custom object structures). NymAI is tuned for HubSpot CRM data specifically.

---

## 3. Competitive Accuracy Positioning

### Accuracy vs Competitors

| Competitor     | Their Accuracy Claim | Our Counter                                                                 |
| -------------- | -------------------- | --------------------------------------------------------------------------- |
| Nightfall      | "95% precision" (ML) | "Generic model for 30 apps. We're tuned for HubSpot CRM data specifically." |
| Strac          | "AI classification"  | "They store your data to train. We're ephemeral AND accurate."              |
| HubSpot Native | N/A (no detection)   | "They can't detect PII at all. You mark fields manually."                   |

### Our Accuracy Approach

| Tier           | Method                                                  | Accuracy |
| -------------- | ------------------------------------------------------- | -------- |
| Individual/Pro | Smart Regex + Context (field names) + Confidence scores | ~85-88%  |
| Business       | + ML enhancement for ambiguous cases                    | ~95%     |
| Enterprise     | + Custom patterns for industry-specific PII             | ~97%+    |

**Key differentiator:** "Nightfall does 30 apps poorly. We do HubSpot perfectly."

---

## 4. Competitor Deep Dives

### 3.1 HubSpot Sensitive Data Properties (Native)

**Type:** Native CRM Feature (Enterprise only)  
**Pricing:** Included with HubSpot Enterprise Hubs ($1,200+/mo)  
**Threat Level:** 🟡 Medium

#### Overview

Launched in late 2024, this feature allows admins to flag specific contact/company properties as "Sensitive." Data in these fields is encrypted and requires specific permissions to view.

#### Strengths

- Built-in to the platform (Zero friction).
- Native trust (First-party security).
- HIPAA/GDPR alignment for structured fields.

#### Weaknesses (Our Opportunities)

- **Structured Only:** Only protects properties. If an agent pastes a SSN into a Note or an Email, HubSpot Native does nothing.
- **Enterprise Wall:** Small teams on Professional/Starter plans have no access to this.
- **Not Redaction:** It encrypts data you _want_ to keep. It doesn't help you get rid of data you _shouldn't have_.

#### How to Beat HubSpot Native

> "HubSpot's sensitive properties are great for the data you need to keep. NymAI is for the data you need to kill. We protect the 90% of your data that lives in Notes and Emails where encryption doesn't reach."

---

### 3.2 Strac DLP

**Type:** Enterprise DLP & Tokenization Platform  
**Pricing:** Custom (Estimated $6k-$12k+/year)  
**Threat Level:** 🔴 High

#### Overview

Strac provides a native HubSpot UI extension that can detect and redact PII in records. They use a "Vault" model where original data is stored in their cloud for authorized recovery.

#### Strengths

- Native HubSpot sidebar integration.
- Supports historical and real-time scanning.
- Broad pattern coverage including ID documents.

#### Weaknesses (Our Opportunities)

- **PII Storage:** They store original values in their vault. This creates a new breach surface for the customer.
- **Sales Friction:** No public pricing. Requires a "Book a Demo" cycle.
- **SMB Overkill:** Feature set is geared toward Enterprise security teams, not RevOps efficiency.

#### How to Beat Strac

> "Strac builds a vault of your PII. NymAI forgets it. If NymAI is breached, there is no vault for attackers to open because we process ephemerally."

---

### 3.3 Nightfall AI

**Type:** Enterprise DLP Platform  
**Pricing:** Custom ($10k+ annually)  
**Threat Level:** 🟡 Medium

#### Overview

The market leader in broad SaaS DLP. Their HubSpot integration uses the API to scan records and alert admins of exposure.

#### Strengths

- Industry-leading ML detection precision.
- Scans attachments, call transcripts, and records.
- SOC 2 Type II and massive brand equity.

#### Weaknesses (Our Opportunities)

- **No Agent UI:** Operates in the IT dashboard. Sales agents never see it, meaning hygiene isn't improved at the source.
- **Pricing:** Prohibitive for SMBs.
- **Integration Complexity:** Focused on the "SaaS Universe," not specialized for HubSpot workflows.

#### How to Beat Nightfall

> "Nightfall is for the CISO's dashboard. NymAI is for the Sales rep's workflow. We provide real-time hygiene where the work happens, at a price that fits your HubSpot budget."

---

### 3.4 Metomic

**Type:** SaaS Data Discovery  
**Pricing:** Custom  
**Threat Level:** 🟢 Low

#### Overview

A data discovery platform that maps where PII lives across multiple apps, including HubSpot. Focuses on "Human Firewall" coaching.

#### Strengths

- Excellent at finding "Dark Data" in the CRM.
- Strong automated coaching for users who violate policies.

#### Weaknesses (Our Opportunities)

- **Detection Focused:** Great at finding data, but one-click redaction in the HubSpot UI is not their primary focus.
- **Platform Buy-in:** Requires connecting many apps to get full value.

#### How to Beat Metomic

> "Metomic tells you that you have a PII problem. NymAI gives you a 'Redact' button to solve it instantly."

---

### 3.5 Insycle (Adjacent)

**Type:** CRM Data Management  
**Pricing:** $29/mo to $500+/mo  
**Threat Level:** 🟢 Low (but highly influential)

#### Overview

The dominant data operations tool for HubSpot. Used for deduplication, formatting, and bulk updates.

#### Strengths

- Installed in almost every sophisticated HubSpot instance.
- Deep understanding of HubSpot's API and object relationships.

#### Weaknesses (Our Opportunities)

- **Field Focused:** Insycle cleans properties (e.g., fixing phone formats). It does not scan unstructured Note/Email text for PII patterns.
- **No Redaction:** Focus is on data quality, not data privacy/security.

---

## 5. 10x Positioning Framework

### The 6-Dimension 10x Advantage

For each of the 6 dimensions, NymAI is 10x better than the status quo or generic competitors:

1. **Distribution:** 60 seconds to install from HubSpot Marketplace vs. weeks of procurement and custom API integration for enterprise tools.
2. **Trust:** Nothing to breach vs. a "PII Vault" full of sensitive customer data. Our ephemeral processing means we never store what we redact.
3. **Coverage:** 7 data surfaces (Notes, Emails, Calls, Chats, Forms, Properties, Attachments) vs. properties-only for native tools.
4. **Workflow:** 10 seconds for an agent to redact and undo vs. days of waiting for IT to resolve an alert in an external dashboard.
5. **Price:** $29-249/mo (standard SaaS pricing) vs. $3,600-10,000+ per year for enterprise DLP contracts.
6. **Accuracy:** HubSpot-tuned detection that understands CRM context vs. generic multi-app models that generate high false positives in CRM data.

### Our Unique Strategic Moats

#### 1. The "Timeline First" Advantage

While HubSpot and Insycle focus on **Properties**, NymAI focuses on the **Timeline**.

- 90% of CRM data leakage happens in unstructured text (Notes, Emails, SMS).
- We are the only tool built specifically to secure the HubSpot Activity Stream.

#### 2. The "Ephemeral Guarantee"

Traditional DLP vendors train AI models on your data or store originals in vaults.

- **Our narrative:** "The HubSpot app that forgets. Your PII exists in memory for <500ms, then it's destroyed."
- This eliminates the "Third-Party Storage" objection from security teams.

#### 3. CRM-Native Accuracy

Generic DLP tools (Nightfall/Metomic) try to do 30+ apps. We do HubSpot perfectly.

- We use field names, object types, and CRM context to reduce false positives.
- Confidence scores allow agents to make fast decisions without leaving the record.

---

## 6. Competitive Messaging Playbook

### Quick Reference: One-Liner Against Each

| Competitor         | One-Liner                                                               |
| :----------------- | :---------------------------------------------------------------------- |
| **HubSpot Native** | "Encryption for fields you keep; NymAI for PII you shouldn't have."     |
| **Strac**          | "Strac builds a PII vault; we forget your data ephemerally."            |
| **Nightfall**      | "Nightfall does 30 apps poorly. We do HubSpot perfectly."               |
| **Metomic**        | "We don't just find PII violations; we provide one-click remediation."  |
| **Insycle**        | "Insycle formats your names; NymAI redacts your sensitive liabilities." |

### Detailed Messaging Scripts

#### When Prospect Says "HubSpot handles PII now"

**Discovery question:** "Are you using the new Sensitive Data Properties? How are you handling PII that agents type into the Notes or sync from Gmail?"
**Positioning:**

> "HubSpot's native encryption is a great step for your structured data fields. But once a rep syncs their email or logs a call transcript, that data bypasses those fields entirely and sits in the Activity Timeline. We secure the 90% of your data that the native encryption can't reach."

#### When Prospect Mentions Strac

**Positioning:**

> "Strac is a powerful tool, but their architecture requires storing your original data in their 'UI Vault' to allow for decryption later. NymAI takes a zero-trust approach: we process your data ephemerally and store nothing. It's the difference between a secure vault and a shredder. For a clean CRM, you usually want the shredder."

#### When Prospect Mentions Accuracy

**Positioning:**

> "Enterprise tools like Nightfall use generic models designed to work across Slack, Jira, and GitHub simultaneously. This leads to high false-positive rates in a CRM environment. NymAI is tuned specifically for HubSpot's data structure, using CRM-specific context to ensure we catch the PII while ignoring the legitimate business data."

---

## 7. Defensive Positioning

### Threats to Monitor

| Threat                             | Likelihood |  Impact  | Early Warning             | Response                        |
| :--------------------------------- | :--------: | :------: | :------------------------ | :------------------------------ |
| **HubSpot adds Timeline Scanning** |    Low     | Critical | Inbound Keynote / Roadmap | Pivot to Step 3 (Dev Tools/MCP) |
| **Strac launches SMB Pricing**     |    High    |   High   | Marketplace reviews/ads   | Emphasize Ephemeral Moat        |
| **Insycle adds PII Detection**     |   Medium   |  Medium  | Insycle Product Blog      | Emphasize Security vs Ops focus |

### If HubSpot Improves Significantly

**Trigger:** HubSpot announces PII detection for Notes and synced Emails.
**Response:**

1. Emphasize "Zero-Data" architecture (HubSpot still stores/processes the data).
2. Highlight specialized patterns (e.g., custom regex for industry-specific identifiers).
3. Accelerate expansion to the **HubSpot Developer Ecosystem** (CLI, VS Code protection for CRM APIs).

---

## 7. Win/Loss Scenarios

### When We Win

- **The "No-Vault" Buyer:** Security teams who refuse to let PII leave their ecosystem for storage.
- **The Speed-to-Value Buyer:** RevOps leads who need a solution _today_ for an upcoming SOC 2 audit.
- **The Budget-Conscious Mid-Market:** Companies with 20-100 HubSpot users who find Strac/Nightfall too expensive.

### When We Lose

- **Hard SOC 2 Requirement:** Buyers who mandate the vendor must have SOC 2 (Accept — refer to Nightfall).
- **Multi-Platform Need:** Buyers who need one tool for HubSpot + Salesforce + Slack (Accept — not our segment).
- **Storage Requirement:** Buyers who _actually want_ to store the PII and decrypt it later (Accept — this is a different use case).

---

## 8. Monitoring & Updates

### Weekly Monitoring Checklist

- [ ] Check HubSpot App Marketplace "Security" and "Data Hygiene" categories.
- [ ] Monitor the HubSpot Product Updates blog for PII/Privacy mentions.
- [ ] Search "HubSpot redaction" on LinkedIn/X to find new entrants.

### Information Sources

- **HubSpot Ecosystem:** ecosystem.hubspot.com
- **HubSpot Changelog:** changelog.hubspot.com
- **G2/Capterra:** Reviews for Strac, Nightfall, and Insycle.
- **YC Batch Announcements:** To find new "PII security" startups.

---

## Document Maintenance

| Version | Date            | Changes                                             |
| :------ | :-------------- | :-------------------------------------------------- |
| 2.0     | January 3, 2026 | Complete rewrite for HubSpot pivot.                 |
| 3.0     | January 3, 2026 | Added Accuracy dimension and 6-dimension framework. |
| 4.0     | January 3, 2026 | Updated to Per-Seat Pricing Model.                  |

**Next Review:** February 2026

---

**End of COMPETITIVE.md**
