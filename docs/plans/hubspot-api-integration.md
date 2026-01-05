# Implementation Plan: HubSpot UI Extension API Integration

**Date:** January 5, 2026  
**Status:** Planning  
**Estimated Effort:** 2-3 days

---

## 1. Overview

### What We're Building

Wire the HubSpot UI Extension (`nymai-panel.tsx`) to make **real API calls** instead of mock data:

1. Fetch CRM activities (Notes, Emails, Calls) from HubSpot API
2. Send text to NymAI `/api/detect` for PII detection
3. On redact, call `/api/redact` and PATCH the records back to HubSpot
4. Implement 10-second undo with original text restoration

### Current State

- **UI Extension:** Deployed with mock `setTimeout()` data
- **API Server:** `/api/detect` and `/api/redact` endpoints working on DigitalOcean
- **Core Engine:** 12 PII types, 91 tests passing
- **Permissions:** `permittedUrls.fetch` already configured for HubSpot API + NymAI API

### Target State

```
Agent opens record → UI Extension loads
    ↓
hubspot.fetch() to HubSpot API → Get Notes/Emails/Calls
    ↓
hubspot.fetch() to POST /api/detect → Display findings
    ↓
Agent clicks [Redact All]
    ↓
hubspot.fetch() to POST /api/redact → Get redacted text
    ↓
hubspot.fetch() PATCH to HubSpot API → Update records
    ↓
Show [Undo - 10s] → Store original text for rollback
```

---

## 2. Technical Analysis

### 2.1 Current nymai-panel.tsx (Mock Implementation)

```typescript
// Current mock implementation
const handleScan = () => {
  setStatus('scanning');
  setTimeout(() => {
    const mockFindings = [
      { type: 'SSN', confidence: 94, preview: '***-**-6789' },
      { type: 'PHONE', confidence: 87, preview: '(***) ***-1234' },
    ];
    setFindings(mockFindings);
    setStatus('found');
  }, 1500);
};
```

### 2.2 API Contracts (Already Implemented)

**POST /api/detect**

```typescript
// Request
{ ticket_id: string, text: string, agent_id: string, comment_id?: string }

// Response
{
  findings: [{ type, confidence, start, end }],
  summary: { total_count, by_type },
  log_id
}
```

**POST /api/redact**

```typescript
// Request
{ ticket_id: string, text: string, agent_id: string, comment_id: string }

// Response
{ redacted_text: string, findings: [...], log_id: string }
```

### 2.3 HubSpot API Endpoints Needed

| Activity Type | GET Endpoint                 | PATCH Endpoint                           |
| ------------- | ---------------------------- | ---------------------------------------- |
| Notes         | `GET /crm/v3/objects/notes`  | `PATCH /crm/v3/objects/notes/{noteId}`   |
| Emails        | `GET /crm/v3/objects/emails` | `PATCH /crm/v3/objects/emails/{emailId}` |
| Calls         | `GET /crm/v3/objects/calls`  | `PATCH /crm/v3/objects/calls/{callId}`   |
| Conversations | TBD - Different API          | TBD                                      |

### 2.4 Constraints (from CLAUDE.md)

- **Must use `hubspot.fetch()`** - No `window.fetch` or browser globals
- **Only `@hubspot/ui-extensions` components** - No custom HTML/CSS
- **URLs must be in `permittedUrls.fetch`** - Already configured

---

## 3. Implementation Steps

### Phase 1: HubSpot API Integration (Fetch Activities)

1. Create `fetchActivities()` function using `hubspot.fetch()`
2. Fetch Notes, Emails, Calls associated with current record
3. Extract text content from each activity
4. Handle pagination if needed

### Phase 2: NymAI API Integration (Detection)

1. Create `detectPII()` function to call `/api/detect`
2. Batch activities and scan each one
3. Aggregate findings with activity IDs
4. Update UI to show findings grouped by activity

### Phase 3: Redaction Flow

1. Create `redactAll()` function to call `/api/redact` for each activity
2. Store original text in `undoState` Map before redaction
3. PATCH each HubSpot record with redacted text
4. Show success with undo button

### Phase 4: Undo Implementation

1. Maintain `Map<activityId, originalText>` state
2. On undo, PATCH original text back to HubSpot
3. Clear undo state after 10 seconds

### Phase 5: Error Handling & Edge Cases

1. Handle API failures gracefully
2. Handle records with no activities
3. Handle rate limiting
4. Add retry logic for transient failures

---

## 4. Design Decisions (Resolved)

### 4.1 Authentication & Workspace ID

| Decision         | Choice                  | Rationale                                                                                                   |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Workspace ID** | Use `context.portal.id` | Simple, no extra auth needed. Portal ID uniquely identifies each HubSpot account.                           |
| **Agent ID**     | Use `context.user.id`   | Available directly from HubSpot context. Also have access to `context.user.email`, `firstName`, `lastName`. |

**HubSpot Context Object (from documentation):**

```typescript
context.user.id; // Integer - HubSpot user ID
context.user.email; // String - User email
context.user.firstName; // String - First name
context.user.lastName; // String - Last name
context.portal.id; // Integer - Portal/workspace ID
context.crm.objectId; // String - Current record ID
context.crm.objectTypeId; // String - Object type
```

### 4.2 Activity Scope

| Decision           | Choice                                       |
| ------------------ | -------------------------------------------- |
| **Activity types** | Notes + Emails + Calls (all three for MVP)   |
| **How many**       | All activities on the record                 |
| **Scan trigger**   | Manual button click (defer auto-scan to V1+) |

### 4.3 Text Extraction

