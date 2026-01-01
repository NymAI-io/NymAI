import { Hono } from 'hono';
import { detect, type DataType } from '@nymai/core';
import { getSupabaseClient } from '../db/client';
import { getWorkspaceId } from '../middleware/auth';
import { sanitizeError } from '../middleware/logging';
import type { WorkspaceConfig } from '../db/schema';

const detectRoute = new Hono();

interface DetectRequest {
    ticket_id: string;
    comment_id?: string;
    text: string;
    agent_id: string;
}

interface DetectResponse {
    findings: Array<{
        type: DataType;
        confidence: number;
        start: number;
        end: number;
    }>;
    summary: {
        total_count: number;
        by_type: Record<DataType, number>;
    };
    log_id: string;
}

/**
 * POST /api/detect
 * 
 * Detects sensitive data without redacting.
 * Used for detection-only mode.
 * 
 * SECURITY:
 * - Text is held in memory only during request processing
 * - Text is explicitly cleared after processing
 * - Only metadata is logged (no raw text ever)
 */
detectRoute.post('/', async (c) => {
    let inputText: string | null = null;

    try {
        const workspaceId = getWorkspaceId(c);
        const body = await c.req.json<DetectRequest>();

        if (!body.ticket_id || !body.text || !body.agent_id) {
            return c.json({
                error: 'Bad Request',
                code: 'MISSING_FIELDS',
                message: 'ticket_id, text, and agent_id are required',
            }, 400);
        }

        inputText = body.text;

        const supabase = getSupabaseClient();
        const { data: configData } = await supabase
            .from('workspace_configs')
            .select('*')
            .eq('workspace_id', workspaceId)
            .single();

        const config = configData as WorkspaceConfig | null;
        const types = getEnabledTypes(config);
        const findings = detect(inputText, { types });

        inputText = null;

        const sanitizedFindings = findings.map(({ type, confidence, start, end }) => ({
            type,
            confidence,
            start,
            end,
        }));

        const summary = buildSummary(findings);

        let logId = '';
        if (findings.length > 0) {
            const logEntry = {
                workspace_id: workspaceId,
                ticket_id: body.ticket_id,
                comment_id: body.comment_id || null,
                data_types: findings.map((f) => f.type),
                agent_id: body.agent_id,
                action: 'detected',
            };

            const { data: logData, error: logError } = await supabase
                .from('metadata_logs')
                .insert(logEntry)
                .select('id')
                .single();

            if (logError) {
                console.error('Failed to log detection:', sanitizeError(logError));
            }
            const logResult = logData as { id: string } | null;
            logId = logResult?.id || '';
        }

        return c.json<DetectResponse>({
            findings: sanitizedFindings,
            summary,
            log_id: logId,
        });

    } catch (error) {
        inputText = null;
        console.error('Detection error:', sanitizeError(error));
        return c.json({
            error: 'Internal Server Error',
            code: 'DETECTION_FAILED',
            message: 'An error occurred during detection',
        }, 500);
    }
});

function getEnabledTypes(config: WorkspaceConfig | null): DataType[] {
    if (!config) {
        return ['SSN', 'CC', 'EMAIL', 'PHONE', 'DL'];
    }

    const types: DataType[] = [];
    if (config.detect_ssn) types.push('SSN');
    if (config.detect_cc) types.push('CC');
    if (config.detect_email) types.push('EMAIL');
    if (config.detect_phone) types.push('PHONE');
    if (config.detect_dl) types.push('DL');

    return types.length > 0 ? types : ['SSN', 'CC', 'EMAIL', 'PHONE', 'DL'];
}

function buildSummary(findings: Array<{ type: DataType }>): DetectResponse['summary'] {
    const byType: Record<DataType, number> = {
        SSN: 0,
        CC: 0,
        EMAIL: 0,
        PHONE: 0,
        DL: 0,
    };

    for (const finding of findings) {
        byType[finding.type]++;
    }

    return {
        total_count: findings.length,
        by_type: byType,
    };
}

export default detectRoute;
