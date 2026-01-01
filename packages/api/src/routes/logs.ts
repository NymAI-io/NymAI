import { Hono } from 'hono';
import { getSupabaseClient } from '../db/client';
import { getWorkspaceId } from '../middleware/auth';
import { sanitizeError } from '../middleware/logging';
import type { MetadataLog } from '../db/schema';

const logsRoute = new Hono();

interface LogsResponse {
    logs: MetadataLog[];
    total: number;
    page: number;
    per_page: number;
}

interface LogsQuery {
    start_date?: string;
    end_date?: string;
    action?: 'redacted' | 'detected';
    limit?: string;
    offset?: string;
}

/**
 * GET /api/logs
 * 
 * Retrieves metadata logs for a workspace.
 * Used by admin console for audit and analytics.
 * 
 * NOTE: Logs contain metadata only - NO raw text is ever stored.
 */
logsRoute.get('/', async (c) => {
    try {
        const workspaceId = getWorkspaceId(c);
        const query = c.req.query() as LogsQuery;

        const limit = Math.min(parseInt(query.limit || '50', 10), 100);
        const offset = parseInt(query.offset || '0', 10);

        const supabase = getSupabaseClient();

        // Build query
        let dbQuery = supabase
            .from('metadata_logs')
            .select('*', { count: 'exact' })
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (query.start_date) {
            dbQuery = dbQuery.gte('created_at', query.start_date);
        }
        if (query.end_date) {
            dbQuery = dbQuery.lte('created_at', query.end_date);
        }
        if (query.action) {
            dbQuery = dbQuery.eq('action', query.action);
        }

        const { data, error, count } = await dbQuery;

        if (error) {
            console.error('Failed to fetch logs:', sanitizeError(error));
            return c.json({
                error: 'Internal Server Error',
                code: 'LOGS_FETCH_FAILED',
                message: 'Failed to fetch logs',
            }, 500);
        }

        const logs = (data || []) as MetadataLog[];

        return c.json<LogsResponse>({
            logs,
            total: count || 0,
            page: Math.floor(offset / limit) + 1,
            per_page: limit,
        });

    } catch (error) {
        console.error('Logs error:', sanitizeError(error));
        return c.json({
            error: 'Internal Server Error',
            code: 'LOGS_FAILED',
            message: 'An error occurred while fetching logs',
        }, 500);
    }
});

/**
 * GET /api/logs/stats
 * 
 * Retrieves aggregate statistics for a workspace.
 */
logsRoute.get('/stats', async (c) => {
    try {
        const workspaceId = getWorkspaceId(c);
        const query = c.req.query() as Pick<LogsQuery, 'start_date' | 'end_date'>;

        const supabase = getSupabaseClient();

        // Get redacted count
        let redactedQuery = supabase
            .from('metadata_logs')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .eq('action', 'redacted');

        if (query.start_date) {
            redactedQuery = redactedQuery.gte('created_at', query.start_date);
        }
        if (query.end_date) {
            redactedQuery = redactedQuery.lte('created_at', query.end_date);
        }

        const { count: redactedCount } = await redactedQuery;

        // Get detected count
        let detectedQuery = supabase
            .from('metadata_logs')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .eq('action', 'detected');

        if (query.start_date) {
            detectedQuery = detectedQuery.gte('created_at', query.start_date);
        }
        if (query.end_date) {
            detectedQuery = detectedQuery.lte('created_at', query.end_date);
        }

        const { count: detectedCount } = await detectedQuery;

        // Get data type breakdown
        let logsQuery = supabase
            .from('metadata_logs')
            .select('data_types')
            .eq('workspace_id', workspaceId);

        if (query.start_date) {
            logsQuery = logsQuery.gte('created_at', query.start_date);
        }
        if (query.end_date) {
            logsQuery = logsQuery.lte('created_at', query.end_date);
        }

        const { data: allLogs } = await logsQuery;

        const dataTypeBreakdown: Record<string, number> = {
            SSN: 0,
            CC: 0,
            EMAIL: 0,
            PHONE: 0,
            DL: 0,
        };

        const logs = (allLogs || []) as Array<{ data_types: string[] }>;
        for (const log of logs) {
            for (const dataType of log.data_types) {
                if (dataType in dataTypeBreakdown) {
                    dataTypeBreakdown[dataType]++;
                }
            }
        }

        return c.json({
            total_redactions: redactedCount || 0,
            total_detections: detectedCount || 0,
            data_type_breakdown: dataTypeBreakdown,
        });

    } catch (error) {
        console.error('Stats error:', sanitizeError(error));
        return c.json({
            error: 'Internal Server Error',
            code: 'STATS_FAILED',
            message: 'An error occurred while fetching stats',
        }, 500);
    }
});

export default logsRoute;
