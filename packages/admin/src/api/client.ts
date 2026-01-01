import type {
    WorkspaceSettings,
    SettingsUpdateRequest,
    LogsResponse,
    LogsQuery,
    StatsResponse,
    APIError,
} from '../types';

/**
 * Admin Console API Client
 * 
 * Communicates with the NymAI backend for settings, logs, and stats.
 */
export class APIClient {
    private baseUrl: string;
    private workspaceId: string;
    private apiKey?: string;

    constructor(baseUrl: string, workspaceId: string, apiKey?: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.workspaceId = workspaceId;
        this.apiKey = apiKey;
    }

    /**
     * Make a request to the API with proper headers
     */
    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-workspace-id': this.workspaceId,
        };

        if (this.apiKey) {
            headers['x-api-key'] = this.apiKey;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
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
     * Get workspace settings
     */
    async getSettings(): Promise<WorkspaceSettings> {
        return this.request<WorkspaceSettings>('/api/settings');
    }

    /**
     * Update workspace settings
     */
    async updateSettings(settings: SettingsUpdateRequest): Promise<WorkspaceSettings> {
        return this.request<WorkspaceSettings>('/api/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    }

    /**
     * Get metadata logs
     */
    async getLogs(query?: LogsQuery): Promise<LogsResponse> {
        const params = new URLSearchParams();
        if (query?.start_date) params.set('start_date', query.start_date);
        if (query?.end_date) params.set('end_date', query.end_date);
        if (query?.action) params.set('action', query.action);
        if (query?.limit) params.set('limit', String(query.limit));
        if (query?.offset) params.set('offset', String(query.offset));

        const queryString = params.toString();
        const path = queryString ? `/api/logs?${queryString}` : '/api/logs';

        return this.request<LogsResponse>(path);
    }

    /**
     * Get stats
     */
    async getStats(startDate?: string, endDate?: string): Promise<StatsResponse> {
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);

        const queryString = params.toString();
        const path = queryString ? `/api/logs/stats?${queryString}` : '/api/logs/stats';

        return this.request<StatsResponse>(path);
    }
}

/**
 * Create an API client instance
 */
export function createAPIClient(baseUrl: string, workspaceId: string, apiKey?: string): APIClient {
    return new APIClient(baseUrl, workspaceId, apiKey);
}
