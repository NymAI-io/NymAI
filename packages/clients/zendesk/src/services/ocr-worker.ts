/**
 * OCR Worker
 * Web Worker for offloading Tesseract OCR processing to keep UI responsive.
 *
 * This worker runs in a separate thread and processes images for OCR.
 */

import { expose } from 'comlink';
import Tesseract from 'tesseract.js';

/**
 * OCR Worker API
 */
export interface OCRWorkerAPI {
  recognize(imageData: string | Blob | ImageData): Promise<OCRWorkerResult>;
  terminate(): void;
}

/**
 * OCR result from worker
 */
export interface OCRWorkerResult {
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
 * Initialize Tesseract worker.
 */
let tesseractWorker: Tesseract.Worker | null = null;

async function getWorker(): Promise<Tesseract.Worker> {
  if (!tesseractWorker) {
    tesseractWorker = await Tesseract.createWorker('eng', 1, {
      logger: () => {
        // Suppress logging in worker
      },
    });

    await tesseractWorker.setParameters({
      tessedit_preserve_interword_spaces: '1',
      tessedit_pageseg_mode: '3' as Tesseract.PSM,
    });
  }
  return tesseractWorker;
}

/**
 * Recognize text in an image.
 */
async function recognize(imageData: string | Blob | ImageData): Promise<OCRWorkerResult> {
  const worker = await getWorker();

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
    })) || [];

  return {
    text: data.text,
    confidence: data.confidence / 100,
    words,
  };
}

/**
 * Terminate the Tesseract worker and free resources.
 */
function terminate(): void {
  if (tesseractWorker) {
    tesseractWorker.terminate();
    tesseractWorker = null;
  }
}

/**
 * Expose worker methods via Comlink for clean async communication.
 */
expose({
  recognize,
  terminate,
});
