# NymAI Admin Guide

> Configuration and management guide for HubSpot administrators

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Admin Console Access](#admin-console-access)
4. [Configuration](#configuration)
5. [Viewing Logs](#viewing-logs)
6. [Dashboard](#dashboard)
7. [Security](#security)
8. [Support](#support)

---

## Overview

NymAI is a privacy protection tool for HubSpot CRM that helps support teams detect and redact sensitive customer information in CRM records and attachments.

### What NymAI Does

- **Detects** Personal Identifiable Information (PII) in record content
- **Scans** image attachments for sensitive data using OCR
- **Redacts** detected information with masked values
- **Logs** redaction activity for compliance (metadata only, no PII)

### Admin vs Agent Capabilities

| Capability                | Agents | Admins |
| ------------------------- | ------ | ------ |
| View PII detections       | Yes    | Yes    |
| Redact text/attachments   | Yes\*  | Yes    |
| View logs                 | No     | Yes    |
| Configure detection types | No     | Yes    |
| Switch detection modes    | No     | Yes    |
| View dashboard statistics | No     | Yes    |

\*If redaction mode is enabled

---

## Installation

### Prerequisites

- HubSpot account with Super Admin permissions
- Access to HubSpot App Marketplace

### Installing from HubSpot App Marketplace

1. Log into your HubSpot account
2. Navigate to **Settings** > **Integrations** > **Connected Apps**
3. Click **Visit App Marketplace**
4. Search for "NymAI"
5. Click **Install App**
6. Authorize the OAuth permissions
7. The app panel will appear in Contact, Company, Deal, and Ticket record views

### Post-Installation Setup

1. Open the NymAI Admin Console (see next section)
2. Sign in with your Google account
3. Configure detection types for your workspace
4. Choose between Full Mode or Detection-Only Mode
5. Notify your agents that NymAI is available

---

## Admin Console Access

### Console URL

**https://nymai-admin.vercel.app**

### Authentication

NymAI uses Google OAuth for admin console access:

1. Navigate to the admin console URL
2. Click **Sign in with Google**
3. Select your work Google account
4. Grant the requested permissions
5. You'll be redirected to your dashboard

### Workspace ID

Your workspace is automatically determined by your email domain:

| Email               | Workspace ID |
| ------------------- | ------------ |
| admin@acme.com      | acme.com     |
| support@company.org | company.org  |

All users from the same email domain share the same workspace and settings.

### Access Control

- Any user with an email from your domain can access the admin console
- There is no separate role distinction within the admin console
- All admin console users can view and modify settings

> **Security Note**: Ensure only authorized personnel have company email addresses that would grant admin access.

---

## Configuration

### Accessing Settings

1. Sign into the Admin Console
2. Click **Settings** in the navigation menu
3. Modify settings as needed
4. Click **Save** to apply changes

### Detection Type Toggles

Configure which types of sensitive data NymAI should detect:

| Detection Type       | Description                                | Default |
| -------------------- | ------------------------------------------ | ------- |
| **SSN**              | Social Security Numbers (XXX-XX-XXXX)      | Enabled |
| **Credit Card**      | Major card networks (Visa, MC, Amex, etc.) | Enabled |
| **Email**            | Email addresses                            | Enabled |
| **Phone**            | US phone numbers                           | Enabled |
| **Driver's License** | US state formats                           | Enabled |
| **Date of Birth**    | Dates in MM/DD/YYYY format                 | Enabled |
| **Passport**         | US passport numbers                        | Enabled |
| **Bank Account**     | 8-17 digit account numbers                 | Enabled |
| **Routing Number**   | 9-digit ABA routing numbers                | Enabled |
| **IP Address**       | IPv4 addresses                             | Enabled |
| **Medicare ID**      | Medicare Beneficiary Identifiers           | Enabled |
| **ITIN**             | Individual Taxpayer ID Numbers             | Enabled |

> **Tip**: If you're seeing too many false positives for a particular type, you can disable it here.

### Detection Modes

Choose how NymAI operates in your workspace:

#### Full Mode (Default)

- Agents can see all detections
- Agents can redact detected PII
- 10-second undo window available
- Full attachment scanning and redaction

Best for: Teams that need to actively remove sensitive data from records.

#### Detection-Only Mode

- Agents can see detections
- Redaction buttons are hidden
- Provides awareness without action capability
- Useful for training or audit purposes

Best for: Teams that want to monitor PII presence without allowing redaction, or during initial rollout.

### Switching Modes

1. Go to **Settings** > **Detection Mode**
2. Select **Full Mode** or **Detection-Only Mode**
3. Click **Save**
4. Changes take effect immediately for all agents

> **Note**: When switching to Detection-Only Mode, agents currently viewing records will need to refresh to see the change.

---

## Viewing Logs

### What's Logged

NymAI logs redaction **metadata only** — never the actual sensitive data:

| Logged                    | Not Logged           |
| ------------------------- | -------------------- |
| Record ID                 | Record content       |
| Data type (SSN, CC, etc.) | Actual PII values    |
| Timestamp                 | Activity text        |
| Agent email               | Attachment images    |
| Success/failure status    | Customer information |

### Accessing Logs

1. Sign into the Admin Console
2. Click **Logs** in the navigation menu
3. View the log table

### Log Entry Details

Each log entry includes:

- **Timestamp**: When the redaction occurred
- **Record ID**: Which record was affected
- **Type**: What type of data was redacted
- **Status**: Success or failure
- **Agent**: Who performed the redaction

### Filtering Logs

Filter logs by:

- **Date range**: Select start and end dates
- **Data type**: Filter by SSN, Credit Card, Email, etc.
- **Status**: Show only successes or failures

### Exporting Logs

1. Apply your desired filters
2. Click **Export** button
3. Choose CSV or JSON format
4. Download the file

> **Compliance Tip**: Export logs regularly for your compliance records. Logs provide an audit trail of all redaction activity without exposing actual PII.

---

## Dashboard

### Overview Statistics

The dashboard provides a summary of NymAI activity:

- **Total Scans**: Number of records/attachments scanned
- **Detections**: Total PII items detected
- **Redactions**: Number of successful redactions
- **Detection Rate**: Percentage of scans with findings

### Data Type Breakdown

View which types of sensitive data are most commonly detected:

- Pie chart showing distribution by type
- Counts for each detection type
- Helps identify which data types are most prevalent

### Trends

Track activity over time:

- Daily/weekly/monthly views
- Detection volume trends
- Redaction activity trends

### Using Dashboard Data

**High detection rates may indicate:**

- Customers frequently sharing sensitive data
- Need for customer-facing guidance on data sharing
- Training opportunity for agents

**Low redaction rates may indicate:**

- Detection-only mode is enabled
- Agents not using the redaction feature
- Possible training need

---

## Security

### Data Handling

NymAI is designed with privacy first:

| Data        | Handling                                        |
| ----------- | ----------------------------------------------- |
| Record text | Processed in memory (<500ms), then cleared      |
| Attachments | Scanned client-side only, never sent to servers |
| Metadata    | Stored in encrypted database                    |
| PII values  | Never stored or logged                          |

### Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  HubSpot CRM    │────>│  NymAI Panel    │ (UI Extension)
│  Record View    │     │  (React)        │
└─────────────────┘     └────────┬────────┘
                                 │
                                 │ Serverless Function
                                 │ (fetches records, calls API)
                                 v
                        ┌─────────────────┐
                        │  NymAI API      │
                        │  (DigitalOcean) │
                        └────────┬────────┘
                                 │
                                 v
                        ┌─────────────────┐
                        │  Supabase DB    │
                        │  (metadata only)│
                        └─────────────────┘
```

### Encryption

- **In Transit**: All connections use TLS 1.3
- **At Rest**: Database encrypted with AES-256

### Compliance

NymAI supports compliance with:

- **GDPR**: No personal data stored
- **CCPA**: No sale of personal information
- **SOC 2**: Infrastructure providers are SOC 2 certified

For detailed security information, see: [Security Overview](../internal/security_overview.md)

### Infrastructure Providers

All infrastructure providers maintain SOC 2 Type II certification:

| Component     | Provider     | Certifications   |
| ------------- | ------------ | ---------------- |
| API Server    | DigitalOcean | SOC 2, ISO 27001 |
| Database      | Supabase     | SOC 2            |
| Admin Console | Vercel       | SOC 2            |

---

## Support

### Contact Information

| Type            | Contact            |
| --------------- | ------------------ |
| General Support | support@nymai.com  |
| Security Issues | security@nymai.com |
| Sales Inquiries | sales@nymai.com    |

### Response Times

- **General inquiries**: Within 24 hours
- **Technical issues**: Within 4 hours
- **Security concerns**: Within 1 hour

### Troubleshooting Common Issues

#### "Users can't see the NymAI panel"

1. Verify the app is installed in HubSpot Settings > Connected Apps
2. Check that the user has access to the record types (Contacts, Companies, Deals, Tickets)
3. Have users refresh their browser
4. Clear browser cache if needed

#### "Detections not showing"

1. Verify detection types are enabled in Settings
2. Check that the record contains recognizable patterns
3. Ensure text matches expected formats (e.g., XXX-XX-XXXX for SSN)

#### "Redaction buttons missing"

1. Check if Detection-Only Mode is enabled
2. Switch to Full Mode in Settings if redaction is needed

#### "Admin console won't load"

1. Check your internet connection
2. Verify you're using a supported browser (Chrome, Firefox, Edge)
3. Clear browser cache and cookies
4. Try incognito/private browsing mode

#### "Can't sign in to admin console"

1. Ensure you're using a Google account with your company domain
2. Check that third-party cookies are enabled
3. Try a different browser
4. Contact support if issues persist

### Requesting Features

We welcome feature requests! Email support@nymai.com with:

- Description of the desired feature
- Use case and business justification
- Priority level for your team

---

## Quick Reference

### Key URLs

| Resource      | URL                                               |
| ------------- | ------------------------------------------------- |
| Admin Console | https://nymai-admin.vercel.app                    |
| API Status    | https://nymai-api-dnthb.ondigitalocean.app/health |
| Documentation | https://docs.nymai.com                            |
| HubSpot App   | Installed via HubSpot App Marketplace             |

### Default Settings

| Setting                    | Default Value |
| -------------------------- | ------------- |
| SSN Detection              | Enabled       |
| Credit Card Detection      | Enabled       |
| Email Detection            | Enabled       |
| Phone Detection            | Enabled       |
| Driver's License Detection | Enabled       |
| Date of Birth Detection    | Enabled       |
| Passport Detection         | Enabled       |
| Bank Account Detection     | Enabled       |
| Routing Number Detection   | Enabled       |
| IP Address Detection       | Enabled       |
| Medicare ID Detection      | Enabled       |
| ITIN Detection             | Enabled       |
| Mode                       | Full Mode     |
| Undo Window                | 10 seconds    |

### Log Retention

- Logs retained for 90 days by default
- Export logs for longer retention needs
- Contact support for custom retention policies

---

_Last Updated: January 4, 2026_
_Version: 2.0_
