# ADMIN.md

**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Confidentiality:** Internal Use Only  
**Related Documents:** [VISION.md](./VISION.md), [ROADMAP.md](./ROADMAP.md), [project_spec.md](./project_spec.md)

---

## Table of Contents

1. [Business Stage](#1-business-stage)
2. [Legal Entity](#2-legal-entity)
3. [Administrative Stack](#3-administrative-stack)
4. [Intellectual Property](#4-intellectual-property)
5. [Bootstrapped Milestones](#5-bootstrapped-milestones)
6. [Compliance Requirements](#6-compliance-requirements)
7. [Key Contacts](#7-key-contacts)
8. [Annual Obligations](#8-annual-obligations)
9. [Decision Log](#9-decision-log)

---

## 1. Business Stage

### 1.1 Stairstep Position

NymAI follows Rob Walling's Stairstep Method:

| Step | Description | NymAI Status |
|------|-------------|--------------|
| Step 1 | One-time product; learn to ship | ✅ Complete (prior project) |
| **Step 2** | First SaaS; single surface; niche | 🎯 **Current Focus** |
| Step 3 | Expanded SaaS; multi-surface | ⏳ Optional (at $30k MRR) |
| Step 4 | VC-backed platform | ❌ Not pursuing |

### 1.2 Current Scope

| Dimension | Step 2 (Now) | Step 3 (Optional) |
|-----------|--------------|-------------------|
| **Surface** | Zendesk only | + VS Code, CLI, MCP |
| **ICP** | Security-aware teams, 10-60 agents | + DevSecOps leads |
| **Revenue Target** | $30k MRR (~60 customers) | $100k–$200k MRR |
| **ARPU** | ~$500/month | ~$500-$600/month |
| **Timeline** | Month 0–12 | Month 12–24 |
| **Team** | Solo | Solo + 1-2 contractors |
| **Entity** | LLC | LLC |

> **Why 10-60 agents?** Companies with 60+ agents typically have security teams, procurement processes, and SOC 2 requirements. Those deals trap solo founders in 6-month sales cycles. Our target market can purchase via credit card in 2 weeks.

### 1.3 What We're NOT Doing

- ❌ Raising venture capital
- ❌ Converting to C-Corp
- ❌ Targeting 60+ agent companies (SOC 2 trap)
- ❌ Building Slack/Teams/Salesforce integrations
- ❌ Enterprise sales team
- ❌ SOC 2 certification (target market doesn't require)
- ❌ Custom contracts or procurement processes
- ❌ Pursuing "platform" positioning

### 1.4 Exit Optionality

| Stage | Potential Exit | Likely Valuation |
|-------|----------------|------------------|
| Step 2 ($30k MRR) | Micro-PE acquisition | $1–2M |
| Step 3 ($100k MRR) | PE or strategic acquisition | $3–6M |
| Lifestyle | Keep indefinitely | $360k–$1.2M/year income |

---

## 2. Legal Entity

### 2.1 Entity Information

| Field | Value |
|-------|-------|
| **Legal Name** | NymAI LLC |
| **Entity Type** | Limited Liability Company |
| **Formation State** | Michigan |
| **Formation Date** | [TBD — upon incorporation] |
| **EIN** | [TBD — apply after formation] |
| **FEIN Application** | IRS Form SS-4 (online, same-day) |

> **Why Michigan LLC (not Delaware)?**
> - No VC investors = no Delaware expectation
> - Operating in Michigan = simpler (no foreign qualification)
> - Lower fees ($50 formation vs $90 Delaware + MI registration)
> - Pass-through taxation (no double tax)
> - Can convert to Delaware C-Corp later if ever needed

### 2.2 Formation Checklist

| Step | Action | Status | Cost |
|------|--------|--------|------|
| 1 | Search name availability (Michigan LARA) | ☐ Pending | Free |
| 2 | File Articles of Organization | ☐ Pending | $50 |
| 3 | Create Operating Agreement | ☐ Pending | Free (template) |
| 4 | Apply for EIN (IRS online) | ☐ Pending | Free |
| 5 | Open business bank account | ☐ Pending | Free |
| 6 | Register domain under LLC | ☐ Pending | ~$10/year |

### 2.3 Formation Documents

| Document | Location | Status |
|----------|----------|--------|
| Articles of Organization | [TBD] | Pending |
| Operating Agreement | [TBD] | Pending |
| EIN Confirmation (CP 575) | [TBD] | Pending |

### 2.4 Registered Agent

| Field | Value |
|-------|-------|
| **Agent** | [Your Name] or Northwest Registered Agent |
| **Address** | [Michigan address] |

> **Note:** You can be your own registered agent in Michigan if you have a physical address in the state. Third-party agents (~$100/year) provide privacy and reliability.

---

## 3. Administrative Stack

### 3.1 Banking & Finance

| Service | Provider | Account | Status |
|---------|----------|---------|--------|
| **Business Checking** | Mercury | [TBD] | ☐ Pending |
| **Business Card** | Mercury | [TBD] | ☐ Pending |

> **Why Mercury?**
> - Built for startups/solo founders
> - No fees, no minimums
> - Integrates with accounting tools
> - Can upgrade to Brex later if needed

**Alternative Options:**
- Relay (similar to Mercury)
- Novo (good for LLCs)
- Local credit union + Mercury (if you need cash deposits)

### 3.2 Domains & DNS

| Domain | Registrar | Expiry | Owner | Status |
|--------|-----------|--------|-------|--------|
| nymai.com | [Current?] | [Date] | [Personal → LLC] | ☐ Transfer pending |

**Post-Formation Actions:**
1. Transfer domain ownership to NymAI LLC
2. Move registration to Cloudflare Registrar (cheapest renewals)
3. Update WHOIS to business address

### 3.3 Email & Communication

| Service | Provider | Cost | Status |
|---------|----------|------|--------|
| **Business Email** | Google Workspace | $6/user/month | ☐ Pending |
| **Primary Address** | founder@nymai.com | — | ☐ Pending |
| **Security Contact** | security@nymai.com | — | ☐ Pending |
| **Support Contact** | support@nymai.com | — | ☐ Pending |

> **Why Google Workspace?**
> - Professional credibility with enterprise buyers
> - Familiar to customers
> - Integrates with everything

### 3.4 Infrastructure Accounts

All accounts should be created with business email and owned by the LLC:

| Service | Purpose | Account Owner | Status |
|---------|---------|---------------|--------|
| **GitHub** | Source control, CI/CD | NymAI LLC | ☐ Create org |
| **Render** | API hosting | NymAI LLC | ☐ Pending |
| **Supabase** | Database | NymAI LLC | ☐ Pending |
| **Vercel** | Admin console | NymAI LLC | ☐ Pending |
| **Cloudflare** | DNS, CDN | NymAI LLC | ☐ Pending |
| **npm** | Package registry | NymAI LLC | ☐ Create org |
| **Zendesk Marketplace** | Distribution | NymAI LLC | ☐ Developer account |
| **VS Code Marketplace** | Distribution (Step 3) | NymAI LLC | ⏸ Later |
| **Chrome Web Store** | Distribution (Step 3) | NymAI LLC | ⏸ Later |

### 3.5 Business Tools

| Category | Service | Cost | Status |
|----------|---------|------|--------|
| **Accounting** | Wave (free) or Bench ($150/mo) | Free–$150/mo | ☐ Pending |
| **Invoicing** | Stripe Billing | 2.9% + $0.30 | ☐ Pending |
| **Payments** | Stripe | 2.9% + $0.30 | ☐ Pending |
| **Legal (templates)** | Clerky or Shake | Free–$100 | ☐ As needed |
| **Tax Prep** | Local CPA | ~$500/year | ☐ Annual |

> **Accounting Note:** Wave is free and sufficient for Step 2. Upgrade to Bench or Pilot when revenue exceeds $20k MRR or complexity increases.

### 3.6 Monthly Costs (Projected)

| Service | Monthly Cost |
|---------|--------------|
| Google Workspace | $6 |
| Render (Pro) | $25 |
| Supabase (Pro) | $25 |
| Vercel (Pro) | $20 |
| Cloudflare (Free) | $0 |
| Domain renewal | ~$1 |
| **Total** | **~$77/month** |

*Note: All services have free tiers sufficient for MVP. Pro tiers listed for growth phase.*

---

## 4. Intellectual Property

### 4.1 IP Ownership Declaration

> **All intellectual property related to NymAI, including but not limited to source code, documentation, designs, trade secrets, and trademarks, is owned exclusively by NymAI LLC, a Michigan limited liability company.**

### 4.2 Scope of IP

| Asset | Type | Owner | Notes |
|-------|------|-------|-------|
| Detection engine | Trade secret / Software | NymAI LLC | Core algorithms |
| `@nymai/core` | Software | NymAI LLC | MIT license planned |
| `@nymai/cli` | Software | NymAI LLC | MIT license planned |
| `@nymai/mcp-server` | Software | NymAI LLC | MIT license planned |
| Zendesk App | Software | NymAI LLC | Proprietary |
| Admin Console | Software | NymAI LLC | Proprietary |
| NymAI name | Trademark (common law) | NymAI LLC | Consider USPTO filing |
| NymAI logo | Trademark (common law) | NymAI LLC | Upon creation |
| Documentation | Copyright | NymAI LLC | All docs |

### 4.3 Pre-Formation IP Assignment

Since code is being written before LLC formation:

| Requirement | Action | Status |
|-------------|--------|--------|
| Document pre-formation work | Maintain git history with personal commits | ✅ Ongoing |
| Assignment to LLC | Sign IP Assignment Agreement upon formation | ☐ Pending |
| Founder contribution | Contribute IP in exchange for 100% membership | ☐ Pending |

**IP Assignment Template** (sign upon formation):

```
ASSIGNMENT OF INTELLECTUAL PROPERTY

I, [Your Legal Name], hereby assign to NymAI LLC all right, title, and 
interest in and to any intellectual property I created prior to the 
formation of NymAI LLC that relates to the NymAI project, including 
but not limited to:

- All source code in the NymAI repositories
- All documentation, designs, and specifications
- All trade secrets and proprietary methods

This assignment is made in consideration of my 100% membership interest 
in NymAI LLC.

Signed: _______________________
Date: _______________________
```

### 4.4 Contributor IP (Future)

When hiring contractors or accepting contributions:

| Contributor Type | Required Agreement |
|------------------|-------------------|
| **Contractor** | Contractor Agreement with IP assignment clause |
| **Open Source (CLA)** | Contributor License Agreement for public repos |

> **Rule:** No code from anyone else enters the codebase without a signed agreement assigning IP to NymAI LLC.

### 4.5 Trademark Status

| Mark | Type | Status | Action |
|------|------|--------|--------|
| NymAI | Word mark | Common law (unregistered) | Consider USPTO Class 42 filing (~$350) |
| NymAI Logo | Design mark | Not created | Design, then file |

> **USPTO Filing:** Not urgent for Step 2. Consider filing when revenue exceeds $10k MRR to protect the brand before it's valuable.

---

## 5. Bootstrapped Milestones

### 5.1 Step 2 Milestones (Month 0–12)

| Milestone | Target | Timeline | Status |
|-----------|--------|----------|--------|
| LLC formed | Entity exists | Month 0 | ☐ Pending |
| MVP launched | Working Zendesk app | Month 2 | ☐ Pending |
| First paying customer | $299-$499 MRR | Month 3 | ☐ Pending |
| Validation | 10 paying customers | Month 4 | ☐ Pending |
| Traction | $5k MRR (~12 customers) | Month 6 | ☐ Pending |
| Momentum | $15k MRR (~35 customers) | Month 9 | ☐ Pending |
| Step 2 Complete | $30k MRR (~60 customers) | Month 12 | ☐ Pending |

### 5.2 Step 2 → Step 3 Decision Criteria

**Expand to Step 3 when ALL of these are true:**

| Criterion | Threshold | Rationale |
|-----------|-----------|-----------|
| Zendesk MRR | ≥ $30k sustained (3+ months) | Proves PMF |
| Customers | ~60 paying workspaces | Volume validates market |
| Churn | < 5% monthly | Retention validated |
| Support burden | < 10 hrs/week | Capacity for expansion |
| Customer requests | Dev tools demand from existing customers | Pull, not push |
| Personal readiness | Want to grow (not just income) | Lifestyle check |

### 5.3 Step 3 Milestones (Month 12–24) — OPTIONAL

| Milestone | Target | Timeline | Status |
|-----------|--------|----------|--------|
| VS Code extension | Published | Month 14 | ⏸ Future |
| CLI + MCP | Published | Month 15 | ⏸ Future |
| First dev tool revenue | $5k MRR | Month 16 | ⏸ Future |
| Combined revenue | $100k MRR | Month 24 | ⏸ Future |

### 5.4 Anti-Goals

Things we explicitly avoid:

| Anti-Goal | Why |
|-----------|-----|
| Raising VC | Misaligned incentives; forces Step 4 |
| Targeting 60+ agent companies | SOC 2 trap; 6-month sales cycles |
| Hiring full-time employees | Fixed costs; complexity |
| Enterprise sales team | Long cycles; high CAC |
| SOC 2 certification | Target market (10-60 agents) doesn't require it |
| Custom contracts / procurement | Kills solo founder velocity |
| Multi-surface before PMF | Distraction from core validation |

---

## 6. Compliance Requirements

### 6.1 Bootstrapped Compliance (Minimal Viable)

| Requirement | Priority | Status | Notes |
|-------------|----------|--------|-------|
| **Privacy Policy** | 🔴 Required | ☐ Pending | Required for Zendesk Marketplace |
| **Terms of Service** | 🔴 Required | ☐ Pending | Required for Zendesk Marketplace |
| **DPA Template** | 🟡 Important | ☐ Pending | Enterprise customers will ask |
| **Cookie Policy** | 🟡 Important | ☐ Pending | If admin console uses cookies |
| **Security Overview** | 🟢 Nice-to-have | ✅ Created | Builds trust (we have this) |

### 6.2 What We're NOT Doing

| Compliance Item | Status | Rationale |
|-----------------|--------|-----------|
| SOC 2 Type I | ❌ Not planned | Target market (10-60 agents) doesn't require |
| SOC 2 Type II | ❌ Not planned | Target market doesn't require |
| HIPAA BAA | ✅ Available on request | Template ready |
| ISO 27001 | ❌ Not planned | Overkill for target market |
| PCI-DSS | ❌ Not applicable | We don't store card numbers |

> **SOC 2 Policy:** Companies requiring SOC 2 typically have 60+ agents and are outside our target market. We refer them to Nightfall or Strac instead of pursuing certifications that don't match our market position.

### 6.3 Regulatory Alignment (Inherent)

Our architecture naturally aligns with privacy regulations:

| Regulation | How We Align | Documentation |
|------------|--------------|---------------|
| GDPR | Ephemeral processing; no PII storage | Privacy Policy + DPA |
| CCPA | No sale of data; deletion supported | Privacy Policy |
| State Privacy Laws | Data minimization | Privacy Policy |

### 6.4 Zendesk Marketplace Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Privacy Policy URL | ☐ Pending | Must be public URL |
| Terms of Service URL | ☐ Pending | Must be public URL |
| Support email | ☐ Pending | support@nymai.com |
| Security questionnaire | ☐ Pending | Basic questions during review |
| App review | ☐ Pending | 2-4 weeks typically |

---

## 7. Key Contacts

| Role | Name | Email | Notes |
|------|------|-------|-------|
| **Founder** | [Your Name] | founder@nymai.com | Primary contact |
| **Registered Agent** | [TBD] | — | Michigan address |
| **CPA** | [TBD] | — | Find local; ~$500/year |
| **Legal** | [TBD] | — | As-needed basis |

### 7.1 Recommended Professional Services

| Service | When to Engage | Budget |
|---------|----------------|--------|
| **CPA** | Before first tax filing | $500–$1k/year |
| **Startup Lawyer** | If raising money (Step 4 only) | $2–5k |
| **Contract Lawyer** | First enterprise customer with redlines | $500–$1k |
| **Trademark Attorney** | If filing USPTO | $500–$1k |

---

## 8. Annual Obligations

### 8.1 Michigan LLC Requirements

| Requirement | Due Date | Cost | Status |
|-------------|----------|------|--------|
| Annual Statement | Feb 15 | $25 | ☐ Annual |

> **Note:** Michigan LLCs only require an annual statement. No franchise tax.

### 8.2 Federal Requirements

| Requirement | Due Date | Cost | Status |
|-------------|----------|------|--------|
| Form 1065 (Partnership Return) | March 15 | $0 (file) | ☐ Annual |
| Schedule K-1 (to members) | March 15 | $0 | ☐ Annual |
| Quarterly Estimated Taxes | 4/15, 6/15, 9/15, 1/15 | Varies | ☐ Quarterly |

> **Single-Member LLC Note:** If you're the only member, the LLC is "disregarded" for tax purposes. You report on Schedule C of your personal return instead of Form 1065. Consult your CPA.

### 8.3 Ongoing Compliance Calendar

| Month | Task |
|-------|------|
| **January** | Q4 estimated taxes (15th); prep for annual filings |
| **February** | Michigan Annual Statement (15th) |
| **March** | Federal tax filing (15th for 1065; personal by April 15) |
| **April** | Q1 estimated taxes (15th) |
| **June** | Q2 estimated taxes (15th) |
| **September** | Q3 estimated taxes (15th) |
| **December** | Year-end bookkeeping; prep for tax season |

---

## 9. Decision Log

Track major business decisions for future reference:

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| 2025-12-30 | Bootstrapped path (Step 2 → 3) | Solo founder; sustainable; optionality | — |
| 2025-12-30 | Michigan LLC (not Delaware C-Corp) | No VC; simpler; cheaper; can convert later | — |
| 2025-12-30 | Zendesk-first focus | Clear buyer; marketplace distribution; PMF focus | — |
| [Date] | [Decision] | [Rationale] | [Outcome] |

---

## Appendix A: Formation Resources

### Michigan LLC Formation

- **File Online:** [Michigan LARA](https://cofs.lara.state.mi.us/corpweb/CorpSearch/CorpSearch.aspx)
- **Cost:** $50
- **Timeline:** 1-2 business days (online)
- **What You Need:**
  - LLC name (search availability first)
  - Registered agent name and address
  - Organizer name and address

### Operating Agreement Template

For single-member Michigan LLC, a simple operating agreement covers:
- Member name and ownership (100%)
- Management structure (member-managed)
- Capital contributions
- Profit/loss allocation
- Dissolution procedures

Free templates available from:
- Northwest Registered Agent
- LegalZoom (free template)
- Rocket Lawyer

### EIN Application

- **Apply Online:** [IRS EIN Assistant](https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online)
- **Cost:** Free
- **Timeline:** Immediate (online)
- **When:** After Articles of Organization are filed

---

## Appendix B: Account Setup Checklist

### Immediate (Post-Formation)

| Priority | Account | Action |
|----------|---------|--------|
| 1 | EIN | Apply online at IRS |
| 2 | Mercury | Open business checking |
| 3 | Google Workspace | Set up founder@nymai.com |
| 4 | GitHub Organization | Create @nymai org |
| 5 | Stripe | Set up for payments |

### Before MVP Launch

| Priority | Account | Action |
|----------|---------|--------|
| 6 | Cloudflare | Transfer domain; set up DNS |
| 7 | Render | Create account for API hosting |
| 8 | Supabase | Create account for database |
| 9 | Vercel | Create account for admin console |
| 10 | Zendesk Developer | Register for Marketplace |

### Before First Customer

| Priority | Account | Action |
|----------|---------|--------|
| 11 | Wave/Bench | Set up accounting |
| 12 | Privacy Policy | Publish to website |
| 13 | Terms of Service | Publish to website |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 30, 2025 | Initial version — bootstrapped LLC structure |

---

**End of ADMIN.md**

*Version: 1.0*  
*Last Updated: December 30, 2025*  
*Next Review: Upon LLC formation*
