/**
 * OCR Service
 * Main service for OCR processing and PII detection in attachments.
 * Integrates Tesseract.js for OCR and @nymai/core for PII detection.
 */

import Tesseract from 'tesseract.js';
import { detect } from '@nymai/core';
import { OCRResult, OCRFinding, BoundingBox, AttachmentType, PIIType } from '@/types/ocr';

/**
 * Supported image MIME types for OCR.
 */
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * Supported PDF MIME type.
 */
const SUPPORTED_PDF_TYPE = 'application/pdf';

/**
 * Check if a file type is supported for OCR.
 */
export function isSupportedFileType(contentType: string, fileName: string): boolean {
  const lowerFileName = fileName.toLowerCase();

  return (
    SUPPORTED_IMAGE_TYPES.includes(contentType) ||
    lowerFileName.endsWith('.png') ||
    lowerFileName.endsWith('.jpg') ||
    lowerFileName.endsWith('.jpeg') ||
    lowerFileName.endsWith('.webp') ||
    contentType === SUPPORTED_PDF_TYPE ||
    lowerFileName.endsWith('.pdf')
  );
}

/**
 * Get attachment type from content type and file name.
 */
export function getAttachmentType(contentType: string, fileName: string): AttachmentType {
  const lowerFileName = fileName.toLowerCase();

  if (contentType === SUPPORTED_PDF_TYPE || lowerFileName.endsWith('.pdf')) {
    return AttachmentType.PDF;
  }

  if (
    SUPPORTED_IMAGE_TYPES.includes(contentType) ||
    lowerFileName.endsWith('.png') ||
    lowerFileName.endsWith('.jpg') ||
    lowerFileName.endsWith('.jpeg') ||
    lowerFileName.endsWith('.webp')
  ) {
    return AttachmentType.IMAGE;
  }

  return AttachmentType.UNSUPPORTED;
}

/**
 * Normalize Tesseract bounding box to 0-1 range.
 */
function normalizeBoundingBox(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  imageWidth: number,
  imageHeight: number
): BoundingBox {
  return {
    x0: Math.max(0, Math.min(1, bbox.x0 / imageWidth)),
    y0: Math.max(0, Math.min(1, bbox.y0 / imageHeight)),
    x1: Math.max(0, Math.min(1, bbox.x1 / imageWidth)),
    y1: Math.max(0, Math.min(1, bbox.y1 / imageHeight)),
  };
}

/**
 * Create Tesseract worker with proper configuration.
 */
async function createWorker(): Promise<Tesseract.Worker> {
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: () => {},
  });

  await worker.setParameters({
    tessedit_preserve_interword_spaces: '1',
    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
  });

  return worker;
}

/**
 * Perform OCR on an image blob and detect PII.
 *
 * @param imageData - Image data (data URL, Blob, or ImageData)
 * @param attachmentId - Attachment ID for tracking
 * @param fileName - Original file name
 * @returns OCR result with PII findings
 */
export async function scanImageForPII(
  imageData: string | Blob | ImageData,
  attachmentId: string,
  fileName: string
): Promise<OCRResult> {
  const startTime = Date.now();
  let worker: Tesseract.Worker | null = null;

  try {
    worker = await createWorker();

    // Perform OCR with bounding box detection
    const result = await worker.recognize(imageData);

    const { data } = result;
    // Tesseract.js returns words in data.words but types may not include it
    const words =
      (
        data as unknown as {
          words?: Array<{
            text: string;
            confidence: number;
            bbox: { x0: number; y0: number; x1: number; y1: number };
          }>;
        }
      ).words || [];

    // Create image element to get dimensions
    const img = await createImageElement(imageData);
    const imageWidth = img.width;
    const imageHeight = img.height;

    // Detect PII in each word using core engine
    const findings: OCRFinding[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const text = word.text.trim();

      if (!text) continue;

      const detections = detect(text);

      if (detections.length > 0) {
        // Use the detection with highest confidence
        const detection = detections[0];

        findings.push({
          id: `finding-${attachmentId}-${i}`,
          text: truncateText(text, 20),
          type: detection.type as PIIType,
          confidence: word.confidence / 100,
          boundingBox: normalizeBoundingBox(word.bbox, imageWidth, imageHeight),
        });
      }
    }

    // Clean up: explicitly clear text data from memory
    words.forEach((w: { text: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (w as any).text = '';
    });

    return {
      attachmentId,
      fileName,
      findings,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      attachmentId,
      fileName,
      findings: [],
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * Create an HTMLImageElement from image data.
 */
async function createImageElement(imageData: string | Blob | ImageData): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));

    if (typeof imageData === 'string') {
      img.src = imageData;
    } else if (imageData instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageData);
    } else {
      // ImageData
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.putImageData(imageData, 0, 0);
        img.src = canvas.toDataURL();
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    }
  });
}

/**
 * Truncate text for logging (PII safety).
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength);
}

/**
 * Group OCR findings by PII type.
 */
export function groupFindingsByType(findings: OCRFinding[]): Map<PIIType, OCRFinding[]> {
  const grouped = new Map<PIIType, OCRFinding[]>();

  for (const finding of findings) {
    const existing = grouped.get(finding.type) || [];
    existing.push(finding);
    grouped.set(finding.type, existing);
  }

  return grouped;
}

/**
 * Count total findings across all types.
 */
export function countTotalFindings(results: OCRResult[]): number {
  return results.reduce((sum, result) => sum + result.findings.length, 0);
}

/**
 * Merge overlapping bounding boxes.
 * Useful for redacting multi-word PII like full names.
 */
export function mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox[] {
  if (boxes.length === 0) return [];

  const merged: BoundingBox[] = [];
  const sorted = [...boxes].sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);

  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // Check if boxes overlap (same line, horizontally adjacent)
    const sameLine = Math.abs(current.y0 - next.y0) < 0.1;
    const adjacent = next.x0 <= current.x1 + 0.05; // 5% tolerance

    if (sameLine && adjacent) {
      // Merge boxes
      current = {
        x0: Math.min(current.x0, next.x0),
        y0: Math.min(current.y0, next.y0),
        x1: Math.max(current.x1, next.x1),
        y1: Math.max(current.y1, next.y1),
      };
    } else {
      merged.push(current);
      current = next;
    }
  }

  merged.push(current);
  return merged;
}
