# NymAI E2E Testing Checklist

> Manual end-to-end testing checklist for pre-release verification

---

## Test Information

| Field             | Value                          |
| ----------------- | ------------------------------ |
| **Tester**        | **\*\*\*\***\_\_\_**\*\*\*\*** |
| **Date**          | **\*\*\*\***\_\_\_**\*\*\*\*** |
| **Environment**   | [ ] Sandbox [ ] Production     |
| **Build Version** | **\*\*\*\***\_\_\_**\*\*\*\*** |
| **Browser**       | **\*\*\*\***\_\_\_**\*\*\*\*** |

---

## Pre-Test Setup

Complete these checks before starting tests:

| #   | Check                                                     | Status            | Notes |
| --- | --------------------------------------------------------- | ----------------- | ----- |
| 1   | API server healthy (`GET /health` returns 200)            | [ ] Pass [ ] Fail |       |
| 2   | Admin console accessible (https://nymai-admin.vercel.app) | [ ] Pass [ ] Fail |       |
| 3   | HubSpot app installed in sandbox                          | [ ] Pass [ ] Fail |       |
| 4   | Test account has agent permissions                        | [ ] Pass [ ] Fail |       |
| 5   | Test account has admin console access                     | [ ] Pass [ ] Fail |       |
| 6   | Browser DevTools open for monitoring                      | [ ] Pass [ ] Fail |       |

### API Health Check

```bash
curl https://nymai-api-dnthb.ondigitalocean.app/health
# Expected: {"status":"ok"}
```

---

## Text Detection Tests

| #   | Test                  | Steps                                     | Expected Result                                         | Pass/Fail         | Notes |
| --- | --------------------- | ----------------------------------------- | ------------------------------------------------------- | ----------------- | ----- |
| 1   | SSN Detection         | Add note with "123-45-6789"               | Panel shows "SSN detected" with ~94% confidence         | [ ] Pass [ ] Fail |       |
| 2   | Credit Card Detection | Add note with "4111111111111111"          | Panel shows "Credit Card detected" with ~92% confidence | [ ] Pass [ ] Fail |       |
| 3   | Email Detection       | Add note with "test@example.com"          | Panel shows "Email detected" with ~88% confidence       | [ ] Pass [ ] Fail |       |
| 4   | Phone Detection       | Add note with "(555) 123-4567"            | Panel shows "Phone detected" with ~85% confidence       | [ ] Pass [ ] Fail |       |
| 5   | Multiple PII          | Add comment with all 4 types              | All 4 types detected and listed                         | [ ] Pass [ ] Fail |       |
| 6   | No PII                | Add comment with "Hello, how can I help?" | Shows "No sensitive data detected"                      | [ ] Pass [ ] Fail |       |

### Test Comment Template (Multiple PII)

```
Hi, my information is:
SSN: 123-45-6789
Card: 4111111111111111
Email: john.doe@email.com
Phone: (555) 123-4567
```

---

## Text Redaction Tests

| #   | Test                   | Steps                                    | Expected Result                                         | Pass/Fail         | Notes |
| --- | ---------------------- | ---------------------------------------- | ------------------------------------------------------- | ----------------- | ----- |
| 1   | Redact All             | With PII present, click [Redact All]     | Comment updated with masked values, undo banner appears | [ ] Pass [ ] Fail |       |
| 2   | Verify SSN Masking     | Check redacted SSN                       | Shows `***-**-6789` (last 4 visible)                    | [ ] Pass [ ] Fail |       |
| 3   | Verify CC Masking      | Check redacted credit card               | Shows `****-****-****-1111` (last 4 visible)            | [ ] Pass [ ] Fail |       |
| 4   | Undo (within 10s)      | Click [Undo] immediately after redaction | Original text restored                                  | [ ] Pass [ ] Fail |       |
| 5   | Undo Expiry            | Wait >10 seconds                         | Undo button disappears, redaction is permanent          | [ ] Pass [ ] Fail |       |
| 6   | HubSpot Record Updated | After redaction, refresh page            | Activity shows masked values in HubSpot                 | [ ] Pass [ ] Fail |       |

---

## Attachment Tests

### Test Files Needed

Prepare these test files before testing:

- [ ] PNG image with SSN text
- [ ] JPG image with email text
- [ ] PDF with credit card number
- [ ] DOCX file (for unsupported format test)

| #   | Test               | Steps                               | Expected Result                               | Pass/Fail         | Notes |
| --- | ------------------ | ----------------------------------- | --------------------------------------------- | ----------------- | ----- |
| 1   | PNG Scan           | Upload PNG with SSN, click [Scan]   | OCR completes, SSN detected in findings       | [ ] Pass [ ] Fail |       |
| 2   | JPG Scan           | Upload JPG with email, click [Scan] | OCR completes, Email detected in findings     | [ ] Pass [ ] Fail |       |
| 3   | PDF Scan           | Upload PDF with CC, click [Scan]    | OCR completes (first page), CC detected       | [ ] Pass [ ] Fail |       |
| 4   | Redact Attachment  | After scan, click [Redact & Upload] | Black boxes over PII, new attachment uploaded | [ ] Pass [ ] Fail |       |
| 5   | Attachment Undo    | Click [Undo] within 10 seconds      | Redacted attachment removed                   | [ ] Pass [ ] Fail |       |
| 6   | Unsupported Format | Upload DOCX file                    | Shows "Format not supported" error message    | [ ] Pass [ ] Fail |       |

---

## Admin Console Tests

| #   | Test                 | Steps                                                  | Expected Result                                    | Pass/Fail         | Notes |
| --- | -------------------- | ------------------------------------------------------ | -------------------------------------------------- | ----------------- | ----- |
| 1   | Login                | Navigate to admin console, click "Sign in with Google" | Successfully logged in, dashboard displayed        | [ ] Pass [ ] Fail |       |
| 2   | Dashboard Load       | View dashboard page                                    | Statistics display (scans, detections, redactions) | [ ] Pass [ ] Fail |       |
| 3   | Toggle Detection     | Disable SSN detection, save                            | Setting persists after refresh                     | [ ] Pass [ ] Fail |       |
| 4   | Verify Toggle Effect | In HubSpot, scan record with SSN                       | SSN not detected (since disabled)                  | [ ] Pass [ ] Fail |       |
| 5   | Change Mode          | Switch to Detection-Only mode                          | Redact buttons hidden in HubSpot panel             | [ ] Pass [ ] Fail |       |
| 6   | View Logs            | Navigate to Logs page                                  | Log entries displayed with filtering options       | [ ] Pass [ ] Fail |       |
| 7   | Export Logs          | Click Export, select CSV                               | CSV file downloads with log data                   | [ ] Pass [ ] Fail |       |

### Reset After Testing

- [ ] Re-enable all detection types
- [ ] Switch back to Full Mode

---

## Performance Tests

| #   | Metric                            | Target | Actual    | Pass/Fail         |
| --- | --------------------------------- | ------ | --------- | ----------------- |
| 1   | Text detection time               | <500ms | **\_** ms | [ ] Pass [ ] Fail |
| 2   | Text redaction time               | <5s    | **\_** s  | [ ] Pass [ ] Fail |
| 3   | Attachment OCR time (small image) | <15s   | **\_** s  | [ ] Pass [ ] Fail |
| 4   | Attachment redaction time         | <3s    | **\_** s  | [ ] Pass [ ] Fail |

### How to Measure

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform action
4. Note the time from action to completion

---

## Security Verification

| #   | Check                          | Method                                         | Pass/Fail         | Notes |
| --- | ------------------------------ | ---------------------------------------------- | ----------------- | ----- |
| 1   | No PII in network requests     | DevTools Network tab - inspect request bodies  | [ ] Pass [ ] Fail |       |
| 2   | No PII in console logs         | DevTools Console - check for sensitive data    | [ ] Pass [ ] Fail |       |
| 3   | No PII in response bodies      | DevTools Network tab - inspect response bodies | [ ] Pass [ ] Fail |       |
| 4   | Memory cleared after redaction | DevTools Memory tab - take heap snapshot       | [ ] Pass [ ] Fail |       |
| 5   | TLS encryption                 | Check browser padlock, verify TLS 1.2+         | [ ] Pass [ ] Fail |       |

### Security Check Details

**Network Tab Verification:**

1. Filter by "nymai" or API domain
2. Click each request
3. Check Request Payload - should contain only record IDs, not text
4. Check Response - should not contain raw PII

**Console Verification:**

1. Look for any logged sensitive data
2. Verify no console.log of request/response bodies
3. Check for errors that might expose data

---

## Edge Cases

| #   | Test               | Steps                                       | Expected Result               | Pass/Fail         | Notes |
| --- | ------------------ | ------------------------------------------- | ----------------------------- | ----------------- | ----- |
| 1   | Very long comment  | Add comment with 10+ PII items              | All items detected and listed | [ ] Pass [ ] Fail |       |
| 2   | Special characters | SSN with different separators (123.45.6789) | Still detected                | [ ] Pass [ ] Fail |       |
| 3   | Empty record       | Open record with no activities              | "No sensitive data detected"  | [ ] Pass [ ] Fail |       |
| 4   | Network offline    | Disconnect network, try detection           | Graceful error handling       | [ ] Pass [ ] Fail |       |
| 5   | Large attachment   | Upload 5MB+ image                           | Handles without crash         | [ ] Pass [ ] Fail |       |

---

## Browser Compatibility

Test in each supported browser:

| Browser | Version | Tests Pass     | Notes |
| ------- | ------- | -------------- | ----- |
| Chrome  | **\_**  | [ ] Yes [ ] No |       |
| Firefox | **\_**  | [ ] Yes [ ] No |       |
| Edge    | **\_**  | [ ] Yes [ ] No |       |
| Safari  | **\_**  | [ ] Yes [ ] No |       |

---

## Test Summary

### Results Overview

| Category         | Total Tests | Passed | Failed |
| ---------------- | ----------- | ------ | ------ |
| Pre-Test Setup   | 6           |        |        |
| Text Detection   | 6           |        |        |
| Text Redaction   | 6           |        |        |
| Attachment Tests | 6           |        |        |
| Admin Console    | 7           |        |        |
| Performance      | 4           |        |        |
| Security         | 5           |        |        |
| Edge Cases       | 5           |        |        |
| **TOTAL**        | **45**      |        |        |

### Failed Tests

List any failed tests with details:

| Test # | Description | Failure Details | Severity                        |
| ------ | ----------- | --------------- | ------------------------------- |
|        |             |                 | [ ] Blocker [ ] Major [ ] Minor |
|        |             |                 | [ ] Blocker [ ] Major [ ] Minor |
|        |             |                 | [ ] Blocker [ ] Major [ ] Minor |

---

## Sign-Off

### Approval Checklist

- [ ] All critical tests pass (no blockers)
- [ ] Performance targets met
- [ ] No security issues found
- [ ] Admin console fully functional
- [ ] Text detection/redaction working
- [ ] Attachment scanning/redaction working
- [ ] Undo functionality working

### Decision

**Approved for HubSpot Marketplace submission:**

[ ] **YES** - All critical tests pass, ready for submission

[ ] **NO** - Blocking issues must be resolved first

### Blocking Issues (if NO)

1. ***
2. ***
3. ***

### Signatures

| Role          | Name | Signature | Date |
| ------------- | ---- | --------- | ---- |
| Tester        |      |           |      |
| QA Lead       |      |           |      |
| Product Owner |      |           |      |

---

## Notes

_Additional observations, recommendations, or issues discovered during testing:_

```




```

---

_Checklist Version: 2.0_
_Last Updated: January 4, 2026_
