/**
 * OCRFindings Component
 * Displays OCR findings grouped by PII type.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PIIType } from '@/types/ocr';
import { OCRFinding } from '@/types/ocr';

export interface OCRFindingsProps {
  findings: OCRFinding[];
}

/**
 * Get PII type label for display.
 */
function getPIITypeLabel(type: PIIType): string {
  const labels: Record<PIIType, string> = {
    [PIIType.SSN]: 'Social Security Number',
    [PIIType.CREDIT_CARD]: 'Credit Card Number',
    [PIIType.EMAIL]: 'Email Address',
    [PIIType.PHONE]: 'Phone Number',
    [PIIType.DRIVERS_LICENSE]: "Driver's License",
    [PIIType.PASSPORT]: 'Passport Number',
    [PIIType.BANK_ACCOUNT]: 'Bank Account Number',
    [PIIType.ROUTING_NUMBER]: 'Routing Number',
    [PIIType.MEDICAL_RECORD]: 'Medical Record Number',
    [PIIType.HEALTH_INSURANCE]: 'Health Insurance Number',
  };

  return labels[type] || type;
}

/**
 * Get icon for PII type.
 */
function getPIITypeIcon(type: PIIType): string {
  const icons: Record<PIIType, string> = {
    [PIIType.SSN]: '🆔',
    [PIIType.CREDIT_CARD]: '💳',
    [PIIType.EMAIL]: '📧',
    [PIIType.PHONE]: '📞',
    [PIIType.DRIVERS_LICENSE]: '🪪',
    [PIIType.PASSPORT]: '🛂',
    [PIIType.BANK_ACCOUNT]: '🏦',
    [PIIType.ROUTING_NUMBER]: '🔢',
    [PIIType.MEDICAL_RECORD]: '🏥',
    [PIIType.HEALTH_INSURANCE]: '⚕️',
  };

  return icons[type] || '📄';
}

/**
 * Get confidence color based on score.
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-destructive';
  if (confidence >= 0.7) return 'text-orange-500';
  return 'text-yellow-600';
}

/**
 * Get confidence level label.
 */
function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.9) return 'High';
  if (confidence >= 0.7) return 'Medium';
  return 'Low';
}

/**
 * Group findings by PII type.
 */
function groupFindingsByType(findings: OCRFinding[]): Map<PIIType, OCRFinding[]> {
  const grouped = new Map<PIIType, OCRFinding[]>();

  for (const finding of findings) {
    const existing = grouped.get(finding.type) || [];
    existing.push(finding);
    grouped.set(finding.type, existing);
  }

  return grouped;
}

/**
 * OCRFindings Component
 */
export const OCRFindings: React.FC<OCRFindingsProps> = ({ findings }) => {
  const grouped = groupFindingsByType(findings);

  return (
    <div className="space-y-2">
      {Array.from(grouped.entries()).map(([type, items]) => (
        <Card key={type} className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getPIITypeIcon(type)}</span>
                <div>
                  <p className="font-medium text-sm">{getPIITypeLabel(type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {items.length} instance{items.length > 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-semibold ${getConfidenceColor(items[0].confidence)}`}
                >
                  {Math.round(items[0].confidence * 100)}%
                </span>
                <p className="text-xs text-muted-foreground">
                  {getConfidenceLevel(Math.max(...items.map((i) => i.confidence)))} confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
