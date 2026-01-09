import { Context, Next } from 'hono';
import * as crypto from 'crypto';

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
    return c.json(
      {
        error: 'Unauthorized',
        code: 'MISSING_WORKSPACE_ID',
        message: 'x-workspace-id header is required',
      },
      401
    );
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
    return c.json(
      {
        error: 'Unauthorized',
        code: 'MISSING_WORKSPACE_ID',
        message: 'x-workspace-id header is required',
      },
      401
    );
  }

  // MVP: Simple API key validation
  // FUTURE: Replace with Supabase Auth JWT validation
  if (!apiKey) {
    return c.json(
      {
        error: 'Unauthorized',
        code: 'MISSING_API_KEY',
        message: 'x-api-key header is required for admin endpoints',
      },
      401
    );
  }

  c.set('workspaceId', workspaceId);
  await next();
}

/**
 * HubSpot signature verification middleware (v2025.2+).
 *
 * Verifies requests from HubSpot UI Extensions using X-HubSpot-Signature-v3.
 * This is the ONLY supported auth method - hubspot.fetch() does not support custom headers.
 *
 * Required env: HUBSPOT_CLIENT_SECRET
 */
export async function hubspotSignatureAuth(c: Context, next: Next) {
  const signature = c.req.header('x-hubspot-signature-v3');
  const timestamp = c.req.header('x-hubspot-request-timestamp');
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!clientSecret) {
    console.error('[Auth] HUBSPOT_CLIENT_SECRET not configured');
    return c.json(
      {
        error: 'Server Configuration Error',
        code: 'MISSING_CLIENT_SECRET',
        message: 'HubSpot integration not properly configured',
      },
      500
    );
  }

  if (!signature || !timestamp) {
    return c.json(
      {
        error: 'Unauthorized',
        code: 'MISSING_HUBSPOT_SIGNATURE',
        message: 'HubSpot signature headers required',
      },
      401
    );
  }

  const timestampMs = parseInt(timestamp, 10);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > fiveMinutes) {
    return c.json(
      {
        error: 'Unauthorized',
        code: 'SIGNATURE_EXPIRED',
        message: 'Request timestamp is too old or invalid',
      },
      401
    );
  }

  try {
    const rawBody = await c.req.text();
    const url = c.req.url;
    const method = c.req.method;

    const signaturePayload = `${method}${url}${rawBody}${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', clientSecret)
      .update(signaturePayload)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('[Auth] HubSpot signature mismatch');
      return c.json(
        {
          error: 'Unauthorized',
          code: 'INVALID_SIGNATURE',
          message: 'HubSpot signature verification failed',
        },
        401
      );
    }

    c.set('hubspotVerified', true);
    c.set('rawBody', rawBody);
    await next();
  } catch (error) {
    console.error('[Auth] Signature verification error:', (error as Error).message?.slice(0, 50));
    return c.json(
      {
        error: 'Unauthorized',
        code: 'SIGNATURE_ERROR',
        message: 'Failed to verify HubSpot signature',
      },
      401
    );
  }
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

export function getRawBody(c: Context): string {
  return c.get('rawBody') || '';
}
