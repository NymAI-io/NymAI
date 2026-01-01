import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../src/index';

// Response body types
interface ErrorResponse {
    error: string;
    code: string;
    message: string;
}

interface DetectResponse {
    findings: Array<{
        type: string;
        confidence: number;
        start: number;
        end: number;
    }>;
    summary: {
        total_count: number;
        by_type: Record<string, number>;
    };
    log_id: string;
}

interface RedactResponse {
    redacted_text: string;
    findings: Array<{
        type: string;
        confidence: number;
        start: number;
        end: number;
    }>;
    log_id: string;
}

interface HealthResponse {
    status: string;
    timestamp: string;
}

// Mock Supabase client
vi.mock('../src/db/client', () => ({
    getSupabaseClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: null,
                error: null
            }),
        })),
    })),
}));

describe('API Server', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET /health', () => {
        it('returns ok status', async () => {
            const res = await app.request('/health');
            expect(res.status).toBe(200);

            const body = await res.json() as HealthResponse;
            expect(body.status).toBe('ok');
            expect(body).toHaveProperty('timestamp');
        });
    });

    describe('POST /api/detect', () => {
        it('returns 401 without workspace id', async () => {
            const res = await app.request('/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    text: 'Test text',
                    agent_id: 'agent_123',
                }),
            });

            expect(res.status).toBe(401);
            const body = await res.json() as ErrorResponse;
            expect(body.code).toBe('MISSING_WORKSPACE_ID');
        });

        it('detects SSN in text', async () => {
            const res = await app.request('/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': 'ws_test123',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    text: 'My SSN is 123-45-6789',
                    agent_id: 'agent_123',
                }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as DetectResponse;
            expect(body.findings).toHaveLength(1);
            expect(body.findings[0].type).toBe('SSN');
            expect(body.summary.total_count).toBe(1);
            expect(body.summary.by_type.SSN).toBe(1);
        });

        it('detects multiple PII types', async () => {
            const res = await app.request('/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': 'ws_test123',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    text: 'Contact me at john@example.com or 555-123-4567. My SSN is 111-22-3333.',
                    agent_id: 'agent_123',
                }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as DetectResponse;
            expect(body.findings.length).toBeGreaterThanOrEqual(2);
            expect(body.summary.total_count).toBeGreaterThanOrEqual(2);
        });

        it('returns 400 for missing required fields', async () => {
            const res = await app.request('/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': 'ws_test123',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    // Missing text and agent_id
                }),
            });

            expect(res.status).toBe(400);
            const body = await res.json() as ErrorResponse;
            expect(body.code).toBe('MISSING_FIELDS');
        });
    });

    describe('POST /api/redact', () => {
        it('returns 401 without workspace id', async () => {
            const res = await app.request('/api/redact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    comment_id: 'comment_123',
                    text: 'Test text',
                    agent_id: 'agent_123',
                }),
            });

            expect(res.status).toBe(401);
        });

        it('redacts SSN from text', async () => {
            const res = await app.request('/api/redact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': 'ws_test123',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    comment_id: 'comment_123',
                    text: 'My SSN is 123-45-6789',
                    agent_id: 'agent_123',
                }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as RedactResponse;
            expect(body.redacted_text).toContain('***-**-6789');
            expect(body.redacted_text).not.toContain('123-45-6789');
            expect(body.findings).toHaveLength(1);
        });

        it('returns original text when no PII found', async () => {
            const res = await app.request('/api/redact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-workspace-id': 'ws_test123',
                },
                body: JSON.stringify({
                    ticket_id: '123',
                    comment_id: 'comment_123',
                    text: 'Hello, I need help with my order.',
                    agent_id: 'agent_123',
                }),
            });

            expect(res.status).toBe(200);
            const body = await res.json() as RedactResponse;
            expect(body.redacted_text).toBe('Hello, I need help with my order.');
            expect(body.findings).toHaveLength(0);
        });
    });

    describe('GET /api/logs', () => {
        it('returns 401 without workspace id', async () => {
            const res = await app.request('/api/logs');
            expect(res.status).toBe(401);
        });

        it('returns 401 without API key for admin endpoints', async () => {
            const res = await app.request('/api/logs', {
                headers: {
                    'x-workspace-id': 'ws_test123',
                },
            });

            expect(res.status).toBe(401);
            const body = await res.json() as ErrorResponse;
            expect(body.code).toBe('MISSING_API_KEY');
        });
    });

    describe('GET /api/settings', () => {
        it('returns 401 without credentials', async () => {
            const res = await app.request('/api/settings');
            expect(res.status).toBe(401);
        });
    });

    describe('404 handling', () => {
        it('returns 404 for unknown routes', async () => {
            const res = await app.request('/unknown');
            expect(res.status).toBe(404);

            const body = await res.json() as ErrorResponse;
            expect(body.code).toBe('ROUTE_NOT_FOUND');
        });
    });
});
