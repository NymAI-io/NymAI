import { AttachmentType } from './ocr';

export { AttachmentType } from './ocr';

/**
 * Extended attachment interface from ZAF with OCR metadata.
 */
export interface ZAFAttachmentWithMetadata {
  id: string;
  fileName: string;
  contentType: string;
  contentUrl: string;
  size: number;
  attachmentType: AttachmentType;
  isScannable: boolean;
}
