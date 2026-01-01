import { Hono } from 'hono';
import { getSupabaseClient } from '../db/client';
import { getWorkspaceId } from '../middleware/auth';
import { sanitizeError } from '../middleware/logging';
import type { WorkspaceConfig, WorkspaceMode } from '../db/schema';

const settingsRoute = new Hono();

interface SettingsResponse {
    workspace_id: string;
    mode: WorkspaceMode;
    detect_ssn: boolean;
    detect_cc: boolean;
    detect_email: boolean;
    detect_phone: boolean;
    detect_dl: boolean;
}

interface SettingsUpdateRequest {
    mode?: WorkspaceMode;
    detect_ssn?: boolean;
    detect_cc?: boolean;
    detect_email?: boolean;
    detect_phone?: boolean;
    detect_dl?: boolean;
}

const DEFAULT_SETTINGS: Omit<SettingsResponse, 'workspace_id'> = {
    mode: 'redaction',
    detect_ssn: true,
    detect_cc: true,
    detect_email: true,
    detect_phone: true,
    detect_dl: true,
};

/**
 * GET /api/settings
 * 
 * Retrieves workspace configuration.
 */
settingsRoute.get('/', async (c) => {
    try {
        const workspaceId = getWorkspaceId(c);
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('workspace_configs')
            .select('*')
            .eq('workspace_id', workspaceId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Failed to fetch settings:', sanitizeError(error));
            return c.json({
                error: 'Internal Server Error',
                code: 'SETTINGS_FETCH_FAILED',
                message: 'Failed to fetch settings',
            }, 500);
        }

        if (data) {
            const config = data as WorkspaceConfig;
            return c.json<SettingsResponse>({
                workspace_id: config.workspace_id,
                mode: config.mode,
                detect_ssn: config.detect_ssn,
                detect_cc: config.detect_cc,
                detect_email: config.detect_email,
                detect_phone: config.detect_phone,
                detect_dl: config.detect_dl,
            });
        }

        return c.json<SettingsResponse>({
            workspace_id: workspaceId,
            ...DEFAULT_SETTINGS,
        });

    } catch (error) {
        console.error('Settings get error:', sanitizeError(error));
        return c.json({
            error: 'Internal Server Error',
            code: 'SETTINGS_FAILED',
            message: 'An error occurred while fetching settings',
        }, 500);
    }
});

/**
 * POST /api/settings
 * 
 * Updates workspace configuration.
 */
settingsRoute.post('/', async (c) => {
    try {
        const workspaceId = getWorkspaceId(c);
        const body = await c.req.json<SettingsUpdateRequest>();

        if (body.mode && !['detection', 'redaction'].includes(body.mode)) {
            return c.json({
                error: 'Bad Request',
                code: 'INVALID_MODE',
                message: 'mode must be "detection" or "redaction"',
            }, 400);
        }

        const supabase = getSupabaseClient();

        const { data: existing } = await supabase
            .from('workspace_configs')
            .select('workspace_id')
            .eq('workspace_id', workspaceId)
            .single();

        if (existing) {
            const updateData = {
                ...body,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('workspace_configs')
                .update(updateData)
                .eq('workspace_id', workspaceId)
                .select()
                .single();

            if (error) {
                console.error('Failed to update settings:', sanitizeError(error));
                return c.json({
                    error: 'Internal Server Error',
                    code: 'SETTINGS_UPDATE_FAILED',
                    message: 'Failed to update settings',
                }, 500);
            }

            const config = data as WorkspaceConfig;
            return c.json<SettingsResponse>({
                workspace_id: config.workspace_id,
                mode: config.mode,
                detect_ssn: config.detect_ssn,
                detect_cc: config.detect_cc,
                detect_email: config.detect_email,
                detect_phone: config.detect_phone,
                detect_dl: config.detect_dl,
            });
        } else {
            const newConfig = {
                workspace_id: workspaceId,
                mode: body.mode || DEFAULT_SETTINGS.mode,
                detect_ssn: body.detect_ssn ?? DEFAULT_SETTINGS.detect_ssn,
                detect_cc: body.detect_cc ?? DEFAULT_SETTINGS.detect_cc,
                detect_email: body.detect_email ?? DEFAULT_SETTINGS.detect_email,
                detect_phone: body.detect_phone ?? DEFAULT_SETTINGS.detect_phone,
                detect_dl: body.detect_dl ?? DEFAULT_SETTINGS.detect_dl,
            };

            const { data, error } = await supabase
                .from('workspace_configs')
                .insert(newConfig)
                .select()
                .single();

            if (error) {
                console.error('Failed to create settings:', sanitizeError(error));
                return c.json({
                    error: 'Internal Server Error',
                    code: 'SETTINGS_CREATE_FAILED',
                    message: 'Failed to create settings',
                }, 500);
            }

            const config = data as WorkspaceConfig;
            return c.json<SettingsResponse>({
                workspace_id: config.workspace_id,
                mode: config.mode,
                detect_ssn: config.detect_ssn,
                detect_cc: config.detect_cc,
                detect_email: config.detect_email,
                detect_phone: config.detect_phone,
                detect_dl: config.detect_dl,
            }, 201);
        }

    } catch (error) {
        console.error('Settings update error:', sanitizeError(error));
        return c.json({
            error: 'Internal Server Error',
            code: 'SETTINGS_FAILED',
            message: 'An error occurred while updating settings',
        }, 500);
    }
});

export default settingsRoute;
