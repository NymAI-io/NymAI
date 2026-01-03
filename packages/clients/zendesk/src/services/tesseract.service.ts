/**
 * Tesseract.js OCR Service
 * Wraps Tesseract.js for client-side OCR with bounding box detection.
 */

import Tesseract from 'tesseract.js';
import { BoundingBox, OCRFinding } from '@/types/ocr';

export interface TesseractResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

/**
 * Initialize Tesseract worker with proper configuration.
 * Returns a worker instance that must be terminated after use.
 */
export async function createTesseractWorker(): Promise<Tesseract.Worker> {
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      // Suppress verbose logging; use progress callbacks instead
      if (m.status === 'recognizing text') {
        // Can be used for progress reporting
      }
    },
  });

  await worker.setParameters({
    tessedit_preserve_interword_spaces: '1',
    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
  });

  return worker;
}

/**
 * Convert Tesseract bbox to normalized bounding box (0-1 range).
 */
function normalizeBoundingBox(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  imageWidth: number,
  imageHeight: number
): BoundingBox {
  return {
    x0: bbox.x0 / imageWidth,
    y0: bbox.y0 / imageHeight,
    x1: bbox.x1 / imageWidth,
    y1: bbox.y1 / imageHeight,
  };
}

/**
 * Perform OCR on an image and return word-level results with bounding boxes.
 *
 * @param worker - Tesseract worker instance
 * @param imageData - Image data (URL, Blob, or ImageData)
 * @returns OCR result with text and word bounding boxes
 */
export async function recognizeImage(
  worker: Tesseract.Worker,
  imageData: string | Blob | ImageData
): Promise<TesseractResult> {
  const result = await worker.recognize(imageData, undefined, {
    blocks: true,
  });

  const { data } = result;

  const words =
    (
      data as {
        words?: Array<{
          text: string;
          confidence: number;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      }
    ).words?.map((word) => ({
      text: word.text,
      confidence: word.confidence / 100,
      bbox: word.bbox,
    })) ?? [];

  return {
    text: data.text,
    confidence: data.confidence / 100,
    words,
  };
}

/**
 * Create OCR findings from Tesseract word results.
 * This is a placeholder - actual PII detection happens in the core engine.
 *
 * @param words - Tesseract word results
 * @param imageWidth - Image width for normalization
 * @param imageHeight - Image height for normalization
 * @returns Array of OCR findings (raw, without PII type classification)
 */
export function createRawFindings(
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>,
  imageWidth: number,
  imageHeight: number
): Array<Omit<OCRFinding, 'type'>> {
  return words.map((word, index) => ({
    id: `word-${index}`,
    text: word.text,
    confidence: word.confidence,
    boundingBox: normalizeBoundingBox(word.bbox, imageWidth, imageHeight),
  }));
}

/**
 * Terminate Tesseract worker and free resources.
 */
export async function terminateWorker(worker: Tesseract.Worker): Promise<void> {
  await worker.terminate();
}
