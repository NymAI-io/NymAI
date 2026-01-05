# NymAI Agent Guide

> Your guide to detecting and redacting sensitive data in HubSpot CRM

---

## Table of Contents

1. [What is NymAI?](#what-is-nymai)
2. [Getting Started](#getting-started)
3. [Detecting Sensitive Data](#detecting-sensitive-data)
4. [Redacting Text](#redacting-text)
5. [Scanning Attachments](#scanning-attachments)
6. [Redacting Attachments](#redacting-attachments)
7. [FAQ](#faq)

---

## What is NymAI?

NymAI is a privacy protection tool that helps you find and remove sensitive customer information from HubSpot CRM records. It automatically scans Notes, Emails, Calls, Conversations, and attachments for personal data like Social Security numbers, credit card numbers, and email addresses.

### Why Use NymAI?

- **Protect Customer Privacy**: Prevent accidental exposure of sensitive data
- **Reduce Liability**: Minimize breach risk by removing PII from records
- **Save Time**: One-click redaction instead of manual editing
- **Stay Compliant**: Help meet GDPR, CCPA, and other privacy requirements

### Privacy First

NymAI never stores your record content. All processing happens in memory and is immediately cleared. We only log metadata (like "SSN detected in record #12345") — never the actual sensitive data.

---

## Getting Started

### Finding the NymAI Panel

1. Open any record in HubSpot (Contact, Company, Deal, or Ticket)
2. Look for the **NymAI** panel in the right sidebar
3. The panel automatically loads when you view a record

### Understanding the Detection Summary

When you open a record, NymAI automatically scans all Notes, Emails, Calls, and Conversations on the timeline. The panel shows:

- **Detection Status**: Green checkmark (no PII found) or yellow warning (PII detected)
- **Findings Count**: Number of sensitive items found
- **Type Breakdown**: What types of data were detected (SSN, Credit Card, etc.)

---

## Detecting Sensitive Data

### What NymAI Detects

| Data Type                        | Examples                     | How It's Displayed |
| -------------------------------- | ---------------------------- | ------------------ |
| **Social Security Number (SSN)** | 123-45-6789, 123 45 6789     | SSN (90%)          |
| **Credit Card**                  | 4111111111111111             | Credit Card (95%)  |
| **Email Address**                | customer@email.com           | Email (98%)        |
| **Phone Number**                 | (555) 123-4567, 555-123-4567 | Phone (85%)        |
| **Driver's License**             | Various state formats        | DL (70%)           |
| **Date of Birth**                | 01/15/1990, 12-25-1985       | DOB (75%)          |
| **Passport Number**              | A12345678                    | Passport (65%)     |
| **Bank Account**                 | 12345678901234               | Bank Account (60%) |
| **Routing Number**               | 021000021                    | Routing (85%)      |
| **IP Address**                   | 192.168.1.100                | IP Address (95%)   |
| **Medicare ID**                  | 1EG4-TE5-MK72                | Medicare (80%)     |
| **ITIN**                         | 912-78-1234                  | ITIN (90%)         |

### Understanding Confidence Scores

Each detection shows a confidence percentage:

- **90%+**: Very likely real sensitive data
- **80-89%**: Probably sensitive data, worth reviewing
- **70-79%**: Possible match, check before redacting

> **Tip**: Always review detections before redacting. NymAI uses pattern matching, so some matches might be false positives (like a phone number that's actually an order ID).

### Detection Modes

Your admin may configure NymAI in one of two modes:

| Mode                    | What You Can Do                               |
| ----------------------- | --------------------------------------------- |
| **Full Mode**           | Detect PII and redact it                      |
| **Detection-Only Mode** | See what's detected, but no redaction buttons |

If you only see detection results without redaction options, your workspace is in detection-only mode. Contact your admin if you need to redact data.

---

## Redacting Text

### One-Click Redaction

When sensitive data is detected:

1. Review the findings in the panel
2. Click **[Redact All]** to redact all detected items
3. The record's activity is updated with masked values
4. An **[Undo]** button appears for 10 seconds

### What Redaction Looks Like

| Original                  | Redacted                    |
| ------------------------- | --------------------------- |
| My SSN is 123-45-6789     | My SSN is `***-**-6789`     |
| Card: 4111111111111111    | Card: `****-****-****-1111` |
| Email: john@example.com   | Email: `j***@***.com`       |
| Call me at (555) 123-4567 | Call me at `(***) ***-4567` |

> **Note**: The last few digits are preserved to help identify which specific item was redacted, while the sensitive portion is masked.

### The 10-Second Undo Window

After redacting, you have **10 seconds** to undo:

1. The **[Undo]** button appears immediately after redaction
2. Click it to restore the original text
3. After 10 seconds, the undo option disappears
4. Once expired, the redaction is permanent

> **Important**: After the undo window closes, there's no way to recover the original text. Make sure you've reviewed the redaction before the timer expires.

### Selective Redaction

Currently, NymAI redacts all detected items at once. If you need to keep some items visible:

1. Click **[Redact All]**
2. If something was incorrectly redacted, click **[Undo]** within 10 seconds
3. Manually edit the activity to mask only the items you want hidden

---

## Scanning Attachments

### Supported Formats

NymAI can scan these attachment types:

| Format       | Support Level   |
| ------------ | --------------- |
| **PNG**      | Full support    |
| **JPG/JPEG** | Full support    |
| **WEBP**     | Full support    |
| **PDF**      | First page only |

> **Note**: Word documents (DOCX), Excel files (XLSX), and other formats are not currently supported.

### How to Scan an Attachment

1. Find the attachment in the record
2. In the NymAI panel, locate the attachment card
3. Click **[Scan]** to start the scan
4. Wait for the scan to complete (typically 5-15 seconds)
5. Review the findings in the panel

### Understanding OCR

NymAI uses Optical Character Recognition (OCR) to read text from images. This means:

**Works Well For:**

- Typed text in images
- Screenshots
- Scanned documents with clear text
- Standard fonts

**May Have Trouble With:**

- Handwritten text
- Very small text
- Blurry or low-quality images
- Unusual fonts or stylized text
- Text on complex backgrounds

> **Tip**: If OCR misses something you can see in the image, try zooming in on the original attachment to verify the text is clear and readable.

### Attachment Processing is Local

All attachment scanning happens **in your browser**. The image is never sent to NymAI's servers. This means:

- Your data stays on your computer
- Slower machines may take longer to scan
- Large files may take more time

---

## Redacting Attachments

### Preview Before Redacting

After scanning an attachment:

1. Click **[Preview Redaction]** to see what will be redacted
2. Review the preview — sensitive areas are highlighted
3. Decide whether to proceed with redaction

### How Attachment Redaction Works

When you redact an attachment:

1. Click **[Redact & Upload]**
2. NymAI creates a copy of the image
3. Black boxes are drawn over detected sensitive areas
4. The redacted version is uploaded as a **new attachment**
5. The original attachment remains unchanged

### Original vs Redacted

| Original Attachment     | Redacted Attachment     |
| ----------------------- | ----------------------- |
| Kept in record          | Added as new attachment |
| Contains sensitive data | Black boxes over PII    |
| May need manual removal | Safe to share           |

> **Important**: NymAI adds a redacted copy but doesn't delete the original. If you need to remove the original, you'll need to do that manually.

### Undo Attachment Redaction

Like text redaction, you have **10 seconds** to undo:

1. After uploading the redacted version, an **[Undo]** button appears
2. Click it to remove the redacted attachment
3. The original remains in place either way

---

## FAQ

### "What if I accidentally redact something?"

If you catch it within 10 seconds, click the **[Undo]** button immediately. The original text or attachment will be restored.

If more than 10 seconds have passed, the redaction is permanent. For text, you would need to manually re-enter the information. For attachments, the original is still in the record.

### "Does NymAI see my CRM data?"

No. NymAI processes record text in memory for less than a second, then clears it. We never store your record content. Our servers only receive and log metadata like:

- Record ID
- Types of data detected (e.g., "SSN", "Credit Card")
- Timestamp
- Redaction success/failure

We never log the actual sensitive data or record text.

### "What happens to the original attachment?"

The original attachment stays in the record. NymAI uploads a redacted **copy** as a new attachment. If you need to remove the original, you'll need to delete it manually through HubSpot.

### "Why wasn't something detected?"

NymAI uses pattern matching, which works for standard formats. It might miss:

- Unusually formatted numbers (e.g., SSN written as "one two three...")
- Data in images with poor quality
- Handwritten information
- Non-US formats (e.g., international phone numbers)

If you notice sensitive data that wasn't detected, you can manually redact it by editing the timeline item.

### "Can I redact just one item instead of all?"

Currently, NymAI redacts all detected items at once. For selective redaction, you can:

1. Redact all items
2. Undo within 10 seconds
3. Manually edit to redact only specific items

### "The scan is taking a long time"

Attachment scanning happens in your browser using OCR technology. Factors that affect speed:

- **File size**: Larger images take longer
- **Computer speed**: Slower machines need more time
- **Browser**: Some browsers are faster than others

Typical scan times:

- Small image: 3-5 seconds
- Large image: 10-15 seconds
- PDF: 10-20 seconds

### "I see 'Format not supported'"

NymAI currently supports PNG, JPG, WEBP, and PDF (first page). Other formats like DOCX, XLSX, or ZIP cannot be scanned.

### "Who do I contact for help?"

Contact your HubSpot administrator for:

- Enabling/disabling detection types
- Switching between detection-only and full mode
- Access issues

Contact NymAI support at **support@nymai.com** for:

- Technical issues
- Bug reports
- Feature requests

---

## Quick Reference

### Keyboard Shortcuts

_None currently — all actions are button-based_

### Key Actions

| Action              | Button                   | Time Limit |
| ------------------- | ------------------------ | ---------- |
| Scan text           | Automatic on record open | —          |
| Redact text         | [Redact All]             | —          |
| Undo text redaction | [Undo]                   | 10 seconds |
| Scan attachment     | [Scan]                   | —          |
| Redact attachment   | [Redact & Upload]        | —          |
| Undo attachment     | [Undo]                   | 10 seconds |

### Detection Types

| Type             | Pattern Example |
| ---------------- | --------------- |
| SSN              | XXX-XX-XXXX     |
| Credit Card      | 16 digits       |
| Email            | user@domain.com |
| Phone            | (XXX) XXX-XXXX  |
| Driver's License | State-specific  |
| Date of Birth    | MM/DD/YYYY      |
| Passport         | A12345678       |
| Bank Account     | 8-17 digits     |
| Routing Number   | 9 digits (ABA)  |
| IP Address       | XXX.XXX.XXX.XXX |
| Medicare ID      | 1EG4-TE5-MK72   |
| ITIN             | 9XX-XX-XXXX     |

---

_Last Updated: January 4, 2026_
_Version: 2.0_
