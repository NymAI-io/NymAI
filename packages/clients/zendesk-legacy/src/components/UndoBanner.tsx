import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

interface UndoBannerProps {
    itemsRedacted: number;
    onUndo: () => void;
    timeoutMs?: number;
    onExpire: () => void;
}

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Banner with countdown timer for undo action
 */
export function UndoBanner({
    itemsRedacted,
    onUndo,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onExpire,
}: UndoBannerProps) {
    const [remainingMs, setRemainingMs] = useState(timeoutMs);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingMs(prev => {
                if (prev <= 100) {
                    clearInterval(interval);
                    onExpire();
                    return 0;
                }
                return prev - 100;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [onExpire]);

    const remainingSecs = Math.ceil(remainingMs / 1000);
    const progress = (remainingMs / timeoutMs) * 100;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-green-600 text-white shadow-lg">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-700">
                <div
                    className="h-full bg-green-400 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <span className="font-medium text-sm">
                        {itemsRedacted} item{itemsRedacted > 1 ? 's' : ''} redacted
                    </span>
                </div>
                <Button
                    onClick={onUndo}
                    size="sm"
                    variant="secondary"
                    className="bg-white text-green-700 hover:bg-green-50"
                >
                    <Undo2 className="h-4 w-4 mr-1.5" />
                    Undo ({remainingSecs}s)
                </Button>
            </div>
        </div>
    );
}
