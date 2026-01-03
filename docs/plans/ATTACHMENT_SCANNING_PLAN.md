# Attachment Scanning Implementation Plan

**Version:** 1.0
**Created:** January 2, 2026
**Status:** Draft
**Related:** [ROADMAP.md](./ROADMAP.md), [project_spec.md](../project_spec.md), [architecture.md](../memory/architecture.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technical Approach](#2-technical-approach)
3. [Package Structure](#3-package-structure)
4. [Implementation Steps](#4-implementation-steps)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment & Rollout](#6-deployment--rollout)
7. [Success Metrics](#7-success-metrics)
8. [Risks & Mitigations](#8-risks--mitigations)

---

## 1. Overview

### Objective
Implement client-side OCR attachment scanning for NymAI Zendesk app, enabling agents to detect PII in images and PDFs without uploading files to NymAI servers.

### Scope
- **In Scope:**
  - Client-side OCR via Tesseract.js
  - Supported formats: PNG, JPG/JPEG, WEBP, PDF (text-based)
  - Agent-initiated scanning (manual trigger)
  - OCR findings display in sidebar
  - **Image redaction**: Bounding box extraction + canvas-based black box overlays
  - **Redacted attachment upload**: Replace original attachment in Zendesk
  - Performance target: <15s p95 per image (OCR), <3s for redaction

- **Out of Scope:**
  - Facial redaction (separate feature, requires face detection models)
  - Non-text visual PII (signatures, photos, handwriting)
  - Automated background scanning
  - DOCX/XLSX parsing (deferred to V1+)
  - Server-side OCR worker (future enhancement)

### Success Criteria
- ✅ OCR accuracy ≥75% on test dataset
- ✅ P95 scan time <15s for single image
- ✅ **Redaction accuracy ≥95%** (all detected PII regions covered by black boxes)
- ✅ **Redaction speed <3s** for canvas manipulation + upload
- ✅ Zero image data uploaded to NymAI servers (before redaction)
- ✅ Browser memory cleared after scan and redaction
- ✅ Graceful error handling for unsupported formats

---

## 2. Technical Approach

### 2.1 Technology Choice: Tesseract.js

| Factor | Tesseract.js | Cloud APIs (AWS/GCP) |
|--------|--------------|----------------------|
| **Cost** | FREE | $1.50/1000 images |
| **Privacy** | Client-side (best) | Server upload required |
| **Accuracy** | 75-85% | 90-95% |
| **Bundle Size** | ~5 MB (gzipped) | 0 MB |
| **Latency** | 5-12s | 2-5s |
| **Infrastructure** | $0 | $15-30/year at target scale |

**Decision:** Tesseract.js for privacy-first positioning and zero infrastructure cost.

### 2.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ZENDESK SIDEBAR                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [Scan Attachment] Button (Agent clicks)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Fetch Attachment from Zendesk API                │   │
│  │     → Browser memory (blob)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. Tesseract.js Worker (in browser)                 │   │
│  │     → Extract text from image/PDF (5-12s)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. POST /api/detect                                 │   │
│  │     → Send extracted text only (NO image)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. Display Findings in Sidebar                       │   │
│  │     → SSN: 2, CC: 1, Email: 3                         │   │
│  │     → [Redact Attachment] Button                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. Agent Clicks [Redact Attachment]                  │   │
│  │     → Canvas API draws black boxes over PII regions   │   │
│  │     → Extract bounding boxes from Tesseract.js        │   │
│  │     → Generate redacted image blob                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  6. Upload Redacted Image to Zendesk                  │   │
│  │     → Replace original attachment                     │   │
│  │     → Log metadata (NO raw PII)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           v                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  7. Clear Browser Memory                              │   │
│  │     → Original image blob = null                      │   │
│  │     → Redacted image blob = null                      │   │
│  │     → Extracted text = null                           │   │
│  │     → Bounding boxes = null                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Critical:**
- Zero **raw** image data sent to NymAI servers. Only extracted text is sent to `/api/detect`.
- Redacted images (with black boxes) uploaded to Zendesk to replace originals.
- All PII coordinates and bounding boxes cleared from memory after redaction.

---

## 3. Package Structure

### 3.1 New Files

```
packages/clients/zendesk/
├── src/
│   ├── components/
│   │   ├── AttachmentScanner.tsx       # NEW: Scan button + results
│   │   ├── AttachmentRedactor.tsx      # NEW: Redaction UI + canvas manipulation
│   │   ├── ImageCanvas.tsx             # NEW: Canvas drawing utilities
│   │   ├── OCRProgress.tsx              # NEW: Progress indicator
│   │   └── OCRFindings.tsx              # NEW: Findings display
│   ├── hooks/
│   │   └── useTesseract.ts              # NEW: Tesseract.js wrapper (with bounding boxes)
│   ├── lib/
│   │   ├── tesseract.worker.ts          # NEW: Web Worker setup
│   │   └── image-redaction.ts           # NEW: Bounding box → canvas utilities
│   └── types/
│       ├── ocr.ts                        # NEW: OCR-related types
│       └── redaction.ts                  # NEW: Redaction types (bounding boxes, coordinates)
├── public/
│   └── workers/
│       └── tesseract-worker.js          # NEW: Worker bundle
└── package.json                          # UPDATE: Add tesseract.js
```

### 3.2 Modified Files

```
packages/clients/zendesk/
├── src/
│   ├── App.tsx                          # UPDATE: Add scanner to sidebar
│   ├── components/
│   │   └── Sidebar.tsx                   # UPDATE: Include AttachmentScanner
│   └── services/
│       └── zendesk.ts                    # UPDATE: Add attachment fetch method
```

---

## 4. Implementation Steps

### Step 1: Package Setup (1 day)

**Task:** Install and configure Tesseract.js

```bash
cd packages/clients/zendesk
pnpm add tesseract.js@5
```

**Create:** `src/types/ocr.ts`
```typescript
export interface OCRResult {
  text: string;
  confidence: number;
}

export interface OCRProgress {
  status: 'initializing' | 'recognizing' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
}

export interface AttachmentScanResult {
  attachmentId: string;
  fileName: string;
  fileType: string;
  findings: PIIFinding[];
  ocrConfidence: number;
  duration: number; // milliseconds
}

export interface PIIFinding {
  type: 'SSN' | 'CC' | 'EMAIL' | 'PHONE' | 'DL';
  value: string; // Masked value for display
  position: { start: number; end: number };
  confidence: number;
}
```

---

### Step 2: Tesseract Hook (2 days)

**Task:** Create reusable Tesseract.js wrapper hook

**Create:** `src/hooks/useTesseract.ts`

```typescript
import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { OCRResult, OCRProgress } from '../types/ocr';

export function useTesseract() {
  const [progress, setProgress] = useState<OCRProgress>({
    status: 'initializing',
    progress: 0,
  });

  const recognize = useCallback(async (imageFile: File): Promise<OCRResult> => {
    setProgress({ status: 'initializing', progress: 0 });

    try {
      const worker = await Tesseract.createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress({
              status: 'recognizing',
              progress: Math.round(m.progress * 100),
            });
          }
        },
      });

      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      const { data } = await worker.recognize(imageFile);

      await worker.terminate();

      setProgress({ status: 'complete', progress: 100 });

      return {
        text: data.text,
        confidence: data.confidence,
      };
    } catch (error) {
      setProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'OCR failed',
      });
      throw error;
    }
  }, []);

  return { recognize, progress };
}
```

**Why Web Worker?** Tesseract.js blocks the main thread. Use worker to keep UI responsive during 5-12s scans.

---

### Step 3: Zendesk Attachment Fetcher (1 day)

**Task:** Add method to fetch attachments from Zendesk API

**Update:** `src/services/zendesk.ts`

```typescript
export async function fetchAttachment(
  attachmentId: string,
  accessToken: string
): Promise<Blob> {
  const response = await fetch(
    `https://nymai.zendesk.com/api/v2/attachments/${attachmentId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch attachment: ${response.statusText}`);
  }

  return response.blob();
}
```

---

### Step 4: Attachment Scanner Component (3 days)

**Task:** Build main scanner UI component

**Create:** `src/components/AttachmentScanner.tsx`

```typescript
import React, { useState } from 'react';
import { useTesseract } from '../hooks/useTesseract';
import { OCRProgress } from '../types/ocr';
import { detectPII } from '../utils/detection'; // Use core detection
import { AttachmentScanResult } from '../types/ocr';
import OCRProgressIndicator from './OCRProgress';
import OCRFindings from './OCRFindings';

interface AttachmentScannerProps {
  ticketId: string;
  attachments: Array<{
    id: string;
    file_name: string;
    content_type: string;
    content_url: string;
  }>;
}

export default function AttachmentScanner({ ticketId, attachments }: AttachmentScannerProps) {
  const { recognize, progress } = useTesseract();
  const [scanResult, setScanResult] = useState<AttachmentScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (attachment: typeof attachments[0]) => {
    setScanning(true);
    setScanResult(null);

    try {
      // Fetch attachment into browser memory
      const response = await fetch(attachment.content_url, {
        headers: {
          'Authorization': `Bearer ${ZAFClient.getSetting('token')}`,
        },
      });
      const blob = await response.blob();
      const file = new File([blob], attachment.file_name, {
        type: attachment.content_type,
      });

      // Run OCR in browser
      const ocrResult = await recognize(file);

      // Detect PII in extracted text
      const findings = detectPII(ocrResult.text); // Call existing detection

      setScanResult({
        attachmentId: attachment.id,
        fileName: attachment.file_name,
        fileType: attachment.content_type,
        findings,
        ocrConfidence: ocrResult.confidence,
        duration: Date.now() - startTime,
      });

      // Clear memory
      URL.revokeObjectURL(attachment.content_url);
    } catch (error) {
      console.error('Scan failed:', error);
      setScanResult({
        attachmentId: attachment.id,
        fileName: attachment.file_name,
        fileType: attachment.content_type,
        findings: [],
        ocrConfidence: 0,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="attachment-scanner">
      <h3>Attachment Scanning</h3>

      {attachments.map((attachment) => (
        <div key={attachment.id} className="attachment-item">
          <span className="file-name">{attachment.file_name}</span>
          <button
            onClick={() => handleScan(attachment)}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Scan for PII'}
          </button>
        </div>
      ))}

      {scanning && <OCRProgressIndicator progress={progress} />}

      {scanResult && <OCRFindings result={scanResult} />}
    </div>
  );
}
```

---

### Step 5: Progress Indicator Component (1 day)

**Task:** Build OCR progress UI

**Create:** `src/components/OCRProgress.tsx`

```typescript
import React from 'react';
import { OCRProgress } from '../types/ocr';

interface Props {
  progress: OCRProgress;
}

export default function OCRProgressIndicator({ progress }: Props) {
  const messages = {
    initializing: 'Initializing OCR engine...',
    recognizing: `Recognizing text... ${progress.progress}%`,
    complete: 'Scan complete!',
    error: `Error: ${progress.message}`,
  };

  return (
    <div className="ocr-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      <p className="progress-message">{messages[progress.status]}</p>
    </div>
  );
}
```

---

### Step 6: Findings Display Component (2 days)

**Task:** Display OCR results with PII findings

**Create:** `src/components/OCRFindings.tsx`

```typescript
import React from 'react';
import { AttachmentScanResult } from '../types/ocr';

interface Props {
  result: AttachmentScanResult;
}

export default function OCRFindings({ result }: Props) {
  if (result.error) {
    return (
      <div className="ocr-findings error">
        <h4>Scan Failed</h4>
        <p>{result.error}</p>
        <p className="hint">Supported formats: PNG, JPG, WEBP, PDF</p>
      </div>
    );
  }

  const findingCount = result.findings.length;

  return (
    <div className="ocr-findings">
      <h4>Scan Results: {result.fileName}</h4>

      <div className="scan-meta">
        <span>Confidence: {Math.round(result.ocrConfidence)}%</span>
        <span>Duration: {(result.duration / 1000).toFixed(1)}s</span>
      </div>

      {findingCount === 0 ? (
        <p className="no-findings">No PII detected</p>
      ) : (
        <div className="findings-list">
          <p className="summary">{findingCount} PII items found:</p>

          {Object.entries(
            groupBy(result.findings, 'type')
          ).map(([type, items]) => (
            <div key={type} className="finding-group">
              <h5>{type}: {items.length}</h5>
              <ul>
                {items.slice(0, 5).map((item, i) => (
                  <li key={i}>{item.value}</li>
                ))}
                {items.length > 5 && (
                  <li>...and {items.length - 5} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ocr-findings {
          margin-top: 16px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .finding-group {
          margin: 8px 0;
        }
        .finding-group h5 {
          margin: 4px 0;
          font-size: 14px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = item[key] as string;
    (result[group] = result[group] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}
```

---

### Step 7: Integration with Sidebar (1 day)

**Task:** Add scanner to Zendesk sidebar

**Update:** `src/components/Sidebar.tsx`

```typescript
import AttachmentScanner from './AttachmentScanner';

export default function Sidebar() {
  const [ticket] = useTicketContext();

  return (
    <div className="sidebar">
      {/* Existing components... */}

      {ticket.attachments && ticket.attachments.length > 0 && (
        <AttachmentScanner
          ticketId={ticket.id}
          attachments={ticket.attachments}
        />
      )}
    </div>
  );
}
```

---

### Step 8: Core Detection Integration (0.5 days)

**Task:** Ensure core detection works with OCR-extracted text

**Note:** The core detection engine (`@nymai/core`) already supports text detection. No changes needed—just import and use.

**Create:** `src/utils/detection.ts` (in zendesk package)

```typescript
import { detect } from '@nymai/core';
import { PIIFinding } from '../types/ocr';

export function detectPII(text: string): PIIFinding[] {
  const results = detect(text);

  return results.map((result) => ({
    type: result.type,
    value: maskValue(result.value, result.type),
    position: {
      start: result.start,
      end: result.end,
    },
    confidence: result.confidence,
  }));
}

function maskValue(value: string, type: string): string {
  // Reuse masking logic from core
  switch (type) {
    case 'SSN':
      return value.replace(/\d/g, '*').slice(0, 11);
    case 'CC':
      return value.replace(/\d(?=.{4})/g, '*');
    case 'EMAIL':
      const [local, domain] = value.split('@');
      return `${local[0]}***@${domain}`;
    case 'PHONE':
      return value.replace(/\d(?=.{4})/g, '*');
    default:
      return value;
  }
}
```

---

### Step 9: Error Handling & Edge Cases (2 days)

**Task:** Handle unsupported formats and errors

**Error Cases to Handle:**

| Scenario | Handling |
|----------|----------|
| Unsupported format (DOCX, XLSX) | Show message: "Format not supported. Supported: PNG, JPG, WEBP, PDF" |
| OCR timeout (>30s) | Show error, offer retry |
| Image too large (>10MB) | Show error: "Image too large. Max 10MB" |
| Empty OCR result | Show: "No text detected in image" |
| Network error (Zendesk API) | Show: "Failed to fetch attachment. Retry?" |
| Browser不支持Web Workers | Show: "Your browser doesn't support attachment scanning" |

---

### Step 10: Styling & Polish (1 day)

**Task:** Make scanner UI match existing sidebar design

**Considerations:**
- Match existing color scheme and typography
- Responsive design (sidebar width varies)
- Loading states and animations
- Error states with clear guidance
- Accessibility (ARIA labels, keyboard navigation)

---

### Step 11: Create Redaction Types (0.5 days)

**Task:** Define TypeScript interfaces for bounding boxes and redaction workflow

**Create:** `src/types/redaction.ts`

```typescript
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PIIRegion {
  type: string; // SSN, CC, EMAIL, PHONE, DL
  boundingBox: BoundingBox;
  text: string; // Original text (cleared after redaction)
  confidence: number;
}

export interface RedactionResult {
  attachmentId: string;
  fileName: string;
  originalSize: number;
  redactedSize: number;
  regionsRedacted: number;
  redactedBlob: Blob;
  uploadUrl?: string; // Zendesk upload response
}

export interface CanvasRedactionOptions {
  fillColor: string; // Default: '#000000' (black)
  padding: number; // Pixels to add around bounding box (default: 2)
}
```

---

### Step 12: Extend useTesseract Hook for Bounding Boxes (1 day)

**Task:** Extract word-level bounding box coordinates from Tesseract.js

**Update:** `src/hooks/useTesseract.ts`

```typescript
import { createWorker, PSM } from 'tesseract.js';
import type { BoundingBox, PIIRegion } from '../types/redaction';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    bbox: BoundingBox;
    confidence: number;
  }>;
}

export function useTesseract() {
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const [progress, setProgress] = useState(0);

  const recognize = async (file: File): Promise<OCRResult> => {
    if (!workerRef.current) {
      workerRef.current = await createWorker('eng', PSM.AUTO, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        },
      });
    }

    const { data } = await workerRef.current.recognize(file);

    // Extract word-level bounding boxes
    const words = data.words.map((word) => ({
      text: word.text,
      bbox: {
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
      },
      confidence: word.confidence,
    }));

    return {
      text: data.text,
      confidence: data.confidence,
      words,
    };
  };

  const terminate = async () => {
    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  return { recognize, progress, terminate };
}
```

---

### Step 13: Create Image Redaction Utility (1.5 days)

**Task:** Build canvas-based utilities for drawing black boxes over PII regions

**Create:** `src/lib/image-redaction.ts`

```typescript
import type { BoundingBox, PIIRegion, CanvasRedactionOptions } from '../types/redaction';

/**
 * Maps detected PII text to bounding boxes from OCR words
 */
export function mapPIIToBoundingBoxes(
  piiFindings: Array<{ type: string; value: string; position: { start: number; end: number } }>,
  ocrWords: Array<{ text: string; bbox: BoundingBox }>,
  extractedText: string
): PIIRegion[] {
  const regions: PIIRegion[] = [];

  for (const finding of piiFindings) {
    // Find the PII text in the extracted OCR text
    const piiText = extractedText.substring(finding.position.start, finding.position.end);

    // Find matching words in OCR results
    const matchingWords = findMatchingWords(piiText, ocrWords);

    if (matchingWords.length > 0) {
      // Merge bounding boxes if PII spans multiple words
      const mergedBox = mergeBoundingBoxes(matchingWords.map((w) => w.bbox));

      regions.push({
        type: finding.type,
        boundingBox: mergedBox,
        text: piiText,
        confidence: 1.0, // From core detection
      });
    }
  }

  return regions;
}

/**
 * Finds OCR words that match the PII text
 */
function findMatchingWords(
  piiText: string,
  ocrWords: Array<{ text: string; bbox: BoundingBox }>
): Array<{ text: string; bbox: BoundingBox }> {
  const normalizedPII = piiText.toLowerCase().replace(/\s+/g, '');
  const results: Array<{ text: string; bbox: BoundingBox }> = [];

  // Sliding window approach to find consecutive words matching PII
  for (let i = 0; i < ocrWords.length; i++) {
    let windowText = '';
    let windowWords: typeof ocrWords = [];

    for (let j = i; j < ocrWords.length; j++) {
      windowWords.push(ocrWords[j]);
      windowText += ocrWords[j].text.toLowerCase().replace(/\s+/g, '');

      if (windowText === normalizedPII) {
        return windowWords;
      }

      if (windowText.length > normalizedPII.length) {
        break;
      }
    }
  }

  return results;
}

/**
 * Merges multiple bounding boxes into a single box
 */
function mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox {
  if (boxes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.width));
  const maxY = Math.max(...boxes.map((b) => b.y + b.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Draws black boxes over PII regions on a canvas
 */
export async function redactImageOnCanvas(
  imageBlob: Blob,
  piiRegions: PIIRegion[],
  options: CanvasRedactionOptions = { fillColor: '#000000', padding: 2 }
): Promise<Blob> {
  // Load image into Image element
  const img = await loadImage(imageBlob);

  // Create canvas matching image dimensions
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Draw black boxes over PII regions
  ctx.fillStyle = options.fillColor;
  for (const region of piiRegions) {
    const { x, y, width, height } = region.boundingBox;
    ctx.fillRect(
      x - options.padding,
      y - options.padding,
      width + options.padding * 2,
      height + options.padding * 2
    );
  }

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate redacted image blob'));
      }
    }, 'image/png');
  });
}

/**
 * Loads image blob into Image element
 */
function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
```

---

### Step 14: Build AttachmentRedactor Component (2 days)

**Task:** Create UI component for redacting and uploading redacted attachments

**Create:** `src/components/AttachmentRedactor.tsx`

```typescript
import { useState } from 'react';
import type { PIIRegion, RedactionResult } from '../types/redaction';
import { redactImageOnCanvas, mapPIIToBoundingBoxes } from '../lib/image-redaction';
import { uploadRedactedAttachment } from '../lib/zendesk-api';
import ImageCanvas from './ImageCanvas';

interface AttachmentRedactorProps {
  attachmentId: string;
  fileName: string;
  imageBlob: Blob;
  piiFindings: Array<{ type: string; value: string; position: { start: number; end: number } }>;
  ocrWords: Array<{ text: string; bbox: BoundingBox }>;
  extractedText: string;
  ticketId: string;
  onRedactionComplete: (result: RedactionResult) => void;
  onCancel: () => void;
}

export default function AttachmentRedactor({
  attachmentId,
  fileName,
  imageBlob,
  piiFindings,
  ocrWords,
  extractedText,
  ticketId,
  onRedactionComplete,
  onCancel,
}: AttachmentRedactorProps) {
  const [redacting, setRedacting] = useState(false);
  const [piiRegions, setPIIRegions] = useState<PIIRegion[]>([]);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  useEffect(() => {
    // Map PII findings to bounding boxes
    const regions = mapPIIToBoundingBoxes(piiFindings, ocrWords, extractedText);
    setPIIRegions(regions);
  }, [piiFindings, ocrWords, extractedText]);

  const handleRedact = async () => {
    setRedacting(true);

    try {
      // 1. Redact image on canvas
      const redactedBlob = await redactImageOnCanvas(imageBlob, piiRegions);
      setPreviewBlob(redactedBlob);

      // 2. Upload redacted image to Zendesk
      const uploadUrl = await uploadRedactedAttachment(ticketId, attachmentId, redactedBlob, fileName);

      // 3. Build result
      const result: RedactionResult = {
        attachmentId,
        fileName,
        originalSize: imageBlob.size,
        redactedSize: redactedBlob.size,
        regionsRedacted: piiRegions.length,
        redactedBlob,
        uploadUrl,
      };

      // 4. Clear PII from memory
      piiRegions.forEach((region) => {
        region.text = ''; // Clear text
      });

      onRedactionComplete(result);
    } catch (error) {
      console.error('Redaction failed:', error);
      // TODO: Show error to user
    } finally {
      setRedacting(false);
    }
  };

  return (
    <div className="attachment-redactor">
      <h3>Redact PII from {fileName}</h3>

      <div className="redaction-preview">
        <ImageCanvas imageBlob={imageBlob} piiRegions={piiRegions} />
      </div>

      <div className="redaction-summary">
        <p>
          Found <strong>{piiRegions.length} PII region(s)</strong> to redact:
        </p>
        <ul>
          {Object.entries(
            piiRegions.reduce((acc, region) => {
              acc[region.type] = (acc[region.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <li key={type}>
              {type}: {count}
            </li>
          ))}
        </ul>
      </div>

      <div className="redaction-actions">
        <button onClick={handleRedact} disabled={redacting || piiRegions.length === 0}>
          {redacting ? 'Redacting...' : 'Redact & Upload'}
        </button>
        <button onClick={onCancel} disabled={redacting}>
          Cancel
        </button>
      </div>

      {previewBlob && (
        <div className="redacted-preview">
          <h4>Redacted Preview:</h4>
          <img src={URL.createObjectURL(previewBlob)} alt="Redacted image preview" />
        </div>
      )}
    </div>
  );
}
```

---

### Step 15: Build ImageCanvas Component (1 day)

**Task:** Create canvas component for visualizing PII regions with black boxes

**Create:** `src/components/ImageCanvas.tsx`

```typescript
import { useEffect, useRef } from 'react';
import type { BoundingBox, PIIRegion } from '../types/redaction';

interface ImageCanvasProps {
  imageBlob: Blob;
  piiRegions: PIIRegion[];
  showBoxes?: boolean; // If true, show outlined boxes instead of filled
}

export default function ImageCanvas({ imageBlob, piiRegions, showBoxes = false }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw image
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw PII regions
      if (showBoxes) {
        // Outlined boxes (preview mode)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        piiRegions.forEach((region) => {
          const { x, y, width, height } = region.boundingBox;
          ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        });
      } else {
        // Filled black boxes (redaction mode)
        ctx.fillStyle = '#000000';
        piiRegions.forEach((region) => {
          const { x, y, width, height } = region.boundingBox;
          ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
        });
      }

      URL.revokeObjectURL(url);
    };

    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageBlob, piiRegions, showBoxes]);

  return (
    <canvas
      ref={canvasRef}
      className="image-canvas"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
```

---

### Step 16: Add Zendesk Upload Integration (1 day)

**Task:** Implement API calls to replace original attachment with redacted version

**Create:** `src/lib/zendesk-api.ts`

```typescript
import ZAFClient from 'zendesk_app_framework_sdk';

const client = ZAFClient.init();

/**
 * Uploads redacted attachment to Zendesk and replaces original
 */
export async function uploadRedactedAttachment(
  ticketId: string,
  originalAttachmentId: string,
  redactedBlob: Blob,
  fileName: string
): Promise<string> {
  // 1. Upload redacted image to Zendesk
  const formData = new FormData();
  formData.append('file', redactedBlob, `REDACTED_${fileName}`);

  const uploadResponse = await client.request({
    url: `/api/v2/uploads.json?filename=REDACTED_${fileName}`,
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
  });

  const uploadToken = uploadResponse.upload.token;

  // 2. Add comment with redacted attachment
  await client.request({
    url: `/api/v2/tickets/${ticketId}.json`,
    type: 'PUT',
    data: JSON.stringify({
      ticket: {
        comment: {
          body: `[AUTOMATED] Attachment "${fileName}" has been redacted to remove PII.`,
          uploads: [uploadToken],
        },
      },
    }),
    contentType: 'application/json',
  });

  // 3. Delete original attachment (optional - may require permissions)
  try {
    await client.request({
      url: `/api/v2/attachments/${originalAttachmentId}.json`,
      type: 'DELETE',
    });
  } catch (error) {
    console.warn('Failed to delete original attachment:', error);
    // Non-critical - redacted version is uploaded
  }

  return uploadResponse.upload.attachment.content_url;
}
```

---

### Step 17: Update AttachmentScanner for Redaction Workflow (1.5 days)

**Task:** Integrate redaction workflow into existing scanner component

**Update:** `src/components/AttachmentScanner.tsx`

```typescript
import { useState } from 'react';
import { useTesseract } from '../hooks/useTesseract';
import { detectPII } from '../utils/detection';
import AttachmentRedactor from './AttachmentRedactor';
import OCRProgress from './OCRProgress';
import OCRFindings from './OCRFindings';
import type { AttachmentScanResult, RedactionResult } from '../types/ocr';

export default function AttachmentScanner({ ticketId, attachments }: AttachmentScannerProps) {
  const { recognize, progress, terminate } = useTesseract();
  const [scanResult, setScanResult] = useState<AttachmentScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [redacting, setRedacting] = useState(false);
  const [currentImageBlob, setCurrentImageBlob] = useState<Blob | null>(null);
  const [ocrWords, setOCRWords] = useState<Array<{ text: string; bbox: BoundingBox }>>([]);

  const handleScan = async (attachment: typeof attachments[0]) => {
    setScanning(true);

    try {
      // 1. Fetch attachment
      const response = await fetch(attachment.content_url);
      const blob = await response.blob();
      setCurrentImageBlob(blob);

      const file = new File([blob], attachment.file_name);

      // 2. Run OCR (now extracts bounding boxes)
      const ocrResult = await recognize(file);
      setOCRWords(ocrResult.words);

      // 3. Detect PII
      const findings = detectPII(ocrResult.text);

      setScanResult({
        attachmentId: attachment.id,
        fileName: attachment.file_name,
        findings,
        ocrConfidence: ocrResult.confidence,
        extractedText: ocrResult.text,
      });
    } catch (error) {
      console.error('Scan failed:', error);
      // TODO: Show error
    } finally {
      setScanning(false);
    }
  };

  const handleRedactionComplete = (result: RedactionResult) => {
    // Clear memory
    setCurrentImageBlob(null);
    setOCRWords([]);
    setScanResult(null);
    setRedacting(false);

    // Log metadata (NO raw PII)
    console.log('Redaction complete:', {
      fileName: result.fileName,
      regionsRedacted: result.regionsRedacted,
      uploadUrl: result.uploadUrl,
    });
  };

  const handleCancelRedaction = () => {
    setRedacting(false);
  };

  return (
    <div className="attachment-scanner">
      {!redacting && !scanning && (
        <div className="attachment-list">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              <span>{attachment.file_name}</span>
              <button onClick={() => handleScan(attachment)}>Scan for PII</button>
            </div>
          ))}
        </div>
      )}

      {scanning && <OCRProgress progress={progress} />}

      {scanResult && !redacting && (
        <div className="scan-results">
          <OCRFindings findings={scanResult.findings} confidence={scanResult.ocrConfidence} />

          {scanResult.findings.length > 0 && (
            <button onClick={() => setRedacting(true)} className="redact-button">
              Redact Attachment
            </button>
          )}
        </div>
      )}

      {redacting && scanResult && currentImageBlob && (
        <AttachmentRedactor
          attachmentId={scanResult.attachmentId}
          fileName={scanResult.fileName}
          imageBlob={currentImageBlob}
          piiFindings={scanResult.findings}
          ocrWords={ocrWords}
          extractedText={scanResult.extractedText}
          ticketId={ticketId}
          onRedactionComplete={handleRedactionComplete}
          onCancel={handleCancelRedaction}
        />
      )}
    </div>
  );
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

**File:** `src/components/__tests__/AttachmentScanner.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import AttachmentScanner from '../AttachmentScanner';

describe('AttachmentScanner', () => {
  const mockAttachments = [
    {
      id: '123',
      file_name: 'test.png',
      content_type: 'image/png',
      content_url: 'https://example.com/test.png',
    },
  ];

  it('renders attachment list', () => {
    render(<AttachmentScanner ticketId="456" attachments={mockAttachments} />);
    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  it('shows scan button', () => {
    render(<AttachmentScanner ticketId="456" attachments={mockAttachments} />);
    expect(screen.getByText('Scan for PII')).toBeInTheDocument();
  });

  // Add more tests...
});
```

### 5.2 Integration Tests

**Test Scenarios:**

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| PNG with SSN | Image with "123-45-6789" | Detects 1 SSN |
| PDF with email | PDF with "test@example.com" | Detects 1 email |
| Multiple PII types | Image with SSN + CC + email | Detects all 3 |
| Empty image | Blank image | Shows "No PII detected" |
| Corrupted PDF | Invalid PDF | Shows error message |

### 5.3 E2E Tests

**Using Playwright MCP:**

1. Open Zendesk sandbox
2. Navigate to ticket with attachments
3. Click [Scan Attachment]
4. Verify progress indicator appears
5. Verify findings display correctly
6. Verify memory is cleared (check DevTools)
7. Verify no image data in network requests

### 5.4 Performance Tests

**Metrics to Track:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| OCR time (P50) | <8s | Tesseract timing |
| OCR time (P95) | <15s | Tesseract timing |
| Bundle size increase | <1 MB | Build output |
| Memory usage during scan | <50 MB | DevTools profiler |
| Sidebar responsiveness | No freezes | Manual test |

---

## 6. Deployment & Rollout

### 6.1 Build Configuration

**Update:** `packages/clients/zendesk/vite.config.ts`

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'tesseract': ['tesseract.js'],
        },
      },
    },
  },
});
```

**Why?** Tesseract.js is large (~5 MB). Chunk it separately for better caching.

### 6.2 Deployment Steps

1. **Build locally:**
   ```bash
   cd packages/clients/zendesk
   pnpm build
   ```

2. **Test in Zendesk sandbox:**
   - Upload to sandbox
   - Test with sample attachments
   - Verify all error cases

3. **Deploy to production:**
   - Merge to `main`
   - CI/CD builds and uploads to Zendesk
   - Monitor for errors in first 24 hours

### 6.3 Rollback Plan

**If critical bugs found:**

1. Immediately revert deployment
2. Hide [Scan Attachment] button (feature flag)
3. Communicate with beta customers
4. Fix and redeploy within 48 hours

---

## 7. Success Metrics

### 7.1 Performance Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| OCR accuracy | ≥75% | Test dataset of 100 images |
| P95 scan time | <15s | Production telemetry |
| P50 scan time | <8s | Production telemetry |
| Error rate | <5% | Failed scans / total scans |

### 7.2 Adoption Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Weekly scans per customer | ≥5 | Supabase logs |
| Customers using scanning | ≥60% | Workspace settings |
| Support tickets related to scanning | <3/month | Zendesk tickets |

### 7.3 Business Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Feature impact on MRR | +$500/mo | Revenue tracking |
| Customer satisfaction | ≥4/5 | In-app survey |
| Churn attributable to bugs | <1% | Churn analysis |

---

## 8. Risks & Mitigations

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| OCR accuracy too low | Medium | High | Use better preprocessing, add user feedback loop |
| Bundle size too large | Low | Medium | Code splitting, lazy loading |
| Browser incompatibility | Low | Medium | Test on Chrome/Firefox/Safari, show warning for unsupported |
| Memory leaks | Low | High | Explicit memory clearing, test with repeated scans |

### 8.2 Product Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Customers don't use it | Medium | High | Add prominent UI placement, in-app tutorial |
| Too many false positives | Medium | Medium | Tune detection patterns, add "ignore" option |
| Support burden increases | Medium | Medium | Clear error messages, help docs, FAQ |

### 8.3 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Image data leaked | Very Low | Very High | Client-side only, verify no uploads |
| Extracted PII logged | Low | High | Audit all logging, test with PII |
| XSS via SVG/PDF | Low | High | Sanitize all inputs, Content Security Policy |

---

## 9. Timeline Estimate

### 9.1 Detection Workflow (Steps 1-10)

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Setup** | Package install, type definitions | 1 day |
| **Core** | Tesseract hook, attachment fetcher | 3 days |
| **UI** | Scanner, progress, findings components | 6 days |
| **Integration** | Sidebar integration, error handling | 3 days |
| **Testing** | Unit, integration, E2E tests | 3 days |
| **Polish** | Styling, accessibility, docs | 2 days |
| **Buffer** | Unexpected issues | 2 days |
| **Detection Subtotal** | | **20 days (4 weeks)** |

### 9.2 Redaction Workflow (Steps 11-17)

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Types** | BoundingBox, PIIRegion, RedactionResult interfaces | 0.5 days |
| **OCR Extension** | Word-level bounding box extraction in useTesseract | 1 day |
| **Utilities** | image-redaction.ts (mapping, canvas, upload) | 1.5 days |
| **Component 1** | AttachmentRedactor (redaction workflow) | 2 days |
| **Component 2** | ImageCanvas (preview/redaction rendering) | 1 day |
| **API Integration** | Zendesk upload API for redacted images | 1 day |
| **Integration** | AttachmentScanner updates, state management | 1.5 days |
| **Testing** | Canvas manipulation, upload, memory cleanup tests | 2 days |
| **Buffer** | Canvas browser quirks, OCR edge cases | 1 day |
| **Redaction Subtotal** | | **11.5 days (2.3 weeks)** |

### 9.3 Combined Timeline

| Phase | Duration |
|-------|----------|
| **Detection Workflow (Steps 1-10)** | 20 days |
| **Redaction Workflow (Steps 11-17)** | 11.5 days |
| **Buffer** | 3 days (cross-phase integration) |
| **Total** | **34.5 days (7 weeks)** |

**Note:** This is for one developer working full-time.

**Note:** This is for one developer working full-time.

---

## 10. Next Steps

1. **Review this plan** with stakeholder
2. **Create test dataset** of 100 labeled images/PDFs
3. **Set up performance tracking** (telemetry)
4. **Begin implementation** with Step 1 (Package Setup)
5. **Weekly check-ins** to review progress

---

**End of Implementation Plan**

*Last Updated: January 2, 2026*
*Status: Draft - Awaiting Review*
