import { useEffect, useState, useCallback } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createAPIClient } from '@/api';
import { useAuth } from '@/context';
import type { MetadataLog, LogsQuery, LogAction, DataType } from '@/types';
import { Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_LABELS: Record<LogAction, { label: string; className: string }> = {
    redacted: { label: 'Redacted', className: 'bg-green-100 text-green-800' },
    detected: { label: 'Detected', className: 'bg-blue-100 text-blue-800' },
};

const DATA_TYPE_COLORS: Record<DataType, string> = {
    SSN: 'bg-red-100 text-red-700',
    CC: 'bg-orange-100 text-orange-700',
    EMAIL: 'bg-blue-100 text-blue-700',
    PHONE: 'bg-purple-100 text-purple-700',
    DL: 'bg-gray-100 text-gray-700',
};

const PAGE_SIZE = 20;

export function Logs() {
    const { workspaceId } = useAuth();
    const [logs, setLogs] = useState<MetadataLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const apiClient = workspaceId
        ? createAPIClient(
            import.meta.env.VITE_API_URL || 'http://localhost:3000',
            workspaceId,
            import.meta.env.VITE_API_KEY
        )
        : null;

    const fetchLogs = useCallback(async () => {
        if (!apiClient) return;

        setIsLoading(true);
        setError(null);

        try {
            const query: LogsQuery = {
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
            };
            if (actionFilter && actionFilter !== 'all') query.action = actionFilter as LogAction;
            if (startDate) query.start_date = startDate;
            if (endDate) query.end_date = endDate;

            const data = await apiClient.getLogs(query);
            setLogs(data.logs);
            setTotal(data.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load logs');
        } finally {
            setIsLoading(false);
        }
    }, [apiClient, page, actionFilter, startDate, endDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const clearFilters = () => {
        setActionFilter('all');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Audit Logs</h1>
                <p className="text-muted-foreground mt-1">View PII detection and redaction activity</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Action</Label>
                            <Select
                                value={actionFilter}
                                onValueChange={(value) => {
                                    setActionFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="redacted">Redacted</SelectItem>
                                    <SelectItem value="detected">Detected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(1);
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                        <Button variant="ghost" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    {error}
                </div>
            )}

            {/* Logs table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No logs found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ticket</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data Types</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Agent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const actionInfo = ACTION_LABELS[log.action];
                                        return (
                                            <tr key={log.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm font-medium text-primary">
                                                        #{log.ticket_id}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${actionInfo.className}`}>
                                                        {actionInfo.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {log.data_types.map((type, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`text-xs px-2 py-0.5 rounded ${DATA_TYPE_COLORS[type] || 'bg-muted'}`}
                                                            >
                                                                {type}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    Agent #{log.agent_id}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, total)} of {total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
