import type { Finding } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface FindingsListProps {
    findings: Finding[];
    onSelectFinding?: (finding: Finding) => void;
}

const TYPE_LABELS: Record<string, string> = {
    SSN: 'Social Security #',
    CC: 'Credit Card',
    EMAIL: 'Email Address',
    PHONE: 'Phone Number',
    DL: 'Driver\'s License',
};

const TYPE_ICONS: Record<string, string> = {
    SSN: '🆔',
    CC: '💳',
    EMAIL: '✉️',
    PHONE: '📱',
    DL: '🚗',
};

function getConfidenceColor(confidence: number): string {
    if (confidence >= 0.9) return 'text-destructive';
    if (confidence >= 0.7) return 'text-orange-500';
    return 'text-yellow-600';
}

function getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
}

/**
 * Displays a list of PII findings with type, confidence, and optional selection
 */
export function FindingsList({ findings, onSelectFinding }: FindingsListProps) {
    if (findings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mb-2 text-green-500" />
                <p className="text-sm font-medium">No sensitive data detected</p>
                <p className="text-xs mt-1">This ticket appears clean</p>
            </div>
        );
    }

    // Group findings by type
    const grouped = findings.reduce((acc, finding) => {
        if (!acc[finding.type]) {
            acc[finding.type] = [];
        }
        acc[finding.type].push(finding);
        return acc;
    }, {} as Record<string, Finding[]>);

    return (
        <div className="space-y-2">
            {Object.entries(grouped).map(([type, items]) => (
                <Card
                    key={type}
                    className="cursor-pointer hover:bg-destructive/5 transition-colors border-destructive/20 bg-destructive/5"
                    onClick={() => onSelectFinding?.(items[0])}
                >
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{TYPE_ICONS[type] || '⚠️'}</span>
                                <div>
                                    <p className="font-medium text-sm">
                                        {TYPE_LABELS[type] || type}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {items.length} instance{items.length > 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-semibold ${getConfidenceColor(items[0].confidence)}`}>
                                    {Math.round(items[0].confidence * 100)}%
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    {getConfidenceLevel(Math.max(...items.map(i => i.confidence)))} confidence
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
