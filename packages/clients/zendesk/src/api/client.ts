import type {
    DetectRequest,
    DetectResponse,
    RedactRequest,
    RedactResponse,
    WorkspaceSettings,
    APIError,
} from '../types';

/**
 * NymAI API Client
 * 
 * Communicates with the NymAI backend for PII detection and redaction.
 */
export class APIClient {
    private baseUrl: string;
    private workspaceId: string;

    constructor(baseUrl: string, workspaceId: string) {
        // Remove trailing slash if present
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.workspaceId = workspaceId;
    }

    /**
     * Make a request to the API with proper headers
     */
    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'x-workspace-id': this.workspaceId,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            const error = data as APIError;
            throw new Error(error.message || 'API request failed');
        }

        return data as T;
    }

    /**
     * Detect PII in text without redacting
     */
    async detect(params: DetectRequest): Promise<DetectResponse> {
        return this.request<DetectResponse>('/api/detect', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Detect and redact PII in text
     */
    async redact(params: RedactRequest): Promise<RedactResponse> {
        return this.request<RedactResponse>('/api/redact', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    /**
     * Get workspace settings
     */
    async getSettings(): Promise<WorkspaceSettings> {
        return this.request<WorkspaceSettings>('/api/settings');
    }
}

/**
 * Create an API client instance
 */
export function createAPIClient(baseUrl: string, workspaceId: string): APIClient {
    return new APIClient(baseUrl, workspaceId);
}
