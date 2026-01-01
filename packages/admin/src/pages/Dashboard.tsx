import { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card';
import { createAPIClient } from '@/api';
import { useAuth } from '@/context';
import type { StatsResponse, DataType } from '@/types';
import { Loader2, Shield, Search, BarChart3 } from 'lucide-react';

const DATA_TYPE_LABELS: Record<DataType, { label: string; icon: string }> = {
    SSN: { label: 'Social Security #', icon: '🆔' },
    CC: { label: 'Credit Cards', icon: '💳' },
    EMAIL: { label: 'Emails', icon: '✉️' },
    PHONE: { label: 'Phone Numbers', icon: '📱' },
    DL: { label: 'Driver\'s Licenses', icon: '🚗' },
};

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}

function StatCard({ label, value, icon, description }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export function Dashboard() {
    const { workspaceId } = useAuth();
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!workspaceId) return;

        const fetchStats = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const apiKey = import.meta.env.VITE_API_KEY;
            const client = createAPIClient(apiUrl, workspaceId, apiKey);

            try {
                const data = await client.getStats();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load stats');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [workspaceId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
            </div>
        );
    }

    const totalActions = (stats?.total_redactions || 0) + (stats?.total_detections || 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of PII detection and redaction activity</p>
            </div>

            {/* Summary stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    label="Total Redactions"
                    value={stats?.total_redactions || 0}
                    icon={<Shield className="h-4 w-4 text-green-600" />}
                    description="PII items masked"
                />
                <StatCard
                    label="Total Detections"
                    value={stats?.total_detections || 0}
                    icon={<Search className="h-4 w-4 text-blue-600" />}
                    description="PII items found"
                />
                <StatCard
                    label="Total Actions"
                    value={totalActions}
                    icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
                    description="All activity"
                />
            </div>

            {/* Data type breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Detection by Type</CardTitle>
                    <CardDescription>Breakdown of detected PII by category</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats?.data_type_breakdown ? (
                        <div className="space-y-4">
                            {Object.entries(stats.data_type_breakdown).map(([type, count]) => {
                                const typeInfo = DATA_TYPE_LABELS[type as DataType];
                                const percentage = totalActions > 0 ? Math.round((count / totalActions) * 100) : 0;

                                return (
                                    <div key={type} className="flex items-center gap-4">
                                        <span className="text-xl w-8">{typeInfo?.icon || '📄'}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">
                                                    {typeInfo?.label || type}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {count} ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No data available yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Quick info */}
            <Card>
                <CardHeader>
                    <CardTitle>About NymAI</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm text-muted-foreground">
                        <p>
                            NymAI helps your team protect sensitive customer data by detecting and redacting
                            personally identifiable information (PII) directly within Zendesk tickets.
                        </p>
                        <ul className="mt-4 space-y-2">
                            <li><strong>Detection Mode:</strong> Highlights PII for review without modifying content</li>
                            <li><strong>Redaction Mode:</strong> Allows agents to mask sensitive data with one click</li>
                            <li><strong>Audit Logs:</strong> View all detection and redaction activity</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
