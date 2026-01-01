import { Hono } from 'hono';
import { detect, redact, type DataType } from '@nymai/core';
import { getSupabaseClient } from '../db/client';
import { getWorkspaceId } from '../middleware/auth';
import { sanitizeError } from '../middleware/logging';
import type { WorkspaceConfig } from '../db/schema';

const redactRoute = new Hono();

interface RedactRequest {
    ticket_id: string;
    comment_id: string;
    text: string;
    agent_id: string;
}

interface RedactResponse {
    redacted_text: string;
    findings: Array<{
        type: DataType;
        confidence: number;
        start: number;
        end: number;
    }>;
    log_id: string;
}

/**
 * POST /api/redact
 * 
 * Detects and redacts sensitive data from text.
 * 
 * SECURITY:
 * - Text is held in memory only during request processing
 * - Text is explicitly cleared after processing
 * - Only metadata is logged (no raw text ever)
 */
redactRoute.post('/', async (c) => {
    let inputText: string | null = null;

    try {
        const workspaceId = getWorkspaceId(c);
        const body = await c.req.json<RedactRequest>();

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

        if (findings.length === 0) {
            inputText = null;
            return c.json<RedactResponse>({
                redacted_text: body.text,
                findings: [],
                log_id: '',
            });
        }

        const result = redact(inputText, findings);
        inputText = null;

        const logEntry = {
            workspace_id: workspaceId,
            ticket_id: body.ticket_id,
            comment_id: body.comment_id || null,
            data_types: findings.map((f) => f.type),
            agent_id: body.agent_id,
            action: 'redacted',
        };

        const { data: logData, error: logError } = await supabase
            .from('metadata_logs')
            .insert(logEntry)
            .select('id')
            .single();

        if (logError) {
            console.error('Failed to log redaction:', sanitizeError(logError));
        }

        const logResult = logData as { id: string } | null;

        return c.json<RedactResponse>({
            redacted_text: result.redactedText,
            findings: result.findings,
            log_id: logResult?.id || '',
        });

    } catch (error) {
        inputText = null;
        console.error('Redaction error:', sanitizeError(error));
        return c.json({
            error: 'Internal Server Error',
            code: 'REDACTION_FAILED',
            message: 'An error occurred during redaction',
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

export default redactRoute;
