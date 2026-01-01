import { Context, Next } from 'hono';

/**
 * Authentication middleware for API requests.
 * 
 * MVP Implementation:
 * - Validates workspace_id header for API requests
 * - FUTURE: Will integrate with Zendesk OAuth for full auth
 */
export async function auth(c: Context, next: Next) {
    const workspaceId = c.req.header('x-workspace-id');

    if (!workspaceId) {
        return c.json({
            error: 'Unauthorized',
            code: 'MISSING_WORKSPACE_ID',
            message: 'x-workspace-id header is required',
        }, 401);
    }

    c.set('workspaceId', workspaceId);
    await next();
}

/**
 * Admin authentication middleware.
 * For admin console endpoints that require elevated permissions.
 * 
 * MVP Implementation:
 * - Validates admin API key
 * - FUTURE: Will integrate with Supabase Auth
 */
export async function adminAuth(c: Context, next: Next) {
    const workspaceId = c.req.header('x-workspace-id');
    const apiKey = c.req.header('x-api-key');

    if (!workspaceId) {
        return c.json({
            error: 'Unauthorized',
            code: 'MISSING_WORKSPACE_ID',
            message: 'x-workspace-id header is required',
        }, 401);
    }

    // MVP: Simple API key validation
    // FUTURE: Replace with Supabase Auth JWT validation
    if (!apiKey) {
        return c.json({
            error: 'Unauthorized',
            code: 'MISSING_API_KEY',
            message: 'x-api-key header is required for admin endpoints',
        }, 401);
    }

    c.set('workspaceId', workspaceId);
    await next();
}

/**
 * Type-safe getters for context values set by auth middleware.
 */
export function getWorkspaceId(c: Context): string {
    const workspaceId = c.get('workspaceId');
    if (!workspaceId) {
        throw new Error('workspaceId not set in context - auth middleware missing');
    }
    return workspaceId;
}
