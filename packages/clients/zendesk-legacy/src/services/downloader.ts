/**
 * ZAF Attachment Downloader
 * Downloads attachments from Zendesk for OCR processing.
 */

import { ZAFClient } from '@/types/zaf';
import { ZAFAttachmentWithMetadata, AttachmentType } from '@/types/attachment';

/**
 * Download an attachment from ZAF as Blob.
 *
 * @param zaf - ZAF client context
 * @param contentUrl - The content URL of the attachment
 * @returns Blob containing the attachment data
 */
export async function downloadAttachmentAsBlob(zaf: ZAFClient, contentUrl: string): Promise<Blob> {
  // Use ZAF request to download attachment
  const response = await zaf.request({
    url: contentUrl,
    responseType: 'blob',
  });

  if (!response || !response.blob) {
    throw new Error(`Failed to download attachment from ${contentUrl}`);
  }

  return response.blob;
}

/**
 * Download an attachment from ZAF as data URL.
 *
 * @param zaf - ZAF client context
 * @param contentUrl - The content URL of the attachment
 * @returns Data URL (base64) of the attachment
 */
export async function downloadAttachmentAsDataURL(
  zaf: ZAFClient,
  contentUrl: string
): Promise<string> {
  const blob = await downloadAttachmentAsBlob(zaf, contentUrl);
  return blobToDataURL(blob);
}

/**
 * Convert a Blob to data URL.
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Create a Blob URL for a Blob (ephemeral, for undo storage).
 *
 * @param blob - The blob to create URL for
 * @returns Blob URL
 */
export function createBlobURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke a Blob URL to free memory.
 *
 * @param url - The Blob URL to revoke
 */
export function revokeBlobURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Download image attachment and create Image object.
 *
 * @param zaf - ZAF client context
 * @param contentUrl - The content URL of the attachment
 * @returns HTMLImageElement with loaded image
 */
export async function downloadAttachmentAsImage(
  zaf: ZAFClient,
  contentUrl: string
): Promise<HTMLImageElement> {
  const dataUrl = await downloadAttachmentAsDataURL(zaf, contentUrl);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Download PDF attachment as ArrayBuffer.
 *
 * @param zaf - ZAF client context
 * @param contentUrl - The content URL of the attachment
 * @returns ArrayBuffer containing PDF data
 */
export async function downloadAttachmentAsArrayBuffer(
  zaf: ZAFClient,
  contentUrl: string
): Promise<ArrayBuffer> {
  const blob = await downloadAttachmentAsBlob(zaf, contentUrl);
  return blob.arrayBuffer();
}

/**
 * Get attachment type from file name and content type.
 *
 * @param fileName - File name
 * @param contentType - MIME content type
 * @returns Attachment type
 */
export function getAttachmentType(fileName: string, contentType: string): AttachmentType {
  const lowerFileName = fileName.toLowerCase();

  // Check for PDF
  if (lowerFileName.endsWith('.pdf') || contentType === 'application/pdf') {
    return AttachmentType.PDF;
  }

  // Check for supported image types
  if (
    lowerFileName.endsWith('.png') ||
    lowerFileName.endsWith('.jpg') ||
    lowerFileName.endsWith('.jpeg') ||
    lowerFileName.endsWith('.webp') ||
    contentType.startsWith('image/')
  ) {
    return AttachmentType.IMAGE;
  }

  return AttachmentType.UNSUPPORTED;
}

/**
 * Enrich ZAF attachment with OCR metadata.
 *
 * @param attachment - Raw ZAF attachment
 * @returns Enriched attachment with OCR metadata
 */
export function enrichAttachment(attachment: {
  id: string;
  file_name: string;
  content_url: string;
  content_type: string;
  size: number;
}): ZAFAttachmentWithMetadata {
  const attachmentType = getAttachmentType(attachment.file_name, attachment.content_type);

  return {
    id: attachment.id,
    fileName: attachment.file_name,
    contentType: attachment.content_type,
    contentUrl: attachment.content_url,
    size: attachment.size,
    attachmentType,
    isScannable: attachmentType === AttachmentType.IMAGE || attachmentType === AttachmentType.PDF,
  };
}
