import { Context, Next } from 'hono';
import { nanoid } from 'nanoid';

/**
 * Request ID middleware - adds unique ID for request tracing.
 */
export async function requestId(c: Context, next: Next) {
    const id = `req_${nanoid(12)}`;
    c.set('requestId', id);
    c.header('X-Request-ID', id);
    await next();
}

/**
 * Logging middleware - logs request metadata only, NEVER bodies.
 * 
 * SECURITY: Request/response bodies contain PII and are NEVER logged.
 */
export async function logger(c: Context, next: Next) {
    const start = Date.now();
    const requestId = c.get('requestId') || 'unknown';
    const workspaceId = c.req.header('x-workspace-id') || 'unknown';

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    // Structured log format - NO BODY CONTENT
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
        service: 'api',
        request_id: requestId,
        workspace_id: workspaceId,
        method: c.req.method,
        endpoint: c.req.path,
        duration_ms: duration,
        status_code: status,
    };

    console.log(JSON.stringify(logEntry));
}

/**
 * Sanitize error messages for logging - limit to first 20 chars.
 * NEVER include full error messages that may contain PII.
 */
export function sanitizeError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message.slice(0, 20) + (message.length > 20 ? '...' : '');
}
