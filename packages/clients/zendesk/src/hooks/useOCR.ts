/**
 * useOCR Hook
 * Manages OCR scanning workflow for attachments.
 */

import { useState, useCallback, useRef } from 'react';
import { ZAFClient } from '@/types/zaf';
import { ZAFAttachmentWithMetadata } from '@/types/attachment';
import { OCRResult, OCRProgress } from '@/types/ocr';
import { downloadAttachmentAsBlob, downloadAttachmentAsDataURL } from '@/services/downloader';
import { scanImageForPII, groupFindingsByType, countTotalFindings } from '@/services/ocr.service';
import { loadPDFDocument, renderAllPDFPages, initPDFWorker } from '@/services/pdfjs.service';

export interface UseOCRProps {
  zaf: ZAFClient;
  attachments: ZAFAttachmentWithMetadata[];
}

export interface UseOCRReturn {
  /** OCR results for scanned attachments */
  results: OCRResult[];
  /** Current OCR progress state */
  progress: OCRProgress | null;
  /** Whether OCR is currently in progress */
  isScanning: boolean;
  /** Initiate OCR scan on all scannable attachments */
  scanAttachments: () => Promise<void>;
  /** Clear all OCR results */
  clearResults: () => void;
  /** Get aggregated statistics */
  getStats: () => { total: number; byType: Map<string, number> };
}

/**
 * Initialize PDF.js worker (call once on mount)
 */
let pdfWorkerInitialized = false;

/**
 * useOCR Hook
 */
export function useOCR({ zaf, attachments }: UseOCRProps): UseOCRReturn {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Scan a single image attachment.
   */
  const scanImageAttachment = useCallback(
    async (attachment: ZAFAttachmentWithMetadata, _signal: AbortSignal): Promise<OCRResult> => {
      return downloadAttachmentAsDataURL(zaf, attachment.contentUrl).then((dataUrl) =>
        scanImageForPII(dataUrl, attachment.id, attachment.fileName)
      );
    },
    [zaf]
  );

  /**
   * Scan a single PDF attachment (all pages).
   */
  const scanPDFAttachment = useCallback(
    async (attachment: ZAFAttachmentWithMetadata, signal: AbortSignal): Promise<OCRResult[]> => {
      return downloadAttachmentAsBlob(zaf, attachment.contentUrl)
        .then((blob) => blob.arrayBuffer())
        .then(async (arrayBuffer) => {
          if (!pdfWorkerInitialized) {
            initPDFWorker();
            pdfWorkerInitialized = true;
          }

          const pdf = await loadPDFDocument(arrayBuffer);
          const canvases = await renderAllPDFPages(pdf);

          // Scan each page
          const pageResults: OCRResult[] = [];
          for (let i = 0; i < canvases.length; i++) {
            if (signal.aborted) throw new Error('Aborted');

            const canvas = canvases[i];
            const pageFileName = `${attachment.fileName} (page ${i + 1})`;
            // Convert canvas to data URL for scanImageForPII
            const dataUrl = canvas.toDataURL('image/png');
            const result = await scanImageForPII(
              dataUrl,
              `${attachment.id}-page-${i}`,
              pageFileName
            );
            pageResults.push(result);
          }

          return pageResults;
        });
    },
    [zaf]
  );

  /**
   * Scan all scannable attachments.
   */
  const scanAttachments = useCallback(async () => {
    const scannable = attachments.filter((a) => a.isScannable);
    if (scannable.length === 0) {
      setResults([]);
      return;
    }

    setIsScanning(true);
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // Set initial progress
      setProgress({
        stage: 'downloading',
        current: 0,
        total: scannable.length,
        fileName: scannable[0].fileName,
      });

      const allResults: OCRResult[] = [];

      for (let i = 0; i < scannable.length; i++) {
        if (signal.aborted) break;

        const attachment = scannable[i];

        // Update progress
        setProgress({
          stage: 'processing',
          current: i + 1,
          total: scannable.length,
          fileName: attachment.fileName,
        });

        try {
          let scanResults: OCRResult[];

          if (attachment.attachmentType === 'pdf') {
            // Scan PDF (multi-page)
            scanResults = await scanPDFAttachment(attachment, signal);
          } else {
            // Scan image (single)
            const result = await scanImageAttachment(attachment, signal);
            scanResults = [result];
          }

          allResults.push(...scanResults);
        } catch (error) {
          // Add error result for failed attachment
          if (error instanceof Error && error.message === 'Aborted') {
            throw error;
          }

          allResults.push({
            attachmentId: attachment.id,
            fileName: attachment.fileName,
            findings: [],
            processingTimeMs: 0,
            error: error instanceof Error ? error.message : 'Scan failed',
          });
        }
      }

      // Update progress to detecting
      setProgress({
        stage: 'detecting',
        current: allResults.length,
        total: allResults.length,
        fileName: '',
      });

      setResults(allResults);
    } catch (error) {
      if (error instanceof Error && error.message !== 'Aborted') {
        console.error('OCR scan error:', error);
      }
    } finally {
      setIsScanning(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  }, [attachments, scanImageAttachment, scanPDFAttachment]);

  /**
   * Clear all results.
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setProgress(null);
  }, []);

  /**
   * Get aggregated statistics.
   */
  const getStats = useCallback(() => {
    const total = countTotalFindings(results);
    const grouped = groupFindingsByType(results.flatMap((r) => r.findings));

    return {
      total,
      byType: new Map(
        Array.from(grouped.entries()).map(([type, findings]) => [type.toString(), findings.length])
      ),
    };
  }, [results]);

  return {
    results,
    progress,
    isScanning,
    scanAttachments,
    clearResults,
    getStats,
  };
}