| Activity Type | Text Field      | Notes                                   |
| ------------- | --------------- | --------------------------------------- |
| Notes         | `hs_note_body`  | Plain text                              |
| Emails        | `hs_email_text` | Plain text version (avoid HTML parsing) |
| Calls         | `hs_call_body`  | Call transcript                         |

**Decision:** Strip to plain text for MVP. HTML parsing adds complexity.

### 4.4 Redaction Behavior

| Decision             | Choice                                                   |
| -------------------- | -------------------------------------------------------- |
| **Redaction mode**   | "Redact All" button (MVP). Selective redaction in V1+.   |
| **Failure handling** | Continue with others, show which failed. Don't rollback. |

### 4.5 UI/UX

| Decision             | Choice                                                |
| -------------------- | ----------------------------------------------------- |
| **Findings display** | Group by activity (per spec Section 2.5.2)            |
| **Activity context** | Show activity type and date (e.g., "Note from Jan 3") |

### 4.6 Performance & Error Handling

| Decision            | Choice                               |
| ------------------- | ------------------------------------ |
| **Caching**         | No caching for MVP (stale data risk) |
| **API unreachable** | Show error with retry button         |

---

## 5. Architecture Options

### Option A: Minimal (Single File)

**Philosophy:** Ship fast, refactor later. All code inline in `nymai-panel.tsx`.

| Aspect              | Details               |
| ------------------- | --------------------- |
| **Files to modify** | 1 (`nymai-panel.tsx`) |
| **Files to create** | 0                     |
| **Estimated time**  | 4-6 hours             |
| **Line count**      | ~350-400 lines        |

**Structure:**

```
packages/clients/hubspot/src/app/cards/
└── nymai-panel.tsx  ← All types, API functions, component inline
```

**Pros:**

- Ship in hours, not days
- No import/export complexity
- Easy to debug (all in one place)
- No build configuration changes

**Cons:**

- ~400 line file (manageable but large)
- Can't unit test API functions separately
- No code reuse if building more cards

---

### Option B: Modular (Clean Architecture)

**Philosophy:** Separation of concerns, testable, extensible.

| Aspect              | Details               |
| ------------------- | --------------------- |
| **Files to modify** | 1 (`nymai-panel.tsx`) |
| **Files to create** | 6-8                   |
| **Estimated time**  | 1-2 days              |
| **Line count**      | ~50-80 lines per file |

**Structure:**

```
packages/clients/hubspot/src/app/
├── cards/
│   └── nymai-panel.tsx      ← Slim component (~100 lines)
├── lib/
│   ├── types.ts             ← Shared TypeScript interfaces
│   ├── constants.ts         ← API URLs, config
│   ├── nymai-client.ts      ← NymAI API client
│   └── hubspot-client.ts    ← HubSpot API client
└── hooks/
    ├── useHubSpot.ts        ← Platform context hook
    └── usePIIScanner.ts     ← Detection/redaction orchestration
```

**Pros:**

- Clean separation of concerns
- Unit testable API clients
- Reusable for future cards
- Follows @nymai/core patterns

**Cons:**

- More files to manage
- Longer to implement
- More complex imports

---

### Recommendation

**For MVP: Option A (Minimal)**

Rationale:

1. Single HubSpot card - no reuse needed yet
2. Detection logic lives in @nymai/core (already tested)
3. Can extract to modules later if needed
4. Faster time to market

**Extract to Option B when:**

- Building a second UI Extension card
- Need unit tests for HubSpot API calls
- File exceeds 500 lines

---

## 6. Dependencies

### External Dependencies

- HubSpot CRM API v3
- NymAI API (already deployed on DigitalOcean)

### Internal Dependencies

- `@hubspot/ui-extensions` (already in package.json)
- No new npm packages needed

---

## 6. Files to Create/Modify

| File                               | Action            | Description                         |
| ---------------------------------- | ----------------- | ----------------------------------- |
| `nymai-panel.tsx`                  | Modify            | Replace mock with real API calls    |
| `src/app/lib/api.ts`               | Create            | NymAI API client functions          |
| `src/app/lib/hubspot.ts`           | Create            | HubSpot activity fetching functions |
| `src/app/lib/types.ts`             | Create            | Shared TypeScript types             |
| `src/app/hooks/usePIIDetection.ts` | Create (optional) | Custom hook for detection state     |

---

## 7. Testing Plan

### Manual Testing

1. Open Contact record → Click Scan → Verify real activities fetched
2. Confirm findings match actual PII in activities
3. Click Redact All → Verify HubSpot records updated
4. Click Undo within 10s → Verify original text restored
5. Wait 10s → Verify undo button disappears

### Edge Cases to Test

- Record with no activities
- Record with 50+ activities (pagination)
- Activity with no text content
- API timeout / network error
- Partial redaction failure

---

## 8. Risks & Mitigations

| Risk                       | Impact         | Mitigation                                       |
| -------------------------- | -------------- | ------------------------------------------------ |
| HubSpot API rate limiting  | Scan fails     | Implement retry with backoff                     |
| Large records slow to scan | Poor UX        | Limit to 20 activities, show progress            |
| Undo window too short      | Data loss      | Consider extending to 30s or adding confirmation |
| Auth complexity            | Delayed launch | Start with simple portal ID approach             |

---

## 9. Open Questions for Product

1. Should we track scan/redaction metrics for the admin dashboard?
2. Should we notify the record owner when PII is redacted?
3. Should redaction be logged in HubSpot activity timeline?

---

## Next Steps

1. **Answer clarifying questions** (above)
2. **Finalize architecture approach**
3. **Begin implementation**

---

_This plan will be updated as questions are answered._
