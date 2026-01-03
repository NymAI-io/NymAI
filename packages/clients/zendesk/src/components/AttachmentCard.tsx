/**
 * AttachmentCard Component
 * Displays a single attachment with OCR findings and redaction controls.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Eye, Shield } from 'lucide-react';
import { OCRResult } from '@/types/ocr';
import { OCRFindings } from './OCRFindings';

export interface AttachmentCardProps {
  /** OCR result for this attachment */
  result: OCRResult;
  /** Whether card is expanded */
  isExpanded: boolean;
  /** Toggle expansion */
  onToggle: () => void;
  /** Redaction callback */
  onRedact: (attachmentId: string) => void;
  /** Undo callback (TODO: Implement undo functionality) */
  onUndo: (attachmentId: string) => void;
  /** Preview callback */
  onPreview: (attachmentId: string) => void;
}

/**
 * AttachmentCard Component
 */
export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  result,
  isExpanded,
  onToggle,
  onRedact,
  onUndo: _onUndo, // TODO: Implement undo button
  onPreview,
}) => {
  const hasFindings = result.findings.length > 0;
  const hasError = !!result.error;

  return (
    <Card className={`${hasError ? 'border-destructive' : ''}`}>
      {/* Card header */}
      <CardContent
        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            <span className="font-medium truncate">{result.fileName}</span>
            <div className="flex gap-2 shrink-0">
              {hasFindings && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-destructive/20 text-destructive">
                  {result.findings.length} PII
                </span>
              )}
              {!hasFindings && !hasError && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-600">
                  Clean
                </span>
              )}
              {hasError && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                  Error
                </span>
              )}
            </div>
          </div>
          {hasFindings && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRedact(result.attachmentId);
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Redact All
            </Button>
          )}
        </div>
      </CardContent>

      {/* Expanded content */}
      {isExpanded && (
        <CardContent className="px-4 pb-4 pt-0 border-t">
          {/* Error message */}
          {hasError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Error:</strong> {result.error}
              </p>
            </div>
          )}

          {/* Processing time */}
          {!hasError && (
            <div className="mt-4 text-xs text-muted-foreground">
              Processed in {result.processingTimeMs}ms
            </div>
          )}

          {/* Findings grouped by type */}
          {hasFindings && !hasError && (
            <div className="mt-4">
              <OCRFindings findings={result.findings} />
            </div>
          )}

          {/* Action buttons */}
          {hasFindings && !hasError && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(result.attachmentId)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRedact(result.attachmentId)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Redact & Upload
              </Button>
            </div>
          )}

          {/* No findings message */}
          {!hasFindings && !hasError && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-600">
                No PII detected in this attachment.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
