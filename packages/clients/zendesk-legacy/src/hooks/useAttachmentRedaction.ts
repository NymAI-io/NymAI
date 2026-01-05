/**
 * useAttachmentRedaction Hook
 * Manages redaction workflow for attachments with undo support.
 */

import { useState, useCallback, useRef } from 'react';
import { ZAFClient } from '@/types/zaf';
import { OCRResult, AttachmentRedactionState, UndoState } from '@/types/ocr';
import {
  uploadRedactedAttachment,
  applyRedactionToImage,
  mergeBoundingBoxes,
} from '@/services/uploader';
import { downloadAttachmentAsBlob, createBlobURL, revokeBlobURL } from '@/services/downloader';

const MAX_UNDO_WINDOW_MS = 10000; // 10 seconds

export interface UseAttachmentRedactionProps {
  zaf: ZAFClient;
}

export interface UseAttachmentRedactionReturn {
  /** Map of attachment ID to redaction state */
  redactionStates: Map<string, AttachmentRedactionState>;
  /** Current undo state (if any) */
  undoState: UndoState | null;
  /** Whether redaction is in progress */
  isRedacting: boolean;
  /** Initiate redaction for an attachment */
  redactAttachment: (
    attachmentId: string,
    result: OCRResult,
    originalImageUrl: string
  ) => Promise<void>;
  /** Undo the last redaction */
  undo: () => Promise<void>;
  /** Clear undo state (after window expires) */
  clearUndo: () => void;
}

/**
 * useAttachmentRedaction Hook
 */
export function useAttachmentRedaction({
  zaf,
}: UseAttachmentRedactionProps): UseAttachmentRedactionReturn {
  const [redactionStates, setRedactionStates] = useState<Map<string, AttachmentRedactionState>>(
    new Map()
  );
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [isRedacting, setIsRedacting] = useState(false);

  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Clear undo timeout and state.
   */
  const clearUndo = useCallback(() => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    if (undoState?.originalBlobUrl) {
      revokeBlobURL(undoState.originalBlobUrl);
    }

    setUndoState(null);
  }, [undoState]);

  /**
   * Set undo state with timeout.
   */
  const setUndoWithTimeout = useCallback(
    (state: UndoState): void => {
      clearUndo();

      setUndoState(state);

      // Set timeout to clear undo after 10 seconds
      undoTimeoutRef.current = setTimeout(() => {
        clearUndo();
      }, MAX_UNDO_WINDOW_MS);
    },
    [clearUndo]
  );

  /**
   * Initiate redaction for an attachment.
   */
  const redactAttachment = useCallback(
    async (attachmentId: string, result: OCRResult, originalImageUrl: string): Promise<void> => {
      if (result.findings.length === 0) {
        return;
      }

      setIsRedacting(true);

      try {
        // Set loading state
        setRedactionStates((prev) => {
          const next = new Map(prev);
          next.set(attachmentId, {
            status: 'loading',
            redactedImageUrl: null,
            redactedAttachmentId: null,
            commentId: null,
          });
          return next;
        });

        // Download original image as blob
        const originalBlob = await downloadAttachmentAsBlob(zaf, originalImageUrl);

        // Store original blob URL for undo
        const originalBlobUrl = createBlobURL(originalBlob);

        // Get bounding boxes for redaction (merge overlapping)
        const boundingBoxes = mergeBoundingBoxes(result.findings.map((f) => f.boundingBox));

        // Apply redaction
        const redactedBlob = await applyRedactionToImage(originalBlob, boundingBoxes);

        // Create redacted image URL for preview
        const redactedBlobUrl = createBlobURL(redactedBlob);

        // Upload redacted attachment to Zendesk
        const uploaded = await uploadRedactedAttachment(zaf, redactedBlob, result.fileName);

        // Update redaction state
        setRedactionStates((prev) => {
          const next = new Map(prev);
          next.set(attachmentId, {
            status: 'redacted',
            redactedImageUrl: redactedBlobUrl,
            redactedAttachmentId: uploaded.attachment_id,
            commentId: null, // Will be set when comment is replaced
          });
          return next;
        });

        // Set undo state
        setUndoWithTimeout({
          attachmentId,
          originalBlobUrl,
          redactedBlobUrl,
          redactedAttachmentId: uploaded.attachment_id,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Redaction error:', error);

        // Set error state
        setRedactionStates((prev) => {
          const next = new Map(prev);
          next.set(attachmentId, {
            status: 'error',
            redactedImageUrl: null,
            redactedAttachmentId: null,
            commentId: null,
            error: error instanceof Error ? error.message : 'Redaction failed',
          });
          return next;
        });
      } finally {
        setIsRedacting(false);
      }
    },
    [zaf, setUndoWithTimeout]
  );

  /**
   * Undo the last redaction.
   */
  const undo = useCallback(async (): Promise<void> => {
    if (!undoState) return;

    setIsRedacting(true);

    try {
      const { attachmentId } = undoState;

      // Restore original (in real implementation, would revert comment)
      // For now, just clear the redaction state
      // Note: originalBlobUrl stored for future undo implementation
      setRedactionStates((prev) => {
        const next = new Map(prev);
        next.delete(attachmentId);
        return next;
      });

      clearUndo();
    } catch (error) {
      console.error('Undo error:', error);
    } finally {
      setIsRedacting(false);
    }
  }, [undoState, clearUndo]);

  return {
    redactionStates,
    undoState,
    isRedacting,
    redactAttachment,
    undo,
    clearUndo,
  };
}
