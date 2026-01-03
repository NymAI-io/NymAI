# COMPETITIVE.md

**Version:** 1.0  
**Classification:** INTERNAL ONLY - Do not share externally  
**Last Updated:** January 2, 2026  
**Related Documents:** [VISION.md](./VISION.md), [MARKET.md](./MARKET.md), [security_overview.md](./security_overview.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Gap Matrix](#2-the-gap-matrix)
3. [Competitor Deep Dives](#3-competitor-deep-dives)
   - 3.1 [Zendesk ADPP (Native)](#31-zendesk-adpp-native)
   - 3.2 [Strac DLP](#32-strac-dlp)
   - 3.3 [Redact Attachments (Knots.io)](#33-redact-attachments-knotsio)
   - 3.4 [Redacto](#34-redacto)
   - 3.5 [eesel AI](#35-eesel-ai)
   - 3.6 [Teleskope.ai](#36-teleskopeai)
   - 3.7 [OpenRedaction](#37-openredaction)
   - 3.8 [Nightfall AI](#38-nightfall-ai)
   - 3.9 [Metomic](#39-metomic)
4. [10x Positioning Framework](#4-10x-positioning-framework)
5. [Competitive Messaging Playbook](#5-competitive-messaging-playbook)
6. [Defensive Positioning](#6-defensive-positioning)
7. [Win/Loss Scenarios](#7-winloss-scenarios)
8. [Win/Loss Tracking](#8-winloss-tracking)
9. [Monitoring & Updates](#9-monitoring--updates)

---

## 1. Executive Summary

### Competitive Landscape Overview

The Zendesk PII redaction space has **no dominant SMB player**. This is our opportunity.

| Tier                 | Players                                | Our Position                                |
| -------------------- | -------------------------------------- | ------------------------------------------- |
| **Enterprise DLP**   | Nightfall ($50k+/yr), Strac ($10k+/yr) | Too expensive for our ICP                   |
| **Native**           | Zendesk ADPP                           | Weak (5 patterns, forward-only)             |
| **Marketplace Apps** | Redact Attachments, Redacto, eesel AI  | Fragmented; single-capability               |
| **Platform Plays**   | Teleskope.ai                           | Enterprise-focused, no Marketplace presence |
| **Open Source**      | OpenRedaction                          | Developer-only, no Zendesk integration      |
| **NymAI**            | —                                      | **The complete SMB package**                |

### The Gap We Fill

Every competitor has at least one of these problems:

1. **Enterprise pricing** (Strac, Nightfall, Teleskope) — SMBs priced out
2. **Single capability** (Redact Attachments, Redacto) — Text OR attachments, not both
3. **Data storage** (Strac, Nightfall) — Stores PII for ML training
4. **Weak native** (ADPP) — Forward-only, 5 patterns, stores detected values
5. **Developer-only** (OpenRedaction) — No agent-facing UI

**NymAI is the ONLY solution combining:**

- Text + attachment scanning in ONE app
- Ephemeral processing (no data stored)
- Public, self-serve pricing ($499-$899/mo)
- Agent-facing sidebar with preview + undo

---

## 2. The Gap Matrix

### Feature Comparison

| Capability             | ADPP   | Strac | Redact Attach. | Redacto | eesel | Teleskope | OpenRedact | **NymAI** |
| ---------------------- | ------ | ----- | -------------- | ------- | ----- | --------- | ---------- | --------- |
| Text redaction         | ✅     | ✅    | ❌             | ❌      | ✅    | ✅        | ✅         | ✅        |
| Attachment OCR         | ❌     | ✅    | ✅             | ✅      | ❌    | ✅        | ❌         | ✅        |
| Ephemeral processing   | ❌     | ❌    | ?              | ✅      | ❌    | ❌        | ✅         | ✅        |
| Public pricing         | ✅     | ❌    | ✅             | ✅      | ✅    | ❌        | ✅         | ✅        |
| Self-serve purchase    | ✅     | ❌    | ✅             | ✅      | ✅    | ❌        | ✅         | ✅        |
| Agent-facing sidebar   | ✅     | ✅    | ❌             | ❌      | ✅    | ❌        | ❌         | ✅        |
| Preview before redact  | ?      | ✅    | ❌             | ❌      | ?     | ?         | ❌         | ✅        |
| Undo capability        | ❌     | ?     | ❌             | ❌      | ❌    | ?         | ❌         | ✅        |
| Historical scanning    | ❌     | ✅    | ✅             | ✅      | ?     | ✅        | ✅         | ✅        |
| SMB pricing (<$1K/mo)  | ✅     | ❌    | ✅             | ✅      | ✅    | ❌        | ✅         | ✅        |
| 10+ PII patterns       | ❌ (5) | ✅    | N/A            | N/A     | ?     | ✅        | ✅ (500+)  | ✅        |
| No sales call required | ✅     | ❌    | ✅             | ✅      | ✅    | ❌        | ✅         | ✅        |

### Reading the Matrix

- **Green columns** = NymAI advantages
- **Red cells** = Competitor weaknesses to exploit
- **?** = Unknown/unverified (needs validation)

### Key Takeaways

1. **No competitor has all green** — Everyone has gaps
2. **Strac is closest** — But enterprise pricing + data storage are major weaknesses
3. **ADPP is weakest** — Forward-only and 5 patterns = easy to beat
4. **Attachment apps are fragmented** — Need 2 apps for full coverage

---

## 3. Competitor Deep Dives

### 3.1 Zendesk ADPP (Native)

**Type:** Native Zendesk feature  
**Pricing:** Included with Zendesk Enterprise  
**Threat Level:** 🟡 Medium (could improve)

#### Overview

Zendesk's Advanced Data Privacy & Protection add-on. Native, zero-integration solution for Enterprise customers.

#### Strengths

- Bundled with Zendesk Enterprise (no extra cost)
- Zero integration friction
- Native trust ("it's from Zendesk")
- June 2025: Added trigger-based auto-redaction

#### Weaknesses (Our Opportunities)

| Weakness                          | Our Advantage                         |
| --------------------------------- | ------------------------------------- |
| Forward-looking only (new data)   | We scan ALL data including historical |
| Only 5 fixed patterns             | We have 10+ extensible patterns       |
| Zendesk stores detected values    | We process ephemerally (<500ms)       |
| No attachment scanning            | We scan PDFs and images via OCR       |
| Can't redact pasted/inline images | We handle inline images               |

#### How to Beat ADPP

> "ADPP is great for catching new data. But what about the SSNs already in your historical tickets? And did you know Zendesk stores the values they detect? We scan everything and forget immediately."

#### Messaging Against ADPP

| Objection              | Response                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| "We already have ADPP" | "ADPP only scans new data. We scan everything including historical tickets."                |
| "ADPP is free"         | "ADPP stores detected values in Zendesk. We process ephemerally. Different security model." |
| "ADPP is from Zendesk" | "We complement ADPP. Different architecture for different use cases."                       |

#### Monitor For

- [ ] Historical scanning capability added
- [ ] Ephemeral processing mode added
- [ ] Pattern expansion beyond 5

**If ADPP adds historical + ephemeral:** Consider accelerating Step 3 pivot to dev tools.

---

### 3.2 Strac DLP

**Type:** Enterprise DLP platform  
**Pricing:** Custom (estimated $10k+/year)  
**Threat Level:** 🔴 High (direct competitor, well-funded)

#### Overview

YC-backed, ML-powered DLP for Zendesk and other platforms. Our most sophisticated competitor.

#### Strengths

- YC backing and credibility
- ML-powered detection (claims high precision)
- 100+ file types including images
- Real-time + historical scanning
- Multi-platform (Zendesk + Salesforce + Slack)
- "Strac UI Vault" stores originals for authorized access
- FREE for YC companies
- 30-day free trial

#### Weaknesses (Our Opportunities)

| Weakness                          | Our Advantage                      |
| --------------------------------- | ---------------------------------- |
| No public pricing                 | We're $499/mo, transparent         |
| Enterprise sales cycle (6+ weeks) | Self-serve, install today          |
| Stores data in vault              | Ephemeral processing, never stored |
| Overkill for SMBs                 | Right-sized for 10-60 agents       |
| 0 Marketplace reviews             | We'll have reviews + ratings       |

#### How to Beat Strac

> "Strac without the sales call, without storing your data"

#### Messaging Against Strac

| Scenario                | Message                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Prospect mentions Strac | "Strac's great for enterprises. We're for teams who want protection without the 6-week sales cycle."    |
| Strac pricing concern   | "We're $499/mo flat. No sales call needed. Install today."                                              |
| Data privacy concern    | "Unlike Strac's vault model, we never store your PII. It's processed in memory and forgotten."          |
| Feature comparison      | "Strac has 100+ file types. Do you need all of them? We focus on what matters: text, PDFs, and images." |

#### Monitor For

- [ ] SMB pricing tier launched
- [ ] Self-serve purchase option
- [ ] Ephemeral processing mode

**If Strac launches SMB tier:** Compete on ephemeral + faster support + simpler pricing.

---

### 3.3 Redact Attachments (Knots.io)

**Type:** Zendesk Marketplace App  
**Pricing:** Free to install  
**Threat Level:** 🟢 Low (single capability)

#### Overview

Free Zendesk app for automated attachment redaction via triggers and tags. Part of Knots.io suite.

#### Strengths

- Free pricing
- Automated via triggers/tags
- Scheduled redactions
- Inline image protection
- Execution logs
- 10+ installs on Marketplace

#### Weaknesses (Our Opportunities)

| Weakness                              | Our Advantage                  |
| ------------------------------------- | ------------------------------ |
| Attachments ONLY                      | We do text + attachments       |
| Needs separate app for text           | We're one unified app          |
| Trigger-based only (no on-demand)     | Agent-initiated + automated    |
| Known bug: can't redact pasted images | We handle pasted/inline images |
| No preview before redact              | Preview everything first       |
| No undo                               | 10-second undo window          |

#### How to Beat Redact Attachments

> "One app for everything—text AND attachments, on-demand AND automated"

#### Messaging Against Redact Attachments

| Scenario             | Message                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Already using it     | "Great for attachments! But what about the SSNs agents type in comments? We do both in one app."    |
| Free vs paid concern | "You get text + attachments + preview + undo for $499/mo. Not two separate apps."                   |
| Workflow concern     | "Trigger-based is great for automation. But sometimes agents need to redact on-demand. We do both." |

---

### 3.4 Redacto

**Type:** Zendesk Marketplace App  
**Pricing:** $9.99/month  
**Threat Level:** 🟢 Low (limited features)

#### Overview

Cheap bulk attachment redaction tool with advanced search and CSV import.

#### Strengths

- Very cheap ($9.99/mo)
- Local processing within Zendesk
- Bulk/batch operations
- Real-time progress tracking
- CSV import for batch jobs

#### Weaknesses (Our Opportunities)

| Weakness                           | Our Advantage             |
| ---------------------------------- | ------------------------- |
| Attachments only                   | We do text + attachments  |
| Bulk/batch focused (not real-time) | Real-time agent workflow  |
| No detection preview               | See before you redact     |
| No undo                            | 10-second undo window     |
| No sidebar UI                      | Native sidebar experience |
| Basic feature set                  | Full-featured solution    |

#### How to Beat Redacto

> "See before you redact, undo if you're wrong, text + attachments together"

#### Messaging Against Redacto

| Scenario         | Message                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Price comparison | "For $499 vs $10, you get: text redaction, preview, undo, sidebar UI, and proper logging."    |
| Already using it | "Redacto handles bulk attachments. We handle the complete workflow including real-time text." |

---

### 3.5 eesel AI

**Type:** AI Assistant Platform  
**Pricing:** Custom (free signup + demo)  
**Threat Level:** 🟢 Low (different focus)

#### Overview

AI-powered assistant platform that includes PII redaction as one of many features. Not a dedicated security tool.

#### Strengths

- AI-powered (potentially higher precision)
- Broader platform (not just redaction)
- Free signup and demo
- Modern UI/UX

#### Weaknesses (Our Opportunities)

| Weakness                          | Our Advantage                   |
| --------------------------------- | ------------------------------- |
| PII is a feature, not the product | Purpose-built for PII           |
| No attachment scanning            | Full text + attachment coverage |
| AI assistant positioning          | Security tool positioning       |
| No compliance focus               | Compliance-first design         |
| Unclear data handling             | Ephemeral guarantee             |

#### How to Beat eesel AI

> "Purpose-built for compliance, not an AI assistant with redaction bolted on"

#### Messaging Against eesel AI

| Scenario          | Message                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Considering eesel | "eesel is great for AI assistance. For security compliance, you want a purpose-built tool."  |
| AI vs regex       | "Our regex is predictable and auditable. For compliance, you want to KNOW what gets caught." |

---

### 3.6 Teleskope.ai

**Type:** Data Privacy Platform  
**Pricing:** Enterprise custom  
**Threat Level:** 🟡 Medium (enterprise segment)

#### Overview

Comprehensive data privacy platform with Zendesk connector. Multiple redaction methods including encryption with referential integrity.

#### Strengths

- Sophisticated redaction options (mask, encrypt, fake data)
- Referential integrity for encrypted data
- Policy Maker for configurable rules
- Handles phone/address/CC in tickets/comments/attachments
- Documentation at docs.teleskope.ai

#### Weaknesses (Our Opportunities)

| Weakness                        | Our Advantage                     |
| ------------------------------- | --------------------------------- |
| No Zendesk Marketplace presence | We're discoverable in Marketplace |
| Enterprise-focused              | SMB-friendly                      |
| Requires platform buy-in        | Single-purpose tool               |
| Complex implementation          | 5-minute install                  |
| No public pricing               | $499/mo transparent               |
| Sales process required          | Self-serve                        |

#### How to Beat Teleskope

> "Install in 5 minutes, not 5 weeks of implementation"

#### Messaging Against Teleskope

| Scenario             | Message                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Evaluating Teleskope | "Teleskope is great for enterprise data privacy programs. We're for teams who just need Zendesk redaction." |
| Platform concern     | "No platform buy-in required. Just the Zendesk DLP you need, nothing you don't."                            |

---

### 3.7 OpenRedaction

**Type:** Open Source Tool  
**Pricing:** Free (MIT license), optional paid AI-assist API  
**Threat Level:** 🟢 Low (developer audience)

#### Overview

Open-source, regex-first PII redaction with 500+ patterns. CLI-focused, developer-oriented. Zero data retention by design.

#### Strengths

- Free and open source (MIT)
- 500+ regex patterns
- Self-hostable
- Zero data retention
- Local processing
- npm install available
- Optional AI-assist API for unstructured text

#### Weaknesses (Our Opportunities)

| Weakness                      | Our Advantage             |
| ----------------------------- | ------------------------- |
| No Zendesk integration        | Native Zendesk sidebar    |
| CLI-focused (developers only) | Agent-friendly UI         |
| Requires technical setup      | Zero-code install         |
| No sidebar app                | Native Zendesk experience |
| No support/SLA                | Professional support      |

#### How to Beat OpenRedaction

> "OpenRedaction's patterns + Zendesk sidebar + zero setup = NymAI"

#### Messaging Against OpenRedaction

| Scenario                          | Message                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| "Why not just use OpenRedaction?" | "Great patterns! But can your support agents run CLI commands? We wrap it in a Zendesk sidebar."  |
| OSS preference                    | "Our core engine is also auditable. We just added the Zendesk app so agents can actually use it." |

---

### 3.8 Nightfall AI

**Type:** Enterprise DLP Platform  
**Pricing:** Custom (estimated $50k+/year, median $23k/year)  
**Threat Level:** 🟡 Medium (different segment)

#### Overview

The "800-pound gorilla" of enterprise DLP. ML-powered with 95%+ claimed precision. Multi-platform coverage.

#### Strengths

- $60M+ raised, well-established
- 95%+ detection precision (ML-powered)
- Broad platform coverage
- Strong enterprise brand
- SOC 2, ISO 27001 certified
- Strong GenAI protection story

#### Weaknesses (Our Opportunities)

| Weakness                      | Our Advantage        |
| ----------------------------- | -------------------- |
| Enterprise pricing ($50k+/yr) | $6k-$24k/yr          |
| Stores data for ML training   | Ephemeral processing |
| Enterprise sales cycle        | Self-serve           |
| Overkill for SMBs             | Right-sized          |
| Cloud-dependent               | Works anywhere       |

#### How to Beat Nightfall

> "Nightfall precision at SMB prices, with ephemeral processing"

#### Messaging Against Nightfall

| Scenario            | Message                                                                               |
| ------------------- | ------------------------------------------------------------------------------------- |
| Got Nightfall quote | "We're ~10x cheaper. And unlike Nightfall, we never store your data for ML training." |
| Precision concern   | "We hit 90%+ on SSN/CC. For most use cases, you don't need 95%+ at 10x the price."    |

---

### 3.9 Metomic

**Type:** SaaS Data Discovery  
**Pricing:** Custom (median $11k/year, range $6.7K-$27K)  
**Threat Level:** 🟢 Low (detection-only)

#### Overview

SaaS data discovery platform that finds PII across apps. Detection-focused, not redaction-focused.

#### Strengths

- Broad SaaS coverage
- Discovery and classification
- Compliance workflows
- Reasonable mid-market pricing

#### Weaknesses (Our Opportunities)

| Weakness                      | Our Advantage         |
| ----------------------------- | --------------------- |
| Detection-only (no redaction) | Detection + redaction |
| Broader platform              | Zendesk-specialized   |
| Still needs sales process     | Self-serve            |

#### How to Beat Metomic

> "We don't just find PII—we redact it. In one click."

---

## 4. 10x Positioning Framework

### Our Unique 10x Advantages

#### 1. The "Complete SMB Package"

We're the ONLY option that combines:

- ✅ Text + attachment scanning in ONE app
- ✅ Public, self-serve pricing ($499-$899)
- ✅ Ephemeral processing (no data stored)
- ✅ Agent-facing sidebar (not just automation)
- ✅ Preview + Undo workflow

**No competitor has all five.**

#### 2. The "Ephemeral Trust" Story

Every competitor either:

- Stores data for ML training (Strac, Nightfall, eesel)
- Doesn't address data handling (most others)
- Is developer-only (OpenRedaction)

**Our narrative:** "The only Zendesk DLP that forgets. Your PII exists for 500ms, then it's gone."

This resonates with:

- Privacy-conscious buyers
- GDPR data minimization requirements
- Security teams wary of third-party data storage

#### 3. The "No Sales Call" Wedge

Strac and Teleskope require enterprise sales cycles. We don't.

**Tactical advantage:**

- Prospect gets Strac quote → sticker shock → searches for alternatives
- We capture that search traffic
- Install same day, not same quarter

#### 4. The "One App, Not Two" Simplicity

Redact Attachments + AI Ticket Redaction = two apps to manage.
Redacto = attachments only, need another for text.

**Our message:** "Why juggle two apps when one does both?"

### 10x vs. Each Competitor Type

| Competitor Type                                   | Their Model                   | Our Model                  | Why We're 10x                      |
| ------------------------------------------------- | ----------------------------- | -------------------------- | ---------------------------------- |
| **Enterprise DLP** (Strac, Nightfall)             | Stores data; enterprise sales | Ephemeral; self-serve      | SMBs priced out of them come to us |
| **Attachment-only** (Redact Attachments, Redacto) | Single capability             | Unified text + attachments | "Why use two apps?"                |
| **AI Assistants** (eesel)                         | PII is a feature              | PII is the product         | Purpose-built wins trust           |
| **Native** (ADPP)                                 | Forward-only; 5 patterns      | All data; extensible       | Complement, not compete            |
| **Open Source** (OpenRedaction)                   | Developer CLI                 | Agent-friendly sidebar     | Same patterns, better UX           |
| **Platforms** (Teleskope)                         | 5-week implementation         | 5-minute install           | Faster time-to-value               |

---

## 5. Competitive Messaging Playbook

### Quick Reference: One-Liner Against Each

| Competitor             | One-Liner                                                  |
| ---------------------- | ---------------------------------------------------------- |
| **ADPP**               | "ADPP only scans new data. We scan everything."            |
| **Strac**              | "Strac without the sales call, without storing your data." |
| **Redact Attachments** | "One app for text AND attachments."                        |
| **Redacto**            | "Preview before you redact. Undo if you're wrong."         |
| **eesel AI**           | "Purpose-built for compliance, not an AI assistant."       |
| **Teleskope**          | "5-minute install, not 5-week implementation."             |
| **OpenRedaction**      | "Same patterns. Agent-friendly sidebar."                   |
| **Nightfall**          | "90%+ precision at 10% of the price."                      |

### Detailed Messaging Scripts

#### When Prospect Mentions Strac

**Discovery question:** "What drew you to Strac? What's their timeline looking like?"

**Positioning:**

> "Strac's great if you have the budget and timeline for enterprise DLP. Most of our customers were evaluating Strac but found:
>
> 1. The sales process took 6+ weeks
> 2. Pricing was $10k+ annually
> 3. They store your original PII in a vault
>
> We're $499/month, install today, and we never store your data. For a team your size, that's usually a better fit."

#### When Prospect Says "We Use ADPP"

**Discovery question:** "How's ADPP working for you? Any gaps you've noticed?"

**Positioning:**

> "ADPP is solid for new data. Two things to consider:
>
> 1. It's forward-looking only—doesn't scan historical tickets
> 2. Zendesk stores the detected values
>
> We complement ADPP by scanning all data including history, and our ephemeral model means we never store PII. Different architecture for different use cases."

#### When Prospect Mentions "Free" Alternatives

**Discovery question:** "Which free option are you looking at? Redact Attachments?"

**Positioning:**

> "Those free tools are great for specific use cases. The gap is:
>
> - Redact Attachments only handles attachments, not ticket text
> - You'd need a second app for text redaction
>
> For $499/month, you get everything unified: text, attachments, preview, undo, and proper audit logs. Most teams find the unified workflow worth it."

### Objection Handling Matrix

| Objection                     | Category   | Response                                                                                                                                                                                 |
| ----------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "You're just regex"           | Technical  | "Yes, and that's a feature. Regex is predictable and auditable. For compliance, you want to KNOW what gets caught. ML is a black box."                                                   |
| "Nightfall has 95% precision" | Technical  | "We hit 90%+ on SSN/CC—the patterns that matter most. The 5% difference isn't worth 10x the price for most teams."                                                                       |
| "We need SOC 2"               | Compliance | "Our ephemeral architecture means a breach exposes only metadata, not PII. That satisfies most SMB security requirements. If SOC 2 is mandatory, Nightfall or Strac may be better fits." |
| "Can we get a discount?"      | Pricing    | "Our pricing is transparent and already 10x cheaper than enterprise alternatives. We don't negotiate, but we do offer 2 months free on annual plans."                                    |
| "We'll build it ourselves"    | DIY        | "You could! OpenRedaction is a great starting point. Most teams find the Zendesk integration, sidebar UI, and ongoing maintenance worth the $499/month."                                 |

---

## 6. Defensive Positioning

### Threats to Monitor

| Threat                             | Likelihood | Impact   | Early Warning                        | Response                               |
| ---------------------------------- | ---------- | -------- | ------------------------------------ | -------------------------------------- |
| **ADPP adds historical scanning**  | Medium     | High     | Zendesk changelog                    | Emphasize ephemeral; consider Step 3   |
| **ADPP adds ephemeral mode**       | Low        | Critical | Zendesk changelog                    | Accelerate Step 3 pivot                |
| **Strac launches SMB tier**        | Medium     | High     | Strac pricing page; YC announcements | Compete on ephemeral + speed           |
| **Nightfall drops prices**         | Low        | Medium   | Nightfall website                    | Compete on ephemeral + self-serve      |
| **New YC competitor**              | Medium     | Medium   | YC batch announcements               | Move fast; establish before they scale |
| **OpenRedaction adds Zendesk app** | Low        | Medium   | GitHub activity                      | Compete on support + polish            |

### If ADPP Improves Significantly

**Trigger:** ADPP announces both historical scanning AND ephemeral processing

**Response:**

1. Immediately message existing customers with differentiation (pattern breadth, attachment OCR)
2. Accelerate Step 3 development (VS Code, CLI, MCP)
3. Position as "ADPP + NymAI" complementary stack
4. If gap closes completely, pivot to developer tools

### If Strac Launches SMB Tier

**Trigger:** Strac announces pricing under $5k/year

**Response:**

1. Emphasize ephemeral processing (they still store data)
2. Emphasize speed (we're self-serve, they still have sales process)
3. Emphasize simplicity (we're Zendesk-only, they're multi-platform complexity)
4. Consider temporary pricing promotion

---

## 7. Win/Loss Scenarios

### When We Win

| Scenario                             | Why We Win               | Key Message                             |
| ------------------------------------ | ------------------------ | --------------------------------------- |
| **Strac sticker shock**              | $10k+ vs $499/mo         | "Enterprise protection at SMB prices"   |
| **ADPP gaps discovered**             | Forward-only, 5 patterns | "We scan everything, not just new data" |
| **Privacy-conscious buyer**          | Ephemeral processing     | "We never store your PII"               |
| **Speed matters**                    | 2-week vs 6-month cycle  | "Install today, not next quarter"       |
| **Using fragmented tools**           | One app vs two           | "One unified solution"                  |
| **Developer-friendly security lead** | Regex is auditable       | "Predictable, not black box"            |

### When We Lose

| Scenario                   | Why We Lose              | Accept or Fight?                  |
| -------------------------- | ------------------------ | --------------------------------- |
| **SOC 2 hard requirement** | We don't have it         | Accept — refer to Nightfall/Strac |
| **Multi-platform needed**  | We're Zendesk-only       | Accept — not our market           |
| **ML precision required**  | Legal/regulatory mandate | Accept — different use case       |
| **ADPP "good enough"**     | Free and native          | Fight — educate on gaps           |
| **Price too high**         | $499 vs $10 (Redacto)    | Fight — show value difference     |
| **Build in-house**         | Engineering resources    | Accept — offer consulting?        |

### Deal Qualification Criteria

**Strong fit (pursue aggressively):**

- [ ] 10-60 Zendesk agents
- [ ] Security lead/CISO is buyer
- [ ] Recent breach news triggered evaluation
- [ ] Failed security questionnaire recently
- [ ] Currently using ADPP and frustrated
- [ ] Got Strac/Nightfall quote and had sticker shock

**Weak fit (qualify carefully):**

- [ ] 60+ agents (may need SOC 2)
- [ ] Enterprise procurement process
- [ ] Multi-platform requirement
- [ ] IT Manager buyer (not security-focused)

**No fit (disqualify politely):**

- [ ] Hard SOC 2 requirement
- [ ] Need Slack/Salesforce/other platforms
- [ ] <10 agents (ADPP probably sufficient)
- [ ] 6-month procurement cycle

---

## 8. Win/Loss Tracking

### Win/Loss Log Template

Use this template to track competitive outcomes:

```markdown
### Deal: [Company Name]

**Date:** YYYY-MM-DD
**Outcome:** Won / Lost / No Decision
**Deal Size:** $X/month
**Agents:** X

**Competitors Evaluated:**

- [ ] Zendesk ADPP
- [ ] Strac
- [ ] Nightfall
- [ ] Redact Attachments
- [ ] Redacto
- [ ] eesel AI
- [ ] Teleskope
- [ ] Other: ****\_\_\_****

**Primary Decision Factor:**

- [ ] Price
- [ ] Features (specify: **\_\_\_**)
- [ ] Data handling (ephemeral)
- [ ] Speed of implementation
- [ ] Compliance/certification
- [ ] Native integration preferred
- [ ] Other: ****\_\_\_****

**Win Reason:** (if won)

---

**Loss Reason:** (if lost)

---

**Lessons Learned:**

---
```

### Quarterly Review Metrics

Track these metrics quarterly:

| Metric                      | Target | Q1  | Q2  | Q3  | Q4  |
| --------------------------- | ------ | --- | --- | --- | --- |
| Win rate vs. ADPP           | >50%   |     |     |     |     |
| Win rate vs. Strac          | >70%   |     |     |     |     |
| Win rate vs. Nightfall      | >80%   |     |     |     |     |
| Deals lost to "no decision" | <30%   |     |     |     |     |
| Deals disqualified (SOC 2)  | <20%   |     |     |     |     |
| Average sales cycle (days)  | <21    |     |     |     |     |

### Competitive Intelligence Capture

After every sales conversation, capture:

1. **Which competitors mentioned?**
2. **What did prospect say about them?**
3. **What objections came up?**
4. **What messaging resonated?**
5. **What messaging fell flat?**

Feed insights back into this document monthly.

---

## 9. Monitoring & Updates

### Weekly Monitoring Checklist

- [ ] Check Zendesk Marketplace for new DLP apps
- [ ] Check Strac website for pricing/feature changes
- [ ] Check Zendesk changelog for ADPP updates
- [ ] Search "Zendesk PII redaction" for new entrants

### Monthly Updates

- [ ] Review win/loss data for patterns
- [ ] Update competitor pricing if changed
- [ ] Add new competitors discovered
- [ ] Refine messaging based on sales feedback

### Quarterly Review

- [ ] Full competitive landscape reassessment
- [ ] Update threat matrix probabilities
- [ ] Review defensive positioning triggers
- [ ] Update this document version

### Information Sources

| Source                 | What to Monitor                   | Frequency |
| ---------------------- | --------------------------------- | --------- |
| Zendesk Marketplace    | New apps, reviews, install counts | Weekly    |
| Competitor websites    | Pricing, features, announcements  | Weekly    |
| G2/Capterra            | Reviews, ratings, comparisons     | Monthly   |
| YC batch announcements | New entrants                      | Quarterly |
| Zendesk changelog      | ADPP improvements                 | Weekly    |
| r/Zendesk, r/infosec   | User discussions                  | Weekly    |
| Google Alerts          | "Zendesk DLP", "Zendesk PII"      | Daily     |

---

## Document Maintenance

| Version | Date            | Changes                                   |
| ------- | --------------- | ----------------------------------------- |
| 1.0     | January 2, 2026 | Initial competitive intelligence document |

**Next Review:** February 2026 or after significant competitive move

---

**End of COMPETITIVE.md**

_Classification: INTERNAL ONLY_  
_Version: 1.0_  
_Last Updated: January 2, 2026_
