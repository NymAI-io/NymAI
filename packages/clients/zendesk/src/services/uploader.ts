/**
 * Redacted Attachment Uploader
 * Uploads redacted images back to Zendesk as new attachments.
 */

import { ZAFClient } from '@/types/zaf';

/**
 * Upload a redacted image as a new attachment.
 *
 * @param zaf - ZAF client context
 * @param imageBlob - Redacted image as Blob
 * @param fileName - Original file name (will be prefixed with "REDACTED_")
 * @returns Uploaded attachment data
 */
export async function uploadRedactedAttachment(
  zaf: ZAFClient,
  imageBlob: Blob,
  fileName: string
): Promise<{
  attachment_id: string;
  file_name: string;
  content_url: string;
  content_type: string;
  size: number;
}> {
  const redactedFileName = `REDACTED_${fileName}`;
  const file = new File([imageBlob], redactedFileName, {
    type: imageBlob.type || 'image/png',
  });

  const response = (await zaf.request({
    url: '/uploads.json',
    type: 'POST',
    contentType: 'multipart/form-data',
    data: {
      file,
      inline: false,
    },
  })) as {
    upload?: {
      attachment?: {
        attachment_id: string;
        file_name: string;
        content_url: string;
        content_type: string;
        size: number;
      };
    };
  };

  if (!response || !response.upload) {
    throw new Error('Failed to upload redacted attachment');
  }

  const upload = response.upload;
  if (!upload.attachment) {
    throw new Error('Invalid upload response from Zendesk');
  }

  return upload.attachment;
}

/**
 * Replace an attachment comment in a ticket.
 *
 * @param zaf - ZAF client context
 * @param commentId - The comment ID to replace
 * @param newAttachmentId - The new redacted attachment ID
 * @returns Updated comment data
 */
export async function replaceAttachmentComment(
  zaf: ZAFClient,
  commentId: string,
  newAttachmentId: string
): Promise<{ id: string; body: string }> {
  const ctx = await zaf.context();
  const response = (await zaf.request({
    url: `/tickets/${ctx.ticketId}/comments/${commentId}`,
    type: 'PUT',
    data: {
      comment: {
        body: `<img src="${newAttachmentId}" alt="Redacted attachment" />`,
        uploads: [newAttachmentId],
      },
    },
  })) as { comment?: { id: string; body: string } };

  if (!response || !response.comment) {
    throw new Error('Failed to replace attachment comment');
  }

  return response.comment;
}

/**
 * Delete an attachment comment (for undo functionality).
 *
 * @param zaf - ZAF client context
 * @param commentId - The comment ID to delete
 * @returns Success status
 */
export async function deleteAttachmentComment(zaf: ZAFClient, commentId: string): Promise<boolean> {
  try {
    const ctx = await zaf.context();
    await zaf.request({
      url: `/tickets/${ctx.ticketId}/comments/${commentId}`,
      type: 'PUT',
      data: {
        comment: {
          body: '[Attachment redacted - undone]',
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Apply redaction to an image blob.
 *
 * @param imageBlob - Original image as Blob
 * @param boundingBoxes - Bounding boxes to redact (normalized 0-1)
 * @returns Redacted image as Blob
 */
export async function applyRedactionToImage(
  imageBlob: Blob,
  boundingBoxes: { x0: number; y0: number; x1: number; y1: number }[]
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw black boxes over PII regions
      ctx.fillStyle = '#000000';

      for (const box of boundingBoxes) {
        const x = box.x0 * canvas.width;
        const y = box.y0 * canvas.height;
        const width = (box.x1 - box.x0) * canvas.width;
        const height = (box.y1 - box.y0) * canvas.height;

        ctx.fillRect(x, y, width, height);
      }

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create redacted image blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for redaction'));
    };

    // Load image from blob
    const reader = new FileReader();
    reader.onloadend = () => {
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image blob'));
    };
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Merge overlapping bounding boxes before redaction.
 * This prevents gaps in multi-word PII redaction.
 *
 * @param boxes - Bounding boxes to merge
 * @returns Merged bounding boxes
 */
export function mergeBoundingBoxes(
  boxes: { x0: number; y0: number; x1: number; y1: number }[]
): { x0: number; y0: number; x1: number; y1: number }[] {
  if (boxes.length === 0) return [];

  const sorted = [...boxes].sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);

  const merged: typeof boxes = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // Check if boxes overlap (same line, horizontally adjacent)
    const sameLine = Math.abs(current.y0 - next.y0) < 0.05;
    const adjacent = next.x0 <= current.x1 + 0.1; // 10% tolerance

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
