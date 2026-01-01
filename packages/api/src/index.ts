import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { requestId, logger } from './middleware/logging';
import { auth, adminAuth } from './middleware/auth';
import redactRoute from './routes/redact';
import detectRoute from './routes/detect';
import logsRoute from './routes/logs';
import settingsRoute from './routes/settings';

// Declare context variable types
declare module 'hono' {
    interface ContextVariableMap {
        requestId: string;
        workspaceId: string;
    }
}

const app = new Hono();

// Global middleware - CORS with dynamic origin for Zendesk subdomains
app.use('*', cors({
    origin: (origin) => {
        // Allow static origins
        const allowedOrigins = [
            'https://nymai.io',
            'https://nymai-admin.vercel.app',
            'https://nymai-admin-theta.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173'
        ];

        if (allowedOrigins.includes(origin)) {
            return origin;
        }

        // Allow any Zendesk subdomain (*.zendesk.com)
        if (origin && /^https:\/\/[a-z0-9-]+\.zendesk\.com$/.test(origin)) {
            return origin;
        }

        return null; // Deny other origins
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'x-api-key', 'x-zendesk-subdomain', 'x-zendesk-token'],
    credentials: true,
}));
app.use('*', requestId);
app.use('*', logger);

// Health check - no auth required
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes - require workspace auth
const api = new Hono();
api.use('*', auth);
api.route('/redact', redactRoute);
api.route('/detect', detectRoute);

// Admin routes - require elevated auth
const admin = new Hono();
admin.use('*', adminAuth);
admin.route('/logs', logsRoute);
admin.route('/settings', settingsRoute);

// Mount route groups
app.route('/api', api);
app.route('/api', admin);

// Error handling
app.onError((err, c) => {
    console.error('Unhandled error:', err.message.slice(0, 50));
    return c.json({
        error: 'Internal Server Error',
        code: 'UNHANDLED_ERROR',
        message: 'An unexpected error occurred',
    }, 500);
});

// 404 handler
app.notFound((c) => {
    return c.json({
        error: 'Not Found',
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${c.req.path} not found`,
    }, 404);
});

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`🚀 NymAI API server starting on port ${port}`);
console.log(`📋 Health check: http://localhost:${port}/health`);
console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);

serve({ fetch: app.fetch, port });

export default app;
