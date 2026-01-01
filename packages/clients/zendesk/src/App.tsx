import { useState, useEffect, useCallback, useMemo } from 'react';
import { useZAF } from '@/hooks';
import { createAPIClient } from '@/api';
import { FindingsList, ActionButton, UndoBanner } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import type { Finding, WorkspaceSettings, WorkspaceMode } from '@/types';
import { Shield, Loader2, Search, AlertTriangle, FileQuestion } from 'lucide-react';

type AppState = 'loading' | 'ready' | 'scanning' | 'redacting' | 'error';

interface UndoState {
  originalText: string;
  commentId: string;
  redactedCount: number;
}

export default function App() {
  const {
    isLoading: zafLoading,
    error: zafError,
    ticketId,
    comments,
    currentUser,
    getApiUrl,
    getWorkspaceId,
    updateComment,
    resizeSidebar,
  } = useZAF();

  const [appState, setAppState] = useState<AppState>('loading');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [lastScanCommentId, setLastScanCommentId] = useState<string | null>(null);

  // Create API client
  const apiClient = useMemo(() => {
    if (!zafLoading && !zafError) {
      return createAPIClient(getApiUrl(), getWorkspaceId());
    }
    return null;
  }, [zafLoading, zafError, getApiUrl, getWorkspaceId]);

  // Get the latest comment text to scan
  const latestComment = useMemo(() => {
    if (!comments || comments.length === 0) return null;
    return comments
      .filter(c => c.public && c.body)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [comments]);

  // Workspace mode (detection-only or redaction)
  const mode: WorkspaceMode = settings?.mode || 'redaction';

  // Scan for PII in the latest comment
  const scanForPII = useCallback(async () => {
    if (!apiClient || !ticketId || !latestComment || !currentUser) {
      return;
    }

    setAppState('scanning');
    setError(null);

    try {
      const response = await apiClient.detect({
        ticket_id: ticketId,
        comment_id: String(latestComment.id),
        text: latestComment.body,
        agent_id: String(currentUser.id),
      });

      setFindings(response.findings);
      setLastScanCommentId(String(latestComment.id));
      setAppState('ready');
    } catch (err) {
      console.error('Scan failed:', err);
      setError(err instanceof Error ? err.message : 'Scan failed');
      setAppState('error');
    }
  }, [apiClient, ticketId, latestComment, currentUser]);

  // Redact all detected PII
  const redactAll = useCallback(async () => {
    if (!apiClient || !ticketId || !latestComment || !currentUser) {
      return;
    }

    setAppState('redacting');
    setError(null);

    try {
      const response = await apiClient.redact({
        ticket_id: ticketId,
        comment_id: String(latestComment.id),
        text: latestComment.body,
        agent_id: String(currentUser.id),
      });

      // Store undo state (original text in memory only!)
      setUndoState({
        originalText: latestComment.body,
        commentId: String(latestComment.id),
        redactedCount: response.findings.length,
      });

      // Update the comment in Zendesk
      await updateComment(String(latestComment.id), response.redacted_text);

      // Clear findings after successful redaction
      setFindings([]);
      setAppState('ready');
    } catch (err) {
      console.error('Redaction failed:', err);
      setError(err instanceof Error ? err.message : 'Redaction failed');
      setAppState('ready');
    }
  }, [apiClient, ticketId, latestComment, currentUser, updateComment]);

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (!undoState) return;

    try {
      await updateComment(undoState.commentId, undoState.originalText);
      setUndoState(null);
      scanForPII();
    } catch (err) {
      console.error('Undo failed:', err);
      setError('Failed to undo redaction');
    }
  }, [undoState, updateComment, scanForPII]);

  // Clear undo state when timer expires
  const handleUndoExpire = useCallback(() => {
    setUndoState(null);
  }, []);

  // Load settings and initial scan
  useEffect(() => {
    if (!apiClient) return;

    const init = async () => {
      try {
        const settingsData = await apiClient.getSettings();
        setSettings(settingsData);
        setAppState('ready');

        if (latestComment) {
          scanForPII();
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setAppState('ready');
        if (latestComment) {
          scanForPII();
        }
      }
    };

    init();
  }, [apiClient, latestComment, scanForPII]);

  // Resize sidebar based on content
  useEffect(() => {
    const height = undoState ? 400 : 300;
    resizeSidebar(height);
  }, [findings, undoState, resizeSidebar]);

  // Re-scan when comment changes
  useEffect(() => {
    if (latestComment && lastScanCommentId !== String(latestComment.id)) {
      scanForPII();
    }
  }, [latestComment, lastScanCommentId, scanForPII]);

  // Loading state
  if (zafLoading || appState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading NymAI...</p>
      </div>
    );
  }

  // Error state
  if (zafError || appState === 'error') {
    return (
      <div className="p-4">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="font-semibold text-destructive">Error</h2>
            </div>
            <p className="text-sm text-destructive/80">{zafError || error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-destructive hover:underline"
            >
              Reload sidebar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No ticket context
  if (!ticketId) {
    return (
      <div className="p-4 text-center">
        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Open a ticket to scan for sensitive data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-bold">NymAI</h1>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${mode === 'detection'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
            }`}>
            {mode === 'detection' ? 'Detection Only' : 'Redaction Enabled'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Scanning indicator */}
        {appState === 'scanning' && (
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Scanning for sensitive data...</span>
          </div>
        )}

        {/* Redacting indicator */}
        {appState === 'redacting' && (
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Redacting sensitive data...</span>
          </div>
        )}

        {/* Alert banner if findings exist */}
        {findings.length > 0 && appState === 'ready' && (
          <Card className="mb-4 border-destructive/50 bg-destructive/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-semibold text-destructive text-sm">
                  Sensitive Data Detected
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Findings list */}
        <FindingsList findings={findings} />

        {/* Error message */}
        {error && (
          <Card className="mt-4 border-destructive/50 bg-destructive/10">
            <CardContent className="p-3">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        {mode === 'redaction' && findings.length > 0 && (
          <ActionButton
            onClick={redactAll}
            loading={appState === 'redacting'}
            variant="destructive"
          >
            <Shield className="h-4 w-4 mr-2" />
            Redact All ({findings.length} item{findings.length > 1 ? 's' : ''})
          </ActionButton>
        )}
        <ActionButton
          onClick={scanForPII}
          loading={appState === 'scanning'}
          variant="secondary"
        >
          <Search className="h-4 w-4 mr-2" />
          Scan Again
        </ActionButton>
      </div>

      {/* Undo banner */}
      {undoState && (
        <UndoBanner
          itemsRedacted={undoState.redactedCount}
          onUndo={handleUndo}
          onExpire={handleUndoExpire}
        />
      )}
    </div>
  );
}
