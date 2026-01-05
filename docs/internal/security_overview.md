# NymAI Security Overview (HubSpot Pivot)

**Version:** 4.0 (ML Enhancement)  
**Audience:** CISOs, Security Teams, HubSpot Administrators, Compliance Officers  
**Last Updated:** January 3, 2026  
**Related Documents:** [project_spec.md](../project_spec.md), [VISION.md](./VISION.md), [ROADMAP.md](./ROADMAP.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Handling by Surface](#3-data-handling-by-surface)
4. [Security Controls](#4-security-controls)
5. [Threat Model](#5-threat-model)
6. [Breach Impact Analysis](#6-breach-impact-analysis)
7. [Compliance](#7-compliance)
8. [Data Residency](#8-data-residency)
9. [Third-Party Dependencies](#9-third-party-dependencies)
10. [Incident Response](#10-incident-response)
11. [Appendices (Data Flow Diagrams)](#appendices-data-flow-diagrams)

---

## 1. Executive Summary

### What NymAI Does

NymAI is a dedicated PII (Personally Identifiable Information) detection and redaction solution for HubSpot. It enables HubSpot users to identify and mask sensitive data—such as Social Security numbers, credit card details, and credentials—across the entire HubSpot CRM suite, including Notes, Emails, Calls, and Conversations.

### Key Security Differentiator: Ephemeral Processing

NymAI is built on the principle of **Ephemeral Processing**. Unlike traditional DLP vendors that store customer data to train models or provide "vault" access, NymAI:

- **Never stores raw content** — Only metadata (redaction types, counts, timestamps) is persisted.
- **Processes in memory only** — Sensitive data exists in application memory for <500ms before being explicitly purged.
- **Minimizes data egress** — Data flows through HubSpot's secure infrastructure via Serverless Functions before reaching the NymAI API.

### Security Posture Summary

| Dimension         | NymAI Approach                                              |
| ----------------- | ----------------------------------------------------------- |
| Data Storage      | Metadata only; no raw PII, secrets, or record bodies stored |
| Processing Model  | Ephemeral (memory-only processing)                          |
| Infrastructure    | HubSpot Serverless + DigitalOcean (API)                     |
| Encryption        | TLS 1.3 in transit; AES-256 at rest for metadata            |
| Authentication    | OAuth 2.0 with encrypted refresh tokens                     |
| Compliance        | GDPR/CCPA aligned; HubSpot SOC 2 Type II environment        |
| **Pricing Tiers** | Individual $29, Pro $99, Business $249, Enterprise Custom   |

---

## 2. Architecture Overview

NymAI utilizes a distributed architecture that leverages HubSpot's native Serverless Functions to provide a secure and performant integration with the HubSpot CRM.

### 2.1 Component Distribution

1.  **HubSpot UI Extension**: The entry point for users within the HubSpot CRM (Contact/Deal/Ticket sidebars).
2.  **HubSpot Serverless Functions**: Runs on HubSpot's SOC 2 Type II infrastructure. Orchestrates data fetching from the CRM and coordinates with the NymAI API.
3.  **NymAI API (DigitalOcean)**: Receives ephemeral text data, performs detection using `@nymai/core`, and logs metadata.
4.  **Supabase Database**: Stores workspace configurations, encrypted OAuth refresh tokens, and metadata logs.
5.  **LLM Provider (Business+ Tier)**: Optional verification for ambiguous detections via OpenAI or Anthropic API (ephemeral).

### 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HUBSPOT INFRASTRUCTURE                   │
│                                                             │
│  ┌─────────────────┐       ┌────────────────────────────┐   │
│  │  HubSpot CRM    │       │ HubSpot Serverless Function│   │
│  │ (Notes, Emails) │ ◀───▶ │ (Orchestration/Proxy)      │   │
│  └─────────────────┘       └──────────────┬─────────────┘   │
└───────────────────────────────────────────┼─────────────────┘
                                            │
                                            │ HTTPS (TLS 1.3)
                                            │
┌───────────────────────────────────────────▼─────────────────┐
│                    NYMAI INFRASTRUCTURE                     │
│                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │      NymAI API       │         │       Database       │  │
│  │  (Ephemeral Memory)  │ ◀─────▶ │      (Supabase)      │  │
│  │  [@nymai/core]       │         │  (Metadata/Tokens)   │  │
│  └──────────┬───────────┘         └──────────────────────┘  │
│             │                                               │
│             │ [Business+ Tier Only]                         │
│             ▼                                               │
│  ┌──────────────────────┐                                   │
│  │     LLM Provider     │                                   │
│  │ (Ephemeral Snippets) │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Handling by Surface

NymAI scans multiple HubSpot objects to ensure comprehensive coverage.

| Surface             | Source Data Location         | Redaction Method         |
| ------------------- | ---------------------------- | ------------------------ |
| **Notes**           | `hs_note_body`               | Patch/Update record      |
| **Emails**          | Synced Gmail/Outlook bodies  | Redact in HubSpot thread |
| **Calls**           | Integrated transcripts       | Mask transcript text     |
| **Conversations**   | Chat/Inbound messages        | Patch message body       |
| **Tickets/Objects** | Custom & Standard properties | Property value update    |
| **Forms**           | Submission data              | Entry redaction          |

---

## 4. Security Controls

### 4.1 Ephemeral Processing (Core Principle)

- **No Disk Persistence**: PII is never written to persistent storage or swap files.
- **Scoped Memory**: Raw text exists only within the execution scope of the detection function.
- **Explicit Clearing**: Application memory is explicitly cleared (`text = null`) immediately after the redaction result is returned.
- **Sanitized Logs**: Production logs are configured to never capture request or response bodies.

### 4.2 OAuth 2.0 Security

NymAI uses HubSpot OAuth 2.0 to access CRM data.

- **Access Tokens**: Short-lived (30 minutes), stored in-memory during execution.
- **Refresh Tokens**: Long-lived, stored with AES-256 encryption in the Supabase database.
- **Minimum Scopes**: NymAI requests only the scopes necessary for its function (e.g., `crm.objects.contacts.read`, `crm.objects.contacts.write`).
- **Automatic Rotation**: Tokens are automatically refreshed before expiration.

### 4.3 HubSpot Serverless Security

- **Native Execution**: Code runs within HubSpot's managed infrastructure (SOC 2 Type II certified).
- **Isolation**: Serverless functions are isolated from other HubSpot customers.
- **Secrets Management**: Integration secrets and API keys are stored in HubSpot's dedicated secret manager, never in code.
- **Timeout Enforcement**: 10-second execution limit prevents long-running data exposure.

### 4.4 Encryption

- **In Transit**: All communication is enforced via TLS 1.3.
- **At Rest**: Metadata in Supabase and refresh tokens are encrypted using AES-256.

### 4.5 ML Enhancement Layer (Business+ Tier)

For detections with "Medium" confidence scores, NymAI optionally leverages a Large Language Model (LLM) enhancement layer to reduce false positives.

- **Privacy First**: The LLM only receives the ambiguous text snippet; all customer identifiers and surrounding context are stripped before transmission.
- **Ephemeral Verification**: Snippets are processed in-memory by the LLM provider and are not used for model training or stored permanently.
- **Cost Efficiency**: ML verification is only triggered for ambiguous cases (~$0.001-0.01 per check), ensuring high precision without high overhead.

---

## 5. Threat Model

### 5.1 Mitigated Threats

| Threat                       | Mitigation Strategy                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| **OAuth Token Theft**        | Short-lived access tokens; encrypted and secured refresh tokens in Supabase.        |
| **Serverless Compromise**    | Leverages HubSpot's platform security; no secrets stored in code; ephemeral state.  |
| **NymAI API Breach**         | Metadata-only logging ensures no raw PII is exposed even if the database is leaked. |
| **Man-in-the-Middle (MITM)** | Strict enforcement of TLS 1.3 and HSTS.                                             |
| **Memory Scraping**          | Ephemeral processing window (<500ms) and explicit memory clearing.                  |

### 5.2 Trust Boundaries

- **HubSpot Boundary**: NymAI relies on HubSpot for the security of the CRM data at rest and the Serverless runtime environment.
- **NymAI Boundary**: NymAI is responsible for the secure processing of data in transit and the protection of metadata/access tokens.

---

## 6. Breach Impact Analysis

### 6.1 Impact of a NymAI Infrastructure Compromise

In the event of a total compromise of NymAI's backend (API + Database):

- **Attacker Obtains**:
  - Metadata logs (e.g., "Note ID 123 contained an EMAIL finding at 10:00 AM").
  - Workspace configuration settings.
  - Encrypted refresh tokens (require master key to decrypt).
- **Attacker DOES NOT Obtain**:
  - Raw bodies of Notes, Emails, or Conversations.
  - Actual SSN, Credit Card, or PII values.
  - Historical raw content (since it was never stored).

### 6.2 Comparison to Vault-based DLP

| Scenario                 | Vault-based DLP (Strac, etc.) | NymAI (Ephemeral)         |
| ------------------------ | ----------------------------- | ------------------------- |
| Vendor database breached | Full PII exposure from vault  | Metadata only             |
| API keys stolen          | Access to cleartext PII       | Access to metadata only   |
| Insider threat           | Can view cleartext PII        | Cannot view cleartext PII |

---

## 7. Compliance

### 7.1 Regulatory Alignment

- **GDPR / CCPA**: NymAI's data minimization and ephemeral processing architecture natively support "Privacy by Design" and the "Right to be Forgotten."
- **HIPAA**: Ephemeral processing ensures PHI is not stored on NymAI's infrastructure. Business Associate Agreements (BAA) are available for enterprise customers.

### 7.2 Certifications

- **HubSpot**: The HubSpot platform and Serverless runtime are SOC 2 Type II certified.
- **NymAI API**: Hosted on DigitalOcean/Render (SOC 2 Type II certified infrastructure).
- **Status**: NymAI is currently "SOC 2 Ready" and adheres to all SOC 2 Type II security controls, though it does not yet hold a standalone certification for the MVP phase.

---

## 8. Data Residency

- **Processing**: Detection occurs on NymAI API servers located in the United States (DigitalOcean Oregon/Virginia).
- **Storage**: Metadata and configuration data are stored in the United States (Supabase).
- **Regional Variability**: HubSpot Serverless Functions execute in the region associated with the HubSpot account (US or EU).
- **PII Residency**: Since PII is never stored by NymAI, it remains in the customer's HubSpot environment (subject to HubSpot's residency policy).

---

## 9. Third-Party Dependencies

NymAI selectively uses industry-standard providers with established security postures:

| Provider           | Purpose                                | Security Status       |
| ------------------ | -------------------------------------- | --------------------- |
| HubSpot            | Serverless runtime, UI Extensions, CRM | SOC 2 Type II         |
| DigitalOcean       | API Server hosting                     | SOC 2 Type II         |
| Supabase           | Metadata database & Auth               | SOC 2 Type II         |
| Vercel             | Admin Console hosting                  | SOC 2 Type II         |
| OpenAI / Anthropic | ML Enhancement Layer (Business+)       | SOC 2 Type II / HIPAA |

---

## 10. Incident Response

NymAI maintains a 24/7 incident response capability for security events.

1.  **Detection**: Automated monitoring of API health and security anomalies.
2.  **Containment**: Ability to instantly revoke OAuth tokens and rotate encryption keys.
3.  **Notification**: Commitment to notify affected customers within 24 hours of a confirmed breach of metadata or unauthorized token access.

---

## Appendices

### Appendix A: Detection Flow (Scan Only)

```
1. User clicks "Scan" in HubSpot UI Extension
2. UI Extension calls Serverless Function
3. Serverless fetches Record Body (e.g., Note body)
4. Serverless POSTs [TEXT ONLY] to NymAI API
5. NymAI API runs @nymai/core detection
6. [Business+] If confidence is Medium, optional ML check performed
   (Detection → Confidence score → If Medium, optional ML check → Result)
7. Findings returned to Serverless -> UI Extension
8. PII is highlighted in UI; Memory is cleared
```

### Appendix B: Redaction Flow (Scan & Mask)

```
1. User confirms Redaction for specific findings
2. Serverless Function generates masked text
3. Serverless Function calls HubSpot API to PATCH record
4. Serverless POSTs [METADATA ONLY] to NymAI API for logging
5. NymAI API stores log entry; Records redacted in HubSpot
```

### Appendix C: OAuth Token Lifecycle

```
1. Admin installs NymAI -> Grant Scopes
2. HubSpot provides Refresh Token -> Encrypted & Stored in Supabase
3. On Scan: NymAI API fetches Refresh Token -> Decrypts
4. NymAI API requests Access Token from HubSpot
5. Access Token used for Session -> Purged from memory
```

---

**End of Security Overview**  
**Version:** 4.0 (ML Enhancement)  
_Next Review: March 2026_
