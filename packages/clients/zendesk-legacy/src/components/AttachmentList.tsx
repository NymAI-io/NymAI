/**
 * AttachmentList Component
 * Displays list of attachments with OCR findings and redaction controls.
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { OCRResult, OCRProgress } from '@/types/ocr';
import { AttachmentCard } from './AttachmentCard';
import { countTotalFindings } from '@/services/ocr.service';

export interface AttachmentListProps {
  /** OCR results for attachments */
  results: OCRResult[];
  /** Current OCR progress state */
  progress: OCRProgress | null;
  /** Callback to initiate redaction for an attachment */
  onRedact: (attachmentId: string) => void;
  /** Callback to undo redaction */
  onUndo: (attachmentId: string) => void;
  /** Callback to view redaction preview */
  onPreview: (attachmentId: string) => void;
}

/**
 * AttachmentList Component
 */
export const AttachmentList: React.FC<AttachmentListProps> = ({
  results,
  progress,
  onRedact,
  onUndo,
  onPreview,
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (attachmentId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(attachmentId)) {
      newExpanded.delete(attachmentId);
    } else {
      newExpanded.add(attachmentId);
    }
    setExpandedCards(newExpanded);
  };

  const expandAll = () => {
    setExpandedCards(new Set(results.map((r) => r.attachmentId)));
  };

  const collapseAll = () => {
    setExpandedCards(new Set());
  };

  const totalFindings = countTotalFindings(results);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {progress && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{getStageLabel(progress.stage)}</span>
              <span className="text-xs text-muted-foreground">
                {progress.current} / {progress.total}
              </span>
            </div>
            {progress.fileName && (
              <div className="text-xs text-muted-foreground mb-2 truncate">
                {progress.fileName}
              </div>
            )}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary header */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Attachments Scanned: {results.length}</h3>
                <p className="text-sm text-muted-foreground">
                  PII Found: <strong className="text-destructive">{totalFindings}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={expandAll}>
                  Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>
                  Collapse All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachment cards */}
      {results.map((result) => (
        <AttachmentCard
          key={result.attachmentId}
          result={result}
          isExpanded={expandedCards.has(result.attachmentId)}
          onToggle={() => toggleCard(result.attachmentId)}
          onRedact={onRedact}
          onUndo={onUndo}
          onPreview={onPreview}
        />
      ))}

      {/* No results state */}
      {results.length === 0 && !progress && (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <CheckCircle className="h-8 w-8 mb-2" />
              <p className="text-sm font-medium">No attachments scanned yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Get display label for OCR stage.
 */
function getStageLabel(stage: OCRProgress['stage']): string {
  const labels: Record<OCRProgress['stage'], string> = {
    idle: 'Ready',
    downloading: 'Downloading attachments...',
    processing: 'Processing images...',
    detecting: 'Detecting PII...',
  };

  return labels[stage] || stage;
}
