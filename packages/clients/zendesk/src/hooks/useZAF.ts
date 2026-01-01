import { useState, useEffect, useCallback, useRef } from 'react';
import type { ZAFClient, ZAFContext, ZAFMetadata, ZendeskComment } from '../types';

interface ZAFState {
    client: ZAFClient | null;
    context: ZAFContext | null;
    metadata: ZAFMetadata | null;
    currentUser: { id: number; name: string; email: string } | null;
    ticketId: string | null;
    comments: ZendeskComment[];
    isLoading: boolean;
    error: string | null;
}

/**
 * React hook for integrating with Zendesk Apps Framework
 */
export function useZAF() {
    const [state, setState] = useState<ZAFState>({
        client: null,
        context: null,
        metadata: null,
        currentUser: null,
        ticketId: null,
        comments: [],
        isLoading: true,
        error: null,
    });

    const clientRef = useRef<ZAFClient | null>(null);

    // Initialize ZAF client
    useEffect(() => {
        const initZAF = async () => {
            try {
                // Check if ZAFClient is available
                if (!window.ZAFClient) {
                    throw new Error('ZAF SDK not loaded');
                }

                const client = window.ZAFClient.init();
                clientRef.current = client;

                // Get context and metadata
                const [context, metadata] = await Promise.all([
                    client.context(),
                    client.metadata(),
                ]);

                // Get current ticket data
                const ticketData = await client.get([
                    'ticket.id',
                    'ticket.comments',
                    'currentUser.id',
                    'currentUser.name',
                    'currentUser.email',
                ]);

                const ticketId = ticketData['ticket.id'] as number | undefined;
                const rawComments = ticketData['ticket.comments'] as ZendeskComment[] | undefined;
                const userId = ticketData['currentUser.id'] as number | undefined;
                const userName = ticketData['currentUser.name'] as string | undefined;
                const userEmail = ticketData['currentUser.email'] as string | undefined;

                setState({
                    client,
                    context,
                    metadata,
                    currentUser: userId ? {
                        id: userId,
                        name: userName || '',
                        email: userEmail || '',
                    } : null,
                    ticketId: ticketId ? String(ticketId) : null,
                    comments: rawComments || [],
                    isLoading: false,
                    error: null,
                });

                // Listen for ticket changes
                client.on('ticket.comments.changed', () => {
                    refreshComments();
                });

            } catch (error) {
                console.error('Failed to initialize ZAF:', error);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to initialize',
                }));
            }
        };

        initZAF();
    }, []);

    // Refresh comments from Zendesk
    const refreshComments = useCallback(async () => {
        if (!clientRef.current) return;

        try {
            const data = await clientRef.current.get('ticket.comments');
            const comments = data['ticket.comments'] as ZendeskComment[] | undefined;
            setState(prev => ({
                ...prev,
                comments: comments || [],
            }));
        } catch (error) {
            console.error('Failed to refresh comments:', error);
        }
    }, []);

    // Update a comment in Zendesk
    const updateComment = useCallback(async (commentId: string, newBody: string): Promise<boolean> => {
        if (!clientRef.current || !state.ticketId) {
            return false;
        }

        try {
            // Use Zendesk API to update the comment
            await clientRef.current.request({
                url: `/api/v2/tickets/${state.ticketId}/comments/${commentId}.json`,
                type: 'PUT',
                data: JSON.stringify({
                    comment: {
                        body: newBody,
                    },
                }),
                contentType: 'application/json',
            });

            await refreshComments();
            return true;
        } catch (error) {
            console.error('Failed to update comment:', error);
            return false;
        }
    }, [state.ticketId, refreshComments]);

    // Get API URL from app settings
    const getApiUrl = useCallback((): string => {
        return state.metadata?.settings.api_url || 'https://api.nymai.com';
    }, [state.metadata]);

    // Get workspace ID (using Zendesk subdomain)
    const getWorkspaceId = useCallback((): string => {
        return state.context?.account.subdomain || 'unknown';
    }, [state.context]);

    // Resize the sidebar
    const resizeSidebar = useCallback(async (height: number) => {
        if (!clientRef.current) return;
        await clientRef.current.invoke('resize', { height });
    }, []);

    return {
        ...state,
        refreshComments,
        updateComment,
        getApiUrl,
        getWorkspaceId,
        resizeSidebar,
    };
}
