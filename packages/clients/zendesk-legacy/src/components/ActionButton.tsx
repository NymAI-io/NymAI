import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
    children: React.ReactNode;
}

/**
 * Action button with loading state using shadcn/ui
 */
export function ActionButton({
    onClick,
    disabled = false,
    loading = false,
    variant = 'default',
    children,
}: ActionButtonProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled || loading}
            variant={variant}
            className="w-full"
        >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    );
}
