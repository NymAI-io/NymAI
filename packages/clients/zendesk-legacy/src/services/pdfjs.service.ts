/**
 * PDF.js Service
 * Renders PDF pages to canvas for OCR processing.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { BoundingBox } from '@/types/ocr';

/**
 * Initialize PDF.js worker.
 * MUST be called once at app startup.
 */
export function initPDFWorker(): void {
  // Set worker source for PDF.js
  // Use CDN for the worker (will be bundled in production)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Load a PDF document from array buffer or URL.
 */
export async function loadPDFDocument(
  data: ArrayBuffer | string
): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument(data);
  return await loadingTask.promise;
}

/**
 * Render a PDF page to HTML canvas.
 *
 * @param pdf - The loaded PDF document
 * @param pageNumber - Page number to render (1-indexed)
 * @param scale - Rendering scale (default 2.0 for better OCR accuracy)
 * @returns HTML canvas element with rendered page
 */
export async function renderPDFPageToCanvas(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2.0
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);

  // Create viewport with specified scale
  const viewport = page.getViewport({ scale });

  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get 2D context from canvas');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  return canvas;
}

/**
 * Get page count of a PDF document.
 */
export async function getPDFPageCount(pdf: pdfjsLib.PDFDocumentProxy): Promise<number> {
  return pdf.numPages;
}

/**
 * Render all pages of a PDF to canvases for batch OCR processing.
 *
 * @param pdf - The loaded PDF document
 * @param scale - Rendering scale (default 2.0)
 * @returns Array of canvases, one per page
 */
export async function renderAllPDFPages(
  pdf: pdfjsLib.PDFDocumentProxy,
  scale: number = 2.0
): Promise<HTMLCanvasElement[]> {
  const pageCount = await getPDFPageCount(pdf);
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const canvas = await renderPDFPageToCanvas(pdf, i, scale);
    canvases.push(canvas);
  }

  return canvases;
}

/**
 * Adjust bounding boxes for PDF pages.
 * PDF coordinates may need adjustment based on rendering scale.
 *
 * @param boxes - Original bounding boxes
 * @param scale - The scale used for rendering
 * @returns Adjusted bounding boxes
 */
export function adjustPDFBoundingBoxes(
  boxes: BoundingBox[],
  scale: number
): BoundingBox[] {
  // PDF.js bounding boxes are already in canvas coordinates
  // Just normalize to 0-1 range
  return boxes.map((box) => ({
    x0: box.x0 / scale,
    y0: box.y0 / scale,
    x1: box.x1 / scale,
    y1: box.y1 / scale,
  }));
}
