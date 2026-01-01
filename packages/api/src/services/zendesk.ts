/**
 * Zendesk API Client
 * 
 * Service for interacting with Zendesk's REST API.
 * Used for updating ticket comments after redaction.
 * 
 * NOTE: OAuth tokens are passed per-request from the sidebar app.
 */

interface ZendeskConfig {
    subdomain: string;
    accessToken: string;
}

interface ZendeskComment {
    id: number;
    body: string;
    author_id: number;
    created_at: string;
    html_body: string;
}

interface ZendeskTicket {
    id: number;
    subject: string;
    description: string;
    status: string;
    requester_id: number;
    assignee_id: number;
}

interface ZendeskUser {
    id: number;
    name: string;
    email: string;
}

interface ZendeskApiResponse {
    ticket?: ZendeskTicket;
    comments?: ZendeskComment[];
    user?: ZendeskUser;
    audit?: {
        events?: Array<{ type: string } & ZendeskComment>;
    };
}

export class ZendeskClient {
    private readonly baseUrl: string;
    private readonly accessToken: string;

    constructor(config: ZendeskConfig) {
        this.baseUrl = `https://${config.subdomain}.zendesk.com/api/v2`;
        this.accessToken = config.accessToken;
    }

    /**
     * Fetch a ticket by ID.
     */
    async getTicket(ticketId: number): Promise<ZendeskTicket> {
        const response = await this.request<{ ticket: ZendeskTicket }>(`/tickets/${ticketId}.json`);
        return response.ticket;
    }

    /**
     * Fetch comments for a ticket.
     */
    async getTicketComments(ticketId: number): Promise<ZendeskComment[]> {
        const response = await this.request<{ comments: ZendeskComment[] }>(`/tickets/${ticketId}/comments.json`);
        return response.comments;
    }

    /**
     * Update a ticket's comment.
     * 
     * NOTE: Zendesk doesn't allow editing existing comments.
     * Instead, we add a new internal note with the redacted content
     * and update the ticket to reference it.
     */
    async addInternalNote(ticketId: number, body: string): Promise<ZendeskComment | undefined> {
        const response = await this.request<ZendeskApiResponse>(`/tickets/${ticketId}.json`, {
            method: 'PUT',
            body: JSON.stringify({
                ticket: {
                    comment: {
                        body,
                        public: false, // Internal note
                    },
                },
            }),
        });
        return response.audit?.events?.find((e) => e.type === 'Comment');
    }

    /**
     * Get current user (the authenticated agent).
     */
    async getCurrentUser(): Promise<ZendeskUser> {
        const response = await this.request<{ user: ZendeskUser }>('/users/me.json');
        return response.user;
    }

    /**
     * Make an authenticated request to Zendesk API.
     */
    private async request<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(
                `Zendesk API error: ${response.status} - ${error.slice(0, 100)}`
            );
        }

        return response.json() as Promise<T>;
    }
}

/**
 * Create a Zendesk client from request headers.
 * 
 * Expects:
 * - x-zendesk-subdomain: The customer's Zendesk subdomain
 * - x-zendesk-token: OAuth access token from ZAF SDK
 */
export function createZendeskClientFromHeaders(headers: {
    get(name: string): string | undefined;
}): ZendeskClient | null {
    const subdomain = headers.get('x-zendesk-subdomain');
    const accessToken = headers.get('x-zendesk-token');

    if (!subdomain || !accessToken) {
        return null;
    }

    return new ZendeskClient({ subdomain, accessToken });
}
