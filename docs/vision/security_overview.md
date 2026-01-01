# NymAI Security Overview

**Version:** 2.1 (Bootstrapped Path)  
**Audience:** CISOs, Security Teams, Procurement, Compliance Officers  
**Last Updated:** December 30, 2025  
**Related Documents:** [project_spec.md](./project_spec.md), [VISION.md](./VISION.md), [ROADMAP.md](./ROADMAP.md), [ADMIN.md](./ADMIN.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Handling by Surface](#3-data-handling-by-surface)
4. [Security Controls](#4-security-controls)
5. [Threat Model](#5-threat-model)
6. [Breach Impact Analysis](#6-breach-impact-analysis)
7. [Compliance & Certifications](#7-compliance--certifications)
8. [Data Residency & Sovereignty](#8-data-residency--sovereignty)
9. [Third-Party Dependencies](#9-third-party-dependencies)
10. [Supply Chain Security](#10-supply-chain-security)
11. [Incident Response](#11-incident-response)
12. [Security Testing & Verification](#12-security-testing--verification)
13. [Vulnerability Disclosure](#13-vulnerability-disclosure)
14. [FAQ for Security Teams](#14-faq-for-security-teams)
15. [Appendix A: Data Flow Diagrams](#appendix-a-data-flow-diagrams)
16. [Appendix B: API Security Reference](#appendix-b-api-security-reference)

---

## 1. Executive Summary

### What NymAI Does

NymAI detects and redacts sensitive data (PII, secrets, credentials) across multiple surfaces—support tickets, code, browsers, and AI agents—before it becomes a liability.

### Key Security Differentiator

**Ephemeral & Local-First Processing**

| Processing Model | Surfaces | Data Sent to NymAI |
|-----------------|----------|-------------------|
| **Local-Only** | VS Code, CLI, Chrome Extension, MCP Server | ❌ None (runs on your machine) |
| **Server-Side** | Zendesk, Slack, Teams, Salesforce | ✅ Ephemeral only (<500ms in memory) |

Unlike traditional DLP vendors that store customer data to train models, NymAI:
- **Never stores raw content** — metadata only
- **Prefers local processing** — no server dependency where possible
- **Clears memory immediately** — <500ms processing time for server-side

### Security Posture Summary

| Dimension | NymAI Approach |
|-----------|---------------|
| Data Storage | Metadata only; no raw PII/secrets stored |
| Processing Model | Ephemeral (server) or local-only (client) |
| Encryption | TLS 1.3 in transit; AES-256 at rest |
| Authentication | OAuth 2.0 / API keys per surface |
| Compliance | GDPR/CCPA aligned; SOC 2 on customer demand |
| Open Source | Core engine (`@nymai/core`) is auditable |

---

## 2. Architecture Overview

### 2.1 Core Engine (`@nymai/core`)

The detection/redaction engine is a standalone TypeScript package that runs anywhere:

```
┌─────────────────────────────────────────────────────────────┐
│                    @nymai/core                              │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│  │  detect()   │   │  redact()   │   │  validate() │      │
│  └─────────────┘   └─────────────┘   └─────────────┘      │
│                                                             │
│  • Zero runtime dependencies                                │
│  • Works in Node.js, browsers, edge runtimes               │
│  • Regex-based detection (no ML model, no training data)   │
│  • Open source and auditable                               │
└─────────────────────────────────────────────────────────────┘
```

**Security Properties:**
- No network calls
- No persistent storage
- No telemetry or analytics
- Deterministic behavior (same input → same output)
- No external dependencies to compromise

### 2.2 Processing Models

NymAI supports two processing models:

#### Local Processing (Client-Side)

```
┌──────────────────┐     ┌──────────────────┐
│   User Device    │     │   NymAI Servers  │
│                  │     │                  │
│  ┌────────────┐  │     │                  │
│  │ @nymai/core│  │     │   (not used)     │
│  │            │  │     │                  │
│  │ detect()   │  │ ──X─┤                  │
│  │ redact()   │  │     │                  │
│  └────────────┘  │     │                  │
│                  │     │                  │
│  Data never      │     │                  │
│  leaves device   │     │                  │
└──────────────────┘     └──────────────────┘
```

**Surfaces:** VS Code Extension, CLI, Chrome Extension (free tier), MCP Server

**Security Guarantee:** Zero data transmission to NymAI infrastructure.

#### Server Processing (API-Based)

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Client App     │     │   NymAI API      │     │   Database   │
│   (Zendesk)      │     │                  │     │   (Supabase) │
│                  │     │  ┌────────────┐  │     │              │
│  User clicks     │────▶│  │ IN MEMORY  │  │     │  Metadata    │
│  "Redact"        │ TLS │  │ ONLY       │  │────▶│  only        │
│                  │ 1.3 │  │ <500ms     │  │     │  (no PII)    │
│  ◀────────────── │     │  └────────────┘  │     │              │
│  Redacted text   │     │                  │     │              │
└──────────────────┘     └──────────────────┘     └──────────────┘
```

**Surfaces:** Zendesk, Slack, Teams, Salesforce, Jira

**Security Guarantee:** Raw content held in memory <500ms, then cleared. Only metadata logged.

### 2.3 Deployment Models

| Model | Description | Use Case |
|-------|-------------|----------|
| **SaaS (Default)** | NymAI-hosted API | Most customers |
| **Local-Only** | No server component | Privacy-sensitive dev tools |
| **Self-Hosted** | Customer-hosted API | Regulated industries (Phase 4) |
| **Hybrid** | Local processing + cloud dashboard | Enterprise teams |

---

## 3. Data Handling by Surface

### 3.1 Summary Matrix

| Surface | Processing | Data Sent to NymAI | Stored | Auth Method |
|---------|------------|-------------------|--------|-------------|
| **Zendesk** | Server | Ticket text (ephemeral) | Metadata only | Zendesk OAuth |
| **VS Code** | Local | None (default) | None | None (local) |
| **CLI** | Local | None (default) | None | None (local) |
| **MCP Server** | Local | None | None | None (local) |
| **Chrome Extension** | Local | None (free) | None | None (free) |
| **GenAI Protection** | Server | Prompt text (ephemeral) | Metadata only | SSO/API key |
| **Slack** | Server | Message text (ephemeral) | Metadata only | Slack OAuth |
| **Teams** | Server | Message text (ephemeral) | Metadata only | MS Graph |

### 3.2 Zendesk Integration

**Data Flow:**

```
Agent clicks "Redact" in Zendesk sidebar
    ↓
Ticket text sent to NymAI API (TLS 1.3)
    ↓
Text held IN MEMORY ONLY
    ↓
Detection runs (~50-200ms)
    ↓
Masked version generated
    ↓
Metadata logged: { ticket_id, data_types, agent, timestamp }
    ↓
Redacted text sent back to sidebar
    ↓
Agent confirms → Zendesk ticket updated
    ↓
RAW TEXT CLEARED FROM MEMORY

Total time in memory: <500ms typical, <2s max
```

**What We Store:**

```json
{
  "log_id": "uuid",
  "workspace_id": "ws_123",
  "ticket_id": "12345",
  "data_types": ["SSN", "EMAIL"],
  "count": { "SSN": 1, "EMAIL": 2 },
  "agent_id": "alice",
  "action": "redacted",
  "timestamp": "2025-12-30T14:22:15Z"
}
```

**What We Never Store:**
- Original ticket text
- Detected sensitive values
- Customer names or contact information
- Attachments or file contents

### 3.3 VS Code Extension & CLI

**Processing Model:** 100% Local

**Security Properties:**
- Detection runs entirely on developer's machine
- No network calls to NymAI servers
- No telemetry or usage tracking
- Works fully offline

**Optional Enterprise Features:**
- Team dashboard (requires opt-in metadata sharing)
- Centralized policy (requires API connection)
- Audit logs (requires API connection)

**Data Flow (Local Mode):**

```
Developer runs "NymAI: Scan File"
    ↓
@nymai/core runs locally
    ↓
Results displayed in VS Code
    ↓
NO DATA LEAVES THE MACHINE
```

**Data Flow (Enterprise Mode):**

```
Developer runs scan
    ↓
@nymai/core runs locally
    ↓
Results displayed locally
    ↓
OPTIONAL: Metadata sent to NymAI dashboard
    ↓
{ file_hash, data_types, timestamp } — NO FILE CONTENT
```

### 3.4 MCP Server (AI Agents)

**Processing Model:** 100% Local

The MCP server exposes two tools to AI agents:

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `detect_pii` | Scan text for sensitive data | Text string | Findings array |
| `redact_pii` | Mask sensitive data | Text string | Redacted text + findings |

**Security Properties:**
- Runs as local process on developer machine
- No external network calls
- Sub-10ms latency (no network overhead)
- Agent cannot exfiltrate data through NymAI

**Threat Considerations:**

| Threat | Mitigation |
|--------|------------|
| Compromised agent sends PII to NymAI | Local processing — no data sent |
| Agent ignores redaction and uses original | Agent's responsibility; NymAI provides tools |
| MCP server logs sensitive data | No logging in MCP server; stateless |

**Configuration Example (Claude Desktop):**

```json
{
  "mcpServers": {
    "nymai": {
      "command": "npx",
      "args": ["@nymai/mcp-server"],
      "env": {
        "NYMAI_MODE": "local"
      }
    }
  }
}
```

### 3.5 Chrome Extension

**Two-Tier Model:**

| Tier | Processing | Features | Data to NymAI |
|------|------------|----------|---------------|
| **Free** | Local only | SSN + CC detection; clipboard scanning | None |
| **Enterprise** | Local + sync | All data types; MDM deployment; audit logs | Metadata only |

**Free Tier Security:**
- All detection runs in browser
- No NymAI account required
- No data transmitted
- Manifest V3 (sandboxed, minimal permissions)

**Enterprise Tier Security:**
- Detection still runs locally
- Metadata synced to dashboard for audit
- MDM deployment (Jamf, Intune)
- Centralized policy configuration

**Permissions Required:**

```json
{
  "permissions": [
    "clipboardRead",
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*"
  ]
}
```

### 3.6 GenAI Prompt Protection (Enterprise)

**Purpose:** Intercept PII/secrets before they reach AI services.

**Processing Model:** Server-side with ephemeral processing

**Data Flow:**

```
User pastes text into ChatGPT/Claude
    ↓
Chrome extension intercepts (local detection first)
    ↓
If PII detected → warning displayed
    ↓
User chooses: Allow / Redact / Block
    ↓
If Redact: text sent to NymAI API for consistent masking
    ↓
Redacted text returned
    ↓
Metadata logged for audit trail
    ↓
Original text NEVER stored
```

**Audit Log Example:**

```json
{
  "event_id": "uuid",
  "user_id": "user@company.com",
  "destination": "chat.openai.com",
  "data_types_detected": ["SSN", "API_KEY"],
  "action_taken": "redacted",
  "timestamp": "2025-12-30T14:22:15Z"
}
```

### 3.7 Collaboration Tools (Slack/Teams) — Planned

**Unique Security Feature:** Pre-send prevention

Unlike competitors that scan messages after send, NymAI intercepts before the message is visible to anyone.

**Data Flow:**

```
User types message in Slack
    ↓
NymAI bot validates in real-time
    ↓
If PII detected → warning before send
    ↓
User chooses: Send anyway / Redact / Cancel
    ↓
If sent: ephemeral processing for audit metadata
    ↓
Original message text NEVER stored by NymAI
```

---

## 4. Security Controls

### 4.1 Encryption

| Layer | Standard | Implementation |
|-------|----------|----------------|
| **In Transit** | TLS 1.3 | Enforced on all API endpoints |
| **At Rest** | AES-256 | Supabase default; metadata only |
| **Client Storage** | OS keychain | OAuth tokens stored securely |

**TLS Configuration:**
- Minimum TLS 1.2 (prefer 1.3)
- Strong cipher suites only
- HSTS enabled
- Certificate transparency

### 4.2 Authentication & Authorization

| Surface | Auth Method | Token Storage | Session Length |
|---------|-------------|---------------|----------------|
| **Zendesk App** | Zendesk OAuth 2.0 | ZAF secure storage | Zendesk-managed |
| **Admin Console** | Supabase Auth (OAuth) | httpOnly cookies | 7 days |
| **API (Enterprise)** | API keys | Customer-managed | No expiry (revocable) |
| **VS Code** | None (local) / API key | OS keychain | N/A |
| **Chrome** | None (free) / SSO | Browser storage | Session |

**Authorization Model:**

```
Workspace Admin
    ├── Configure detection types
    ├── View all workspace logs
    ├── Manage workspace settings
    └── Add/remove agents

Agent
    ├── Trigger redaction (if enabled)
    ├── View own activity
    └── Cannot change settings
```

### 4.3 Memory Handling

**Server-Side Processing:**

```typescript
async function processRedaction(text: string): Promise<RedactResult> {
  try {
    // Text exists only in function scope
    const findings = detect(text);
    const masked = redact(text, findings);
    
    // Log metadata only
    await logMetadata({
      dataTypes: findings.map(f => f.type),
      timestamp: new Date()
    });
    
    return { masked, findings };
  } finally {
    // Explicit clearing (defense in depth)
    text = null;
  }
}
```

**Guarantees:**
- No text written to disk
- No text in error logs
- No text in crash dumps (disabled in production)
- Garbage collection accelerated via explicit nulling

### 4.4 Logging & Monitoring

**What We Log:**

| Log Type | Content | Retention |
|----------|---------|-----------|
| Access logs | IP, timestamp, endpoint, status code | 30 days |
| Audit logs | User, action, resource, timestamp | 90 days (configurable) |
| Error logs | Error type, stack trace (sanitized) | 7 days |
| Detection metadata | Data types found, counts | Customer-configurable |

**What We Never Log:**
- Request bodies
- Response bodies
- Raw text content
- Detected PII values
- Authentication tokens

**Log Sanitization Example:**

```typescript
// Before sanitization
"Error processing text: 'John's SSN is 123-45-6789'"

// After sanitization
"Error processing text: '[REDACTED - 24 chars]'"
```

### 4.5 Rate Limiting & DoS Protection

| Endpoint | Limit | Window | Action |
|----------|-------|--------|--------|
| `/api/detect` | 100 | 1 minute | 429 response |
| `/api/redact` | 50 | 1 minute | 429 response |
| `/api/logs` | 30 | 1 minute | 429 response |
| Auth endpoints | 10 | 1 minute | Temporary block |

**DDoS Mitigation:**
- Render's built-in DDoS protection
- Geographic rate limiting available
- Customer-specific rate limits on request

---

## 5. Threat Model

### 5.1 What We Protect Against

| Threat | Protection |
|--------|------------|
| **Vendor data breach** | Minimal data stored; metadata-only architecture |
| **Man-in-the-middle** | TLS 1.3; certificate pinning (mobile) |
| **Insider threat (NymAI)** | No raw data access; audit logs; least privilege |
| **API key compromise** | Revocable keys; scope limits; rotation support |
| **Supply chain attack** | Dependency auditing; signed releases; minimal deps |
| **Memory scraping** | Ephemeral processing; explicit clearing |

### 5.2 What We Don't Protect Against

| Threat | Responsibility |
|--------|----------------|
| **Compromised customer endpoint** | Customer IT security |
| **Authorized user misuse** | Customer access controls |
| **Data already in Zendesk** | Customer data governance |
| **Social engineering** | Customer security training |

### 5.3 Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMER ENVIRONMENT                      │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ User Device │    │   Zendesk   │    │   GitHub    │    │
│  │ (browsers,  │    │   (SaaS)    │    │   (SaaS)    │    │
│  │  IDE, CLI)  │    │             │    │             │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          │ Trust Boundary   │                  │
──────────┼──────────────────┼──────────────────┼─────────────
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    NYMAI INFRASTRUCTURE                      │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  NymAI API  │    │  Database   │    │   Logging   │    │
│  │ (ephemeral) │    │ (metadata)  │    │ (sanitized) │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                             │
│  We never store raw customer content                        │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Attack Surface by Deployment

| Surface | Attack Vectors | Mitigations |
|---------|---------------|-------------|
| **Zendesk Integration** | OAuth token theft; XSS in sidebar | Secure token storage; CSP; sandboxed iframe |
| **VS Code Extension** | Malicious update; dependency hijack | Signed releases; minimal deps; open source |
| **CLI** | npm supply chain; PATH hijack | npm provenance; lockfile integrity |
| **MCP Server** | Agent prompt injection | Local-only; no network; stateless |
| **Chrome Extension** | XSS; permission escalation | Manifest V3; minimal permissions; CSP |
| **API** | Injection; auth bypass; DDoS | Input validation; OAuth; rate limiting |

---

## 6. Breach Impact Analysis

### 6.1 If NymAI Infrastructure is Compromised

| Attacker Obtains | Attacker Does NOT Obtain |
|------------------|--------------------------|
| Ticket IDs | Raw ticket content |
| Data type labels (e.g., "SSN detected") | Actual SSN values |
| Timestamps | Customer names or contact info |
| Agent identifiers | Email bodies or messages |
| Workspace configurations | Attachments or files |
| API access logs | Historical raw content |

**Worst Case Scenario:**

An attacker with full database access learns:
- "Workspace XYZ had 47 SSN detections last month"
- "Agent Alice processed 23 redactions on Dec 15"
- "Ticket #12345 contained EMAIL and PHONE data types"

They **cannot** learn:
- What the actual SSN, email, or phone values were
- What customers said in their tickets
- Any personally identifiable information

### 6.2 Comparison to Traditional DLP

| Scenario | Traditional DLP | NymAI |
|----------|-----------------|-------|
| Vendor database breached | Full PII exposure | Metadata only |
| Backups compromised | Historical content exposed | No content in backups |
| API keys stolen | Access to scanned content | Access to metadata only |
| Insider threat | Can view customer data | Cannot view customer data |
| Subpoena / legal demand | Must produce customer PII | Can only produce metadata |

### 6.3 Local Processing Breach Impact

For surfaces using local-only processing (VS Code, CLI, MCP, Chrome Free):

| Scenario | Impact |
|----------|--------|
| NymAI infrastructure compromised | **Zero impact** — no data sent to NymAI |
| User device compromised | Attacker has device access anyway |
| Extension/CLI malicious update | Mitigated by signed releases; open source audit |

---

## 7. Compliance & Certifications

### 7.1 Current Status

> **Note:** NymAI targets small/mid-market companies (10-60 Zendesk agents) that typically don't require SOC 2. This is intentional — our target market can purchase via credit card without procurement involvement. Companies requiring SOC 2 are outside our target market.

| Certification | Status | Notes |
|--------------|--------|-------|
| SOC 2 Type I | Not planned | Target market doesn't require |
| SOC 2 Type II | Not planned | Target market doesn't require |
| HIPAA BAA | Available on request | Template ready |
| ISO 27001 | Not planned | — |
| GDPR DPA | ✅ Available | Now |
| CCPA Addendum | ✅ Available | Now |

**Why no SOC 2?** Our target market (10-60 agent companies) rarely requires it. Companies with 60+ agents typically have security teams that mandate SOC 2 — those companies are outside our target market and should use Nightfall or Strac instead. This isn't a deferral; it's a deliberate market positioning choice.

### 7.2 Regulatory Alignment

| Regulation | How NymAI Helps | Limitations |
|------------|-----------------|-------------|
| **GDPR** | Data minimization (ephemeral processing); no long-term PII storage; supports right to erasure | Tool only; doesn't guarantee compliance |
| **CCPA/CPRA** | Reduces PII exposure; supports data deletion requests; no sale of personal info | Customers manage broader program |
| **HIPAA** | PHI redaction in tickets; ephemeral processing; BAA available (Phase 3) | Text only; attachments not in MVP |
| **PCI-DSS** | Credit card masking with Luhn validation | Doesn't cover full cardholder data environment |
| **EU AI Act** | AI guardrails with audit trail; transparency features | Customers responsible for AI governance |
| **State Privacy Laws** | Supports 21+ US state requirements via data minimization | Customer must assess specific requirements |

### 7.3 Compliance Features

| Feature | Description | Availability |
|---------|-------------|--------------|
| **Audit Logs** | Immutable log of all detection/redaction events | Now |
| **Data Retention Controls** | Configurable metadata retention (30-365 days) | Now |
| **DPA Template** | Standard Data Processing Addendum | Now |
| **Subprocessor List** | Published list of third parties | Now |
| **Security Questionnaire** | Pre-filled responses (CAIQ, SIG) | On request |
| **BAA** | HIPAA Business Associate Agreement | On request |
| **SOC 2 Report** | Third-party audit report | On customer demand |

### 7.4 Compliance Approach

Our compliance approach matches our market position (10-60 agent companies):

```
What We Provide (Now)
├── Ephemeral architecture (raw PII never stored)
├── DPA template
├── Security overview document (this document)
├── Subprocessor documentation
└── Architecture review calls on request

On Customer Request
├── Security questionnaire responses (CAIQ, SIG, custom)
├── HIPAA BAA execution
├── Penetration test coordination
└── Custom security documentation

What We Don't Provide
├── SOC 2 certification (target market doesn't require)
├── ISO 27001 (overkill for target market)
├── Custom procurement processes
└── 6-month security review cycles
```

**If a prospect requires SOC 2:** They're likely outside our target market (60+ agents). We recommend they evaluate Nightfall or Strac, which serve the enterprise segment with appropriate certifications.

---

## 8. Data Residency & Sovereignty

### 8.1 Current Infrastructure (MVP)

| Component | Location | Provider |
|-----------|----------|----------|
| API Server | US (Oregon) | Render |
| Database | US (Virginia) | Supabase |
| Admin Console | Global CDN | Vercel |
| DNS | Global | Cloudflare |

### 8.2 Data Flow by Region

**Current:** All server-side processing occurs in US data centers.

**Important:** For local-only surfaces (VS Code, CLI, Chrome Free, MCP), data never leaves the user's geographic location.

### 8.3 Future Data Residency Options (Not Currently Planned)

> **Note:** These options are documented for completeness but are NOT on the current roadmap. NymAI is focused on Zendesk SMB/mid-market customers who typically don't require EU data residency.

| Option | Description | Status |
|--------|-------------|--------|
| **EU-Hosted API** | Render EU region (Frankfurt) | Future optionality |
| **Self-Hosted** | Customer runs NymAI API | Not planned |
| **Local-Only Mode** | All processing on user devices | Available now (VS Code, CLI, MCP) |

**Current Recommendation:** Customers with strict EU data residency requirements should consider that our ephemeral processing model means raw PII never persists—only metadata is stored in US data centers. For many use cases, this satisfies GDPR requirements without EU hosting.

### 8.4 Data Residency FAQ

**Q: Where is my data processed?**
- Local surfaces: Your device only
- Server surfaces: US (current); EU option planned

**Q: Can I keep data in the EU only?**
- Local processing: Yes (no data leaves your device)
- Server processing: EU hosting planned for Phase 4

**Q: Do you transfer data internationally?**
- Metadata may be accessed by US-based support (limited)
- Raw content: Never transferred (never stored)

---

## 9. Third-Party Dependencies

### 9.1 Infrastructure Providers

| Provider | Purpose | Data Exposure | Security |
|----------|---------|---------------|----------|
| **Render** | API hosting | Encrypted at rest; no body logging | SOC 2 Type II |
| **Supabase** | Database (metadata) | Metadata only; AES-256 | SOC 2 Type II |
| **Vercel** | Admin console hosting | Static files only | SOC 2 Type II |
| **Cloudflare** | DNS, CDN | Traffic metadata | SOC 2 Type II |

### 9.2 Integration Partners

| Partner | Purpose | Data Shared | Security |
|---------|---------|-------------|----------|
| **Zendesk** | Support integration | OAuth tokens; redacted content to update tickets | SOC 2, ISO 27001 |
| **Slack** | Chat integration (planned) | OAuth tokens; redacted messages | SOC 2, ISO 27001 |
| **Microsoft** | Teams integration (planned) | OAuth tokens; redacted messages | SOC 2, ISO 27001 |

### 9.3 Runtime Dependencies

**`@nymai/core` (Detection Engine):**
- **Zero runtime dependencies**
- No network calls
- No external services

**`@nymai/api` (Server):**

| Dependency | Purpose | Security Notes |
|------------|---------|----------------|
| `hono` | Web framework | Minimal; security-focused |
| `@supabase/supabase-js` | Database client | Official Supabase SDK |
| `zod` | Input validation | No network calls |

---

## 10. Supply Chain Security

### 10.1 Dependency Management

| Practice | Implementation |
|----------|----------------|
| Dependency auditing | `npm audit` on every CI run |
| Vulnerability scanning | Snyk integration |
| Lockfile integrity | `pnpm-lock.yaml` committed and verified |
| Minimal dependencies | Core engine has zero deps |

### 10.2 Build Pipeline Security

| Control | Implementation |
|---------|----------------|
| Source control | GitHub with branch protection |
| Code review | Required for all changes |
| CI/CD | GitHub Actions (no third-party) |
| Secrets management | GitHub Secrets; never in code |
| Build reproducibility | Lockfile ensures consistent builds |

### 10.3 Release Security

| Control | Implementation |
|---------|----------------|
| Signed commits | Required for releases |
| npm provenance | Published with provenance attestation |
| Changelog | Public changelog for all releases |
| Version pinning | Customers can pin versions |

### 10.4 Subprocessor List

| Subprocessor | Service | Location | Purpose |
|--------------|---------|----------|---------|
| Render | Cloud hosting | US | API hosting |
| Supabase | Database | US | Metadata storage |
| Vercel | Static hosting | Global | Admin console |
| Cloudflare | DNS/CDN | Global | Traffic routing |
| GitHub | Source control | US | Code hosting, CI/CD |

---

## 11. Incident Response

### 11.1 Incident Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **P1 - Critical** | Active breach; data exposure | 1 hour |
| **P2 - High** | Vulnerability actively exploited | 4 hours |
| **P3 - Medium** | Vulnerability discovered; no exploitation | 24 hours |
| **P4 - Low** | Minor security issue | 72 hours |

### 11.2 Response Process

```
1. DETECTION
   └── Automated monitoring + manual review + customer reports

2. TRIAGE (within 1 hour for P1)
   └── Assess scope, impact, and affected customers

3. CONTAINMENT (within 4 hours for P1)
   └── Isolate affected systems
   └── Revoke compromised credentials
   └── Block attack vectors

4. NOTIFICATION (within 24-72 hours)
   └── Affected customers notified
   └── Regulatory notification if required
   └── Public disclosure if appropriate

5. REMEDIATION
   └── Root cause analysis
   └── Fix deployed
   └── Verification testing

6. POST-MORTEM
   └── Incident report created
   └── Shared with affected customers on request
   └── Process improvements implemented
```

### 11.3 Customer Notification

| Incident Type | Notification Timeline | Method |
|---------------|----------------------|--------|
| Confirmed data breach | Within 72 hours | Email + in-app |
| Suspected breach (investigating) | Within 24 hours | Email |
| Vulnerability (no exploitation) | After fix deployed | Changelog |
| Service disruption | Real-time | Status page |

### 11.4 Contact

- **Security incidents:** security@nymai.com
- **General security questions:** security@nymai.com
- **Status page:** status.nymai.com (placeholder)

---

## 12. Security Testing & Verification

### 12.1 Testing We Perform

**Automated Testing (Continuous):**
- [ ] Unit tests for detection patterns (accuracy, false positive rates)
- [ ] Integration tests for all API endpoints
- [ ] Dependency vulnerability scanning (`npm audit`, Snyk)
- [ ] Static analysis (ESLint security rules)
- [ ] SAST scanning (CodeQL)

**Manual Testing (Per Release):**
- [ ] Authentication bypass attempts
- [ ] Authorization boundary testing
- [ ] Input validation (injection, malformed data)
- [ ] Rate limiting verification
- [ ] Memory handling verification
- [ ] TLS configuration validation

**Periodic Testing:**
- [ ] Third-party penetration test (annual, starting Phase 2)
- [ ] Red team exercise (Phase 3+)
- [ ] Disaster recovery test (quarterly)

### 12.2 Customer Verification Options

**Available Now:**
1. **Architecture review** — System diagrams and security walkthrough on request
2. **Log inspection** — Sample logs demonstrating metadata-only format
3. **Open source audit** — `@nymai/core` source code is public
4. **API testing** — Test detection in your own environment

**Available on Request:**
5. **Security questionnaire responses** — CAIQ, SIG Lite, custom
6. **Penetration testing coordination** — Customer-initiated with notice

### 12.3 Customer Penetration Testing

**Permitted (With Coordination):**
- Penetration testing of your NymAI workspace
- API security scanning against your endpoints
- Authentication and authorization testing

**Requires 14-Day Notice:**
- Load testing / stress testing
- Automated vulnerability scanning at scale

**Not Permitted:**
- Testing against shared infrastructure
- Social engineering of NymAI employees
- Physical security testing
- Testing outside your workspace scope

**Scheduling:** Contact security@nymai.com at least 14 days before testing.

---

## 13. Vulnerability Disclosure

### 13.1 Reporting Security Issues

**Email:** security@nymai.com

**PGP Key:** Available at https://nymai.com/.well-known/security.txt

**Expected Response:**
- Initial acknowledgment: 48 hours
- Severity assessment: 5 business days
- Resolution timeline: Based on severity

### 13.2 Scope

**In Scope:**
- NymAI API and backend services
- Published npm packages (`@nymai/core`, `@nymai/cli`)
- Zendesk, VS Code, Chrome extensions
- Admin console (app.nymai.com)
- Public documentation and repositories

**Out of Scope:**
- Customer infrastructure running our SDK
- Third-party services (Zendesk, Supabase, Render)
- Social engineering attacks against employees
- Physical security
- Denial of service attacks

### 13.3 Safe Harbor

NymAI will not pursue legal action against security researchers who:
- Make good faith efforts to avoid privacy violations and data destruction
- Do not access, modify, or delete customer data
- Report findings to us before public disclosure
- Allow reasonable time for remediation (90 days)

### 13.4 Recognition

We maintain a security acknowledgments page for researchers who responsibly disclose valid vulnerabilities.

---

## 14. FAQ for Security Teams

### General

**Q: Do you store our customer data?**

A: No. We store metadata only (ticket IDs, data types detected, timestamps). Raw content is never stored.

**Q: What happens if NymAI is breached?**

A: Attackers would obtain metadata (ticket IDs, timestamps, data type labels). They would not obtain any actual PII, ticket content, or sensitive values.

**Q: Can NymAI employees see our tickets?**

A: No. Raw ticket content exists only in memory during the <500ms processing window and is never logged or stored.

### Data Processing

**Q: How long do you keep data?**

A: Raw content: 0 seconds (never stored). Metadata: Configurable 30-365 days, default 90 days.

**Q: Do you use our data to train models?**

A: No. Detection uses fixed regex patterns, not machine learning. We never use customer data for training.

**Q: Where is data processed?**

A: Server-side: US (Oregon). Local processing: Your device only. EU hosting is not currently planned but may be considered based on customer demand.

### Compliance

**Q: Are you SOC 2 certified?**

A: No, and we don't plan to be. Our target market (companies with 10-60 Zendesk agents) typically doesn't require SOC 2. Companies that do require SOC 2 usually have 60+ agents and dedicated security teams — they're outside our target market. We recommend those companies evaluate Nightfall or Strac instead.

**Q: Can you sign a BAA?**

A: Yes, BAA available on request. Our architecture supports HIPAA through data minimization (PHI processed ephemerally, never stored).

**Q: What if we require SOC 2?**

A: If SOC 2 is a hard requirement, we're likely not the right fit. Our ephemeral architecture means a breach exposes only metadata (no PII), which satisfies most small/mid-market security requirements. But if your procurement process mandates SOC 2, we recommend Nightfall ($50k+/year) or Strac ($10k+/year).

**Q: Do you have a DPA?**

A: Yes. Standard DPA available on request.

### Technical

**Q: What authentication do you use?**

A: Zendesk OAuth 2.0 for Zendesk integration. API keys for programmatic access. SSO for enterprise admin console.

**Q: Is data encrypted?**

A: Yes. TLS 1.3 in transit; AES-256 at rest for metadata.

**Q: Can we audit your systems?**

A: Yes. Contact us to schedule an architecture review or coordinate penetration testing.

### Local Processing

**Q: Does the VS Code extension send data to your servers?**

A: No (default). Enterprise mode can optionally sync metadata for dashboards.

**Q: Is the CLI fully offline?**

A: Yes. The CLI uses `@nymai/core` locally with no network dependency.

**Q: Does the MCP server require internet?**

A: No. MCP server runs entirely locally.

---

## Appendix A: Data Flow Diagrams

### A.1 Zendesk Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ZENDESK                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Ticket View                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Customer: My SSN is 123-45-6789                 │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  ┌─────────────────┐                                    │   │
│  │  │  NymAI Sidebar  │                                    │   │
│  │  │  ┌───────────┐  │                                    │   │
│  │  │  │ 1 SSN     │  │ ──────────────────┐               │   │
│  │  │  │ detected  │  │                   │               │   │
│  │  │  ├───────────┤  │                   │               │   │
│  │  │  │ [Redact]  │  │                   │ 1. Agent      │   │
│  │  │  └───────────┘  │                   │    clicks     │   │
│  │  └─────────────────┘                   │    Redact     │   │
│  └─────────────────────────────────────────┼───────────────┘   │
└──────────────────────────────────────────────┼─────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NYMAI API                                   │
│                                                                  │
│  2. Text received ──▶ IN MEMORY ONLY ──▶ 3. Detection runs     │
│                           │                    │                │
│                           │                    ▼                │
│                           │            4. Masked text:          │
│                           │            "My SSN is ***-**-6789"  │
│                           │                    │                │
│                           ▼                    │                │
│  5. Metadata logged: ◀────────────────────────┘                │
│     { ticket: 123, types: ["SSN"] }                             │
│                                                                  │
│  6. RAW TEXT CLEARED                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
│                                                                  │
│  metadata_logs:                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id: uuid-1                                                │  │
│  │ ticket_id: "123"        ◀── No raw text                  │  │
│  │ data_types: ["SSN"]     ◀── No SSN value                 │  │
│  │ agent: "alice"                                            │  │
│  │ timestamp: "2025-12-30T14:22:15Z"                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### A.2 Local Processing Flow (VS Code / CLI / MCP)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER MACHINE                             │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Source File   │    │   VS Code /     │                    │
│  │                 │───▶│   CLI / MCP     │                    │
│  │ api_key=sk-123 │    │                 │                    │
│  │ ssn=123-45-6789│    │  ┌───────────┐  │                    │
│  └─────────────────┘    │  │@nymai/core│  │                    │
│                         │  │           │  │                    │
│                         │  │ detect()  │  │                    │
│                         │  │ redact()  │  │                    │
│                         │  └───────────┘  │                    │
│                         │        │        │                    │
│                         │        ▼        │                    │
│                         │  Results shown  │                    │
│                         │  locally        │                    │
│                         └─────────────────┘                    │
│                                                                  │
│                    ════════════════════════                     │
│                    NO DATA LEAVES THIS BOX                      │
│                    ════════════════════════                     │
└─────────────────────────────────────────────────────────────────┘

                              ╳
                              │
                    ┌─────────┴─────────┐
                    │   NYMAI SERVERS   │
                    │                   │
                    │   (not contacted) │
                    │                   │
                    └───────────────────┘
```

---

## Appendix B: API Security Reference

### B.1 Authentication

**Zendesk Integration:**
```http
Authorization: Bearer <zendesk_oauth_token>
X-Zendesk-Workspace-Id: <workspace_id>
```

**API Key (Enterprise):**
```http
Authorization: Bearer <nymai_api_key>
```

### B.2 Rate Limits

| Endpoint | Authenticated | Unauthenticated |
|----------|---------------|-----------------|
| `POST /api/detect` | 100/min | N/A |
| `POST /api/redact` | 50/min | N/A |
| `GET /api/logs` | 30/min | N/A |
| `GET /api/settings` | 60/min | N/A |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

### B.3 Input Validation

All inputs are validated using Zod schemas:

```typescript
const RedactRequestSchema = z.object({
  text: z.string().max(100000),  // 100KB max
  ticket_id: z.string().max(100),
  types: z.array(z.enum(['SSN', 'CC', 'EMAIL', 'PHONE', 'DL'])).optional()
});
```

**Rejected Inputs:**
- Text exceeding 100KB
- Invalid JSON
- Missing required fields
- Invalid data types

### B.4 Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Text exceeds maximum length",
    "details": {
      "field": "text",
      "max": 100000,
      "received": 150000
    }
  }
}
```

**Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Missing/invalid auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 30, 2025 | Initial Zendesk-focused release |
| 2.0 | Dec 30, 2025 | Multi-surface coverage; local processing; MCP; compliance expansion |
| 2.1 | Dec 30, 2025 | Aligned with bootstrapped path; SOC 2 deferred; EU hosting marked as future optionality |

---

**End of Security Overview**

*Version: 2.1 (Bootstrapped Path)*  
*Last Updated: December 30, 2025*  
*Next Review: Quarterly or on customer request*
