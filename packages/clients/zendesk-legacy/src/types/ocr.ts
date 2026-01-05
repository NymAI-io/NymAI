/**
 * PII types supported for detection.
 * Local enum that maps to @nymai/core DataType values.
 */
export enum PIIType {
  SSN = 'SSN',
  CREDIT_CARD = 'CC',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  DRIVERS_LICENSE = 'DL',
  PASSPORT = 'PASSPORT',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  ROUTING_NUMBER = 'ROUTING_NUMBER',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
}

/**
 * Bounding box coordinates for redaction regions.
 * All values are normalized 0-1 (relative to image dimensions).
 */
export interface BoundingBox {
  x0: number; // Left edge (0-1)
  y0: number; // Top edge (0-1)
  x1: number; // Right edge (0-1)
  y1: number; // Bottom edge (0-1)
}

/**
 * A single PII finding from OCR processing.
 * Contains the detected text, PII type, and location for redaction.
 */
export interface OCRFinding {
  id: string;
  text: string; // Detected text (max 20 chars for logging)
  type: PIIType;
  confidence: number; // 0-1
  boundingBox: BoundingBox;
}

/**
 * OCR processing result for a single attachment.
 */
export interface OCRResult {
  attachmentId: string;
  fileName: string;
  findings: OCRFinding[];
  processingTimeMs: number;
  error?: string;
}

/**
 * Progress stages for OCR processing.
 */
export type OCRStage =
  | 'idle'
  | 'downloading' // Downloading attachment from ZAF
  | 'processing' // Running OCR worker
  | 'detecting'; // Matching PII patterns

/**
 * Progress state for attachment scanning.
 */
export interface OCRProgress {
  stage: OCRStage;
  current: number; // Current attachment index
  total: number; // Total attachments
  fileName?: string;
}

/**
 * Supported attachment types for OCR.
 */
export enum AttachmentType {
  IMAGE = 'image',
  PDF = 'pdf',
  UNSUPPORTED = 'unsupported',
}

/**
 * File extensions supported for OCR.
 */
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
export const SUPPORTED_PDF_EXTENSIONS = ['.pdf'];

/**
 * Complete scan result for multiple attachments.
 */
export interface AttachmentScanResult {
  results: OCRResult[];
  totalFindings: number;
  processingTimeMs: number;
}

/**
 * Redaction state for a single attachment.
 */
export interface AttachmentRedactionState {
  status: 'loading' | 'redacted' | 'error';
  redactedImageUrl: string | null;
  redactedAttachmentId: string | null;
  commentId: string | null;
  error?: string;
}

/**
 * Undo state with expiration.
 */
export interface UndoState {
  attachmentId: string;
  originalBlobUrl: string;
  redactedBlobUrl: string;
  redactedAttachmentId: string;
  timestamp: number;
}
