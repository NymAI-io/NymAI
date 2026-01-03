# Detection Enhancement Plan

**Version:** 1.0  
**Date:** January 2, 2026  
**Status:** Planning  
**Priority:** High (Pre-Launch Blocker)  
**Estimated Effort:** 7-11 hours

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Gap Analysis](#3-gap-analysis)
4. [Implementation Plan](#4-implementation-plan)
   - 4.1 [Phase 1: Pattern Expansion (10+ Patterns)](#41-phase-1-pattern-expansion-10-patterns)
   - 4.2 [Phase 2: Historical Scanning (All Comments)](#42-phase-2-historical-scanning-all-comments)
5. [Technical Specifications](#5-technical-specifications)
6. [Testing Strategy](#6-testing-strategy)
7. [Rollout Plan](#7-rollout-plan)
8. [Risk Assessment](#8-risk-assessment)

---

## 1. Executive Summary

### Problem

Our competitive positioning in `COMPETITIVE.md` claims:

- **"10+ PII patterns"** — We only have 5
- **"Historical scanning"** — We only scan the latest comment

These gaps undermine our competitive messaging and reduce detection coverage.

### Solution

Implement **Option B** in two phases:

1. **Phase 1:** Add 5+ new PII patterns to reach 10+ total
2. **Phase 2:** Scan ALL comments in a ticket, not just the latest

### Success Criteria

| Metric                      | Current    | Target              |
| --------------------------- | ---------- | ------------------- |
| PII pattern count           | 5          | 10+                 |
| Comments scanned per ticket | 1 (latest) | All public comments |
| Detection coverage          | ~60%       | ~85%                |
| Claims in COMPETITIVE.md    | Inaccurate | Accurate            |

---

## 2. Current State Analysis

### 2.1 Current Patterns (5 total)

Located in `packages/core/src/detection/patterns.ts`:

| Pattern | Regex                                                                      | Confidence | Validation |
| ------- | -------------------------------------------------------------------------- | ---------- | ---------- |
| SSN     | `/\b\d{3}-\d{2}-\d{4}\b/g`                                                 | 90%        | None       |
| CC      | `/\b(?:\d{4}[-\s]?){3}\d{4}\b/g`                                           | 95%        | Luhn check |
| EMAIL   | `/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g`                    | 98%        | None       |
| PHONE   | `/\b(?:\+?1[-.\\s]?)?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}\b/g` | 85%        | None       |
| DL      | `/\b[A-Z]{1,2}\d{5,12}\b/g`                                                | 70%        | None       |

### 2.2 Current Scanning Behavior

Located in `packages/clients/zendesk/src/App.tsx` (lines 61-66):

```typescript
const latestComment = useMemo(() => {
  if (!comments || comments.length === 0) return null;
  return comments
    .filter((c) => c.public && c.body)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}, [comments]);
```

**Issue:** Only the most recent public comment is scanned. Historical comments are ignored.

---

## 3. Gap Analysis

### 3.1 Pattern Gap

| Claimed in COMPETITIVE.md | Reality    | Gap                    |
| ------------------------- | ---------- | ---------------------- |
| "10+ PII patterns"        | 5 patterns | Missing 5+ patterns    |
| "Extensible patterns"     | Fixed set  | Need pattern expansion |

**Missing High-Value Patterns:**

- Date of Birth (DOB)
- Passport numbers
- Bank account + routing numbers
- IP addresses
- Medicare/Medicaid IDs
- ITIN (Individual Taxpayer ID)
- VIN (Vehicle Identification Numbers)

### 3.2 Scanning Gap

| Claimed in COMPETITIVE.md               | Reality                   | Gap                         |
| --------------------------------------- | ------------------------- | --------------------------- |
| "We scan ALL data including historical" | Only scans latest comment | Missing historical comments |
| "Historical scanning"                   | Forward-looking only      | Need all-comment iteration  |

**Impact:** If a ticket has 10 comments with PII in comment #3, we currently miss it entirely.

---

## 4. Implementation Plan

### 4.1 Phase 1: Pattern Expansion (10+ Patterns)

**Effort:** 1-2 hours  
**Risk:** Low  
**Dependencies:** None

#### 4.1.1 Files to Modify

| File                                      | Change                                 |
| ----------------------------------------- | -------------------------------------- |
| `packages/core/src/types.ts`              | Extend `DataType` union with new types |
| `packages/core/src/detection/patterns.ts` | Add new pattern definitions            |
| `packages/core/tests/detection.test.ts`   | Add test cases for new patterns        |

#### 4.1.2 New Patterns to Add

| Pattern          | Regex                                                                         | Confidence | Validation       | Priority |
| ---------------- | ----------------------------------------------------------------------------- | ---------- | ---------------- | -------- |
| **DOB**          | `/\b(0[1-9]\|1[0-2])[\/\-](0[1-9]\|[12]\d\|3[01])[\/\-](19\|20)\d{2}\b/g`     | 75%        | Date validation  | High     |
| **PASSPORT**     | `/\b[A-Z]{1,2}\d{6,9}\b/g`                                                    | 70%        | Length check     | High     |
| **BANK_ACCOUNT** | `/\b\d{8,17}\b/g`                                                             | 60%        | Context hints    | Medium   |
| **ROUTING**      | `/\b\d{9}\b/g`                                                                | 65%        | ABA checksum     | Medium   |
| **IP_ADDRESS**   | `/\b(?:\d{1,3}\.){3}\d{1,3}\b/g`                                              | 90%        | Range validation | High     |
| **MEDICARE**     | `/\b[1-9][A-Z]{1,2}[0-9]{1,2}-?[A-Z]{1,2}[0-9]{1,2}-?[A-Z]{2}[0-9]{1,2}\b/gi` | 75%        | Format check     | Medium   |
| **ITIN**         | `/\b9\d{2}-[7-9]\d-\d{4}\b/g`                                                 | 85%        | Range check      | Medium   |

#### 4.1.3 Implementation Steps

1. **Update types.ts:**

```typescript
// packages/core/src/types.ts
export type DataType =
  | 'SSN'
  | 'CC'
  | 'EMAIL'
  | 'PHONE'
  | 'DL'
  // New patterns
  | 'DOB'
  | 'PASSPORT'
  | 'BANK_ACCOUNT'
  | 'ROUTING'
  | 'IP_ADDRESS'
  | 'MEDICARE'
  | 'ITIN';
```

2. **Add patterns to patterns.ts:**

```typescript
// packages/core/src/detection/patterns.ts
DOB: {
  regex: /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g,
  confidence: 75,
  mask: () => '**/**/****',
},
PASSPORT: {
  regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
  confidence: 70,
  mask: (match: string) => `*****${match.slice(-4)}`,
},
IP_ADDRESS: {
  regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  confidence: 90,
  validate: (match: string) => {
    const parts = match.split('.').map(Number);
    return parts.every(p => p >= 0 && p <= 255);
  },
  mask: () => '***.***.***.***',
},
// ... additional patterns
```

3. **Add test cases:**

```typescript
// packages/core/tests/detection.test.ts
describe('DOB detection', () => {
  it('detects MM/DD/YYYY format', () => {
    const result = detect('Born on 12/25/1990');
    expect(result).toContainEqual(expect.objectContaining({ type: 'DOB' }));
  });

  it('detects MM-DD-YYYY format', () => {
    const result = detect('DOB: 01-15-1985');
    expect(result).toContainEqual(expect.objectContaining({ type: 'DOB' }));
  });
});
```

---

### 4.2 Phase 2: Historical Scanning (All Comments)

**Effort:** 4-6 hours  
**Risk:** Medium  
**Dependencies:** Phase 1 (patterns should be complete first)

#### 4.2.1 Files to Modify

| File                                                       | Change                                   | Complexity |
| ---------------------------------------------------------- | ---------------------------------------- | ---------- |
| `packages/clients/zendesk/src/App.tsx`                     | Iterate all comments, aggregate findings | Medium     |
| `packages/clients/zendesk/src/types/index.ts`              | Add `commentId` to Finding type          | Low        |
| `packages/clients/zendesk/src/components/FindingsList.tsx` | Group findings by comment                | Low        |
| `packages/api/src/routes/detect.ts`                        | Optional: batch endpoint                 | Low        |

#### 4.2.2 Architecture Change

**Before (Current):**

```
latestComment → detect() → findings[]
```

**After (Target):**

```
allComments[] → for each → detect() → taggedFindings[] → aggregate
```

#### 4.2.3 Implementation Steps

**Step 1: Update Finding type to include commentId**

```typescript
// packages/clients/zendesk/src/types/index.ts
export interface Finding {
  type: DataType;
  value: string;
  start: number;
  end: number;
  confidence: number;
  commentId: string; // NEW: Track which comment this finding came from
}
```

**Step 2: Replace latestComment with allComments scanning**

```typescript
// packages/clients/zendesk/src/App.tsx

// REMOVE this:
const latestComment = useMemo(() => {
  if (!comments || comments.length === 0) return null;
  return comments
    .filter((c) => c.public && c.body)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}, [comments]);

// ADD this:
const publicComments = useMemo(() => {
  if (!comments || comments.length === 0) return [];
  return comments
    .filter((c) => c.public && c.body)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}, [comments]);
```

**Step 3: Update scanForPII to iterate all comments**

```typescript
// packages/clients/zendesk/src/App.tsx

const scanForPII = useCallback(async () => {
  if (!apiClient || !ticketId || publicComments.length === 0 || !currentUser) {
    return;
  }

  setAppState('scanning');
  setError(null);

  try {
    const allFindings: Finding[] = [];

    // Scan each public comment
    for (const comment of publicComments) {
      const response = await apiClient.detect({
        ticket_id: ticketId,
        comment_id: String(comment.id),
        text: comment.body,
        agent_id: String(currentUser.id),
      });

      // Tag each finding with its source comment
      const taggedFindings = response.findings.map((f) => ({
        ...f,
        commentId: String(comment.id),
      }));

      allFindings.push(...taggedFindings);
    }

    setFindings(allFindings);
    setAppState('ready');
  } catch (err) {
    console.error('Scan failed:', err);
    setError(err instanceof Error ? err.message : 'Scan failed');
    setAppState('error');
  }
}, [apiClient, ticketId, publicComments, currentUser]);
```

**Step 4: Update redactAll to handle multiple comments**

```typescript
// packages/clients/zendesk/src/App.tsx

const redactAll = useCallback(async () => {
  if (!apiClient || !ticketId || findings.length === 0 || !currentUser) {
    return;
  }

  setAppState('redacting');
  setError(null);

  try {
    // Group findings by comment
    const findingsByComment = findings.reduce(
      (acc, finding) => {
        const commentId = finding.commentId;
        if (!acc[commentId]) acc[commentId] = [];
        acc[commentId].push(finding);
        return acc;
      },
      {} as Record<string, Finding[]>
    );

    // Store undo state for all comments
    const undoStates: UndoState[] = [];

    // Redact each comment that has findings
    for (const [commentId, commentFindings] of Object.entries(findingsByComment)) {
      const comment = publicComments.find((c) => String(c.id) === commentId);
      if (!comment) continue;

      const response = await apiClient.redact({
        ticket_id: ticketId,
        comment_id: commentId,
        text: comment.body,
        agent_id: String(currentUser.id),
      });

      // Store undo state
      undoStates.push({
        originalText: comment.body,
        commentId: commentId,
        redactedCount: commentFindings.length,
      });

      // Update the comment in Zendesk
      await updateComment(commentId, response.redacted_text);
    }

    // Store combined undo state
    setUndoStates(undoStates);
    setFindings([]);
    setAppState('ready');
  } catch (err) {
    console.error('Redaction failed:', err);
    setError(err instanceof Error ? err.message : 'Redaction failed');
    setAppState('ready');
  }
}, [apiClient, ticketId, findings, publicComments, currentUser, updateComment]);
```

**Step 5: Update FindingsList to show comment context**

```typescript
// packages/clients/zendesk/src/components/FindingsList.tsx

interface FindingsListProps {
  findings: Finding[];
  comments?: Comment[];  // Optional: to show comment preview
}

export function FindingsList({ findings, comments }: FindingsListProps) {
  // Group findings by comment
  const findingsByComment = useMemo(() => {
    return findings.reduce((acc, finding) => {
      const commentId = finding.commentId || 'unknown';
      if (!acc[commentId]) acc[commentId] = [];
      acc[commentId].push(finding);
      return acc;
    }, {} as Record<string, Finding[]>);
  }, [findings]);

  return (
    <div className="space-y-4">
      {Object.entries(findingsByComment).map(([commentId, commentFindings]) => (
        <div key={commentId} className="border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-2">
            Comment #{commentId.slice(-4)}
          </div>
          {commentFindings.map((finding, idx) => (
            <FindingItem key={idx} finding={finding} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Step 6: Update UndoState to handle multiple comments**

```typescript
// packages/clients/zendesk/src/App.tsx

// Change from single undo state:
const [undoState, setUndoState] = useState<UndoState | null>(null);

// To array of undo states:
const [undoStates, setUndoStates] = useState<UndoState[]>([]);

// Update handleUndo to restore all comments:
const handleUndo = useCallback(async () => {
  if (undoStates.length === 0) return;

  try {
    for (const state of undoStates) {
      await updateComment(state.commentId, state.originalText);
    }
    setUndoStates([]);
    scanForPII();
  } catch (err) {
    console.error('Undo failed:', err);
    setError('Failed to undo redaction');
  }
}, [undoStates, updateComment, scanForPII]);
```

---

## 5. Technical Specifications

### 5.1 Performance Considerations

| Scenario                | Current    | After Phase 2 |
| ----------------------- | ---------- | ------------- |
| Ticket with 1 comment   | 1 API call | 1 API call    |
| Ticket with 10 comments | 1 API call | 10 API calls  |
| Ticket with 50 comments | 1 API call | 50 API calls  |

**Mitigation Options:**

1. **Parallel requests:** Use `Promise.all()` for concurrent scanning
2. **Batch endpoint:** Create `/api/detect/batch` that accepts multiple texts
3. **Client-side caching:** Cache scan results per comment ID
4. **Scan limit:** Cap at most recent 20 comments (configurable)

**Recommended for MVP:** Use `Promise.all()` with concurrency limit of 5.

```typescript
// Parallel scanning with concurrency limit
import pLimit from 'p-limit';

const limit = pLimit(5); // Max 5 concurrent requests

const scanPromises = publicComments.map((comment) =>
  limit(() =>
    apiClient.detect({
      ticket_id: ticketId,
      comment_id: String(comment.id),
      text: comment.body,
      agent_id: String(currentUser.id),
    })
  )
);

const results = await Promise.all(scanPromises);
```

### 5.2 Memory Considerations

| Concern                          | Mitigation                            |
| -------------------------------- | ------------------------------------- |
| Large tickets (50+ comments)     | Limit scan to 20 most recent comments |
| Long comments (10KB+)            | Already handled by API                |
| Undo state for multiple comments | Clear after 10s (existing behavior)   |

### 5.3 API Changes

**No breaking API changes required.** The `/api/detect` endpoint already accepts individual comments. Phase 2 changes are client-side only.

**Optional future enhancement:** Add `/api/detect/batch` for efficiency.

---

## 6. Testing Strategy

### 6.1 Unit Tests (Phase 1)

| Test Case                      | Expected Result                  |
| ------------------------------ | -------------------------------- |
| DOB in MM/DD/YYYY format       | Detected with 75% confidence     |
| DOB in MM-DD-YYYY format       | Detected with 75% confidence     |
| Invalid DOB (13/45/2025)       | Not detected (invalid month/day) |
| Passport number (AB123456)     | Detected with 70% confidence     |
| Valid IPv4 (192.168.1.1)       | Detected with 90% confidence     |
| Invalid IPv4 (999.999.999.999) | Not detected (validation fails)  |
| ITIN (9XX-7X-XXXX format)      | Detected with 85% confidence     |

### 6.2 Integration Tests (Phase 2)

| Test Case                                 | Expected Result                  |
| ----------------------------------------- | -------------------------------- |
| Ticket with 1 comment containing SSN      | 1 finding returned               |
| Ticket with 3 comments, SSN in comment #2 | 1 finding with correct commentId |
| Ticket with 5 comments, PII in 3 of them  | 3+ findings grouped by commentId |
| Redact all on multi-comment ticket        | All affected comments updated    |
| Undo on multi-comment redaction           | All comments restored            |

### 6.3 Manual E2E Tests

- [ ] Create ticket with 5 comments, PII in comments 1, 3, 5
- [ ] Verify sidebar shows findings grouped by comment
- [ ] Click "Redact All" and verify all 3 comments are updated
- [ ] Click "Undo" within 10 seconds and verify restoration
- [ ] Verify undo expires after 10 seconds

---

## 7. Rollout Plan

### 7.1 Phase 1 Rollout (Patterns)

| Step      | Action                                     | Duration     |
| --------- | ------------------------------------------ | ------------ |
| 1         | Implement new patterns in `patterns.ts`    | 30 min       |
| 2         | Update `types.ts` with new DataType values | 10 min       |
| 3         | Add unit tests for each new pattern        | 45 min       |
| 4         | Run full test suite, fix any regressions   | 30 min       |
| 5         | Update `project_spec.md` with new patterns | 15 min       |
| **Total** |                                            | **~2 hours** |

### 7.2 Phase 2 Rollout (Historical Scanning)

| Step      | Action                                           | Duration     |
| --------- | ------------------------------------------------ | ------------ |
| 1         | Update Finding type with `commentId`             | 15 min       |
| 2         | Refactor `scanForPII` to iterate all comments    | 1 hour       |
| 3         | Refactor `redactAll` to handle multiple comments | 1 hour       |
| 4         | Update `handleUndo` for multi-comment undo       | 30 min       |
| 5         | Update `FindingsList` UI to group by comment     | 45 min       |
| 6         | Add parallel request handling with p-limit       | 30 min       |
| 7         | Integration testing                              | 1 hour       |
| 8         | Manual E2E testing in Zendesk sandbox            | 1 hour       |
| **Total** |                                                  | **~6 hours** |

### 7.3 Combined Timeline

| Day       | Tasks                                         |
| --------- | --------------------------------------------- |
| **Day 1** | Phase 1: All pattern work (2 hours)           |
| **Day 2** | Phase 2: Core refactoring (3 hours)           |
| **Day 3** | Phase 2: UI updates + testing (3 hours)       |
| **Day 4** | Documentation updates + final review (1 hour) |

---

## 8. Risk Assessment

### 8.1 Phase 1 Risks

| Risk                            | Likelihood | Impact | Mitigation                              |
| ------------------------------- | ---------- | ------ | --------------------------------------- |
| False positives on new patterns | Medium     | Low    | Lower confidence scores, add validation |
| Regex performance degradation   | Low        | Low    | Patterns are O(n), already fast         |
| Breaking existing patterns      | Low        | High   | Comprehensive test suite                |

### 8.2 Phase 2 Risks

| Risk                               | Likelihood | Impact | Mitigation                        |
| ---------------------------------- | ---------- | ------ | --------------------------------- |
| Slow scanning on large tickets     | Medium     | Medium | Parallel requests, comment limit  |
| API rate limiting                  | Low        | Medium | Concurrency limit (5 requests)    |
| Undo state memory bloat            | Low        | Low    | 10-second timeout already handles |
| UI confusion with grouped findings | Medium     | Low    | Clear comment labels in UI        |

### 8.3 Rollback Plan

**Phase 1:** Revert `patterns.ts` and `types.ts` changes. No data migration needed.

**Phase 2:** Revert App.tsx changes. The API is unchanged, so no backend rollback needed.

---

## Document History

| Version | Date            | Author | Changes      |
| ------- | --------------- | ------ | ------------ |
| 1.0     | January 2, 2026 | NymAI  | Initial plan |

---

**End of Detection Enhancement Plan**
