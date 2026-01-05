import { useState, useEffect, useCallback, useMemo } from 'react';
import { useZAF } from '@/hooks';
import { createAPIClient } from '@/api';
import { FindingsList, ActionButton, UndoBanner } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AttachmentList } from '@/components/AttachmentList';
import { useOCR } from '@/hooks/useOCR';
import { useAttachmentRedaction } from '@/hooks/useAttachmentRedaction';
import { enrichAttachment } from '@/services/downloader';
import type { Finding, WorkspaceSettings, WorkspaceMode } from '@/types';
import { Shield, Loader2, Search, AlertTriangle, FileQuestion, FileImage } from 'lucide-react';
import type { OCRResult } from '@/types/ocr';

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
    client,
  } = useZAF();

  const [appState, setAppState] = useState<AppState>('loading');
  const [findings, setFindings] = useState<Finding[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [undoStates, setUndoStates] = useState<UndoState[]>([]);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<number | null>(null);

  // Attachment scanning state
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments'>('comments');
  // TODO: Integrate preview modal component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_previewResult, _setPreviewResult] = useState<OCRResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showRedactionPreview, _setShowRedactionPreview] = useState(false);

  // Create API client
  const apiClient = useMemo(() => {
    if (!zafLoading && !zafError) {
      return createAPIClient(getApiUrl(), getWorkspaceId());
    }
    return null;
  }, [zafLoading, zafError, getApiUrl, getWorkspaceId]);

  const MAX_COMMENTS_TO_SCAN = 20;

  const publicComments = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    return comments
      .filter((c) => c.public && c.body)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_COMMENTS_TO_SCAN);
  }, [comments]);

  // Extract all unique attachments from comments
  const attachments = useMemo(() => {
    if (!comments || comments.length === 0) return [];

    const attachmentMap = new Map<
      string,
      {
        id: string;
        file_name: string;
        content_url: string;
        content_type: string;
        size: number;
      }
    >();

    for (const comment of comments) {
      if (comment.attachments) {
        for (const attachment of comment.attachments) {
          attachmentMap.set(String(attachment.id), {
            id: String(attachment.id),
            file_name: attachment.fileName,
            content_url: attachment.contentUrl,
            content_type: attachment.contentType,
            size: attachment.size,
          });
        }
      }
    }

    return Array.from(attachmentMap.values()).map(enrichAttachment);
  }, [comments]);

  // Setup OCR hook for attachment scanning
  const {
    results: ocrResults,
    progress: ocrProgress,
    isScanning: isScanningAttachments,
    scanAttachments: scanAttachments,
  } = useOCR({
    zaf: client!,
    attachments,
  });

  const {
    undoState: attachmentUndoState,
    redactAttachment,
    undo: undoAttachmentRedaction,
    clearUndo: clearAttachmentUndo,
  } = useAttachmentRedaction({ zaf: client! });

  // Workspace mode (detection-only or redaction)
  const mode: WorkspaceMode = settings?.mode || 'redaction';

  // Scan for PII in all public comments
  const scanForPII = useCallback(async () => {
    if (!apiClient || !ticketId || publicComments.length === 0 || !currentUser) {
      return;
    }

    setAppState('scanning');
    setError(null);

    try {
      const allFindings: Finding[] = [];

      for (const comment of publicComments) {
        const response = await apiClient.detect({
          ticket_id: ticketId,
          comment_id: String(comment.id),
          text: comment.body,
          agent_id: String(currentUser.id),
        });

        const taggedFindings = response.findings.map((f) => ({
          ...f,
          commentId: String(comment.id),
        }));

        allFindings.push(...taggedFindings);
      }

      setFindings(allFindings);
      setLastScanTimestamp(Date.now());
      setAppState('ready');
    } catch (err) {
      console.error('Scan failed:', err);
      setError(err instanceof Error ? err.message : 'Scan failed');
      setAppState('error');
    }
  }, [apiClient, ticketId, publicComments, currentUser]);

  // Redact all detected PII across all comments
  const redactAll = useCallback(async () => {
    if (!apiClient || !ticketId || findings.length === 0 || !currentUser) {
      return;
    }

    setAppState('redacting');
    setError(null);

    try {
      const findingsByComment = findings.reduce(
        (acc, finding) => {
          const commentId = finding.commentId || 'unknown';
          if (!acc[commentId]) acc[commentId] = [];
          acc[commentId].push(finding);
          return acc;
        },
        {} as Record<string, Finding[]>
      );

      const newUndoStates: UndoState[] = [];

      for (const [commentId, commentFindings] of Object.entries(findingsByComment)) {
        const comment = publicComments.find((c) => String(c.id) === commentId);
        if (!comment) continue;

        const response = await apiClient.redact({
          ticket_id: ticketId,
          comment_id: commentId,
          text: comment.body,
          agent_id: String(currentUser.id),
        });

        newUndoStates.push({
          originalText: comment.body,
          commentId: commentId,
          redactedCount: commentFindings.length,
        });

        await updateComment(commentId, response.redacted_text);
      }

      setUndoStates(newUndoStates);
      setFindings([]);
      setAppState('ready');
    } catch (err) {
      console.error('Redaction failed:', err);
      setError(err instanceof Error ? err.message : 'Redaction failed');
      setAppState('ready');
    }
  }, [apiClient, ticketId, findings, publicComments, currentUser, updateComment]);

  // Handle undo for multi-comment redaction
  const handleUndo = useCallback(async () => {
    if (undoStates.length === 0) return;

    try {
      for (const state of undoStates) {
        await updateComment(state.commentId, state.originalText);
      }
      setUndoStates([]);
      scanForPII();
    } catch (err) {
      console.error('Undo failed:', err);
      setError('Failed to undo redaction');
    }
  }, [undoStates, updateComment, scanForPII]);

  const handleUndoExpire = useCallback(() => {
    setUndoStates([]);
  }, []);

  // Handle attachment redaction
  const handleRedactAttachment = useCallback(
    async (attachmentId: string) => {
      const result = ocrResults.find((r) => r.attachmentId === attachmentId);
      if (!result || !client) return;

      const attachment = attachments.find((a) => a.id === attachmentId);
      if (!attachment) return;

      try {
        // Download original image
        const response = await client.request({
          url: attachment.contentUrl,
          responseType: 'blob',
        });

        if (!response?.blob) {
          throw new Error('Failed to download attachment');
        }

        const originalImageUrl = URL.createObjectURL(response.blob);

        await redactAttachment(attachmentId, result, originalImageUrl);
      } catch (err) {
        console.error('Attachment redaction failed:', err);
        setError(err instanceof Error ? err.message : 'Redaction failed');
      }
    },
    [ocrResults, attachments, client, redactAttachment]
  );

  const handlePreviewAttachment = useCallback(
    (attachmentId: string) => {
      const result = ocrResults.find((r) => r.attachmentId === attachmentId);
      if (result) {
        _setPreviewResult(result);
        _setShowRedactionPreview(true);
        setActiveTab('attachments');
      }
    },
    [ocrResults]
  );

  const handleUndoAttachment = useCallback(async () => {
    await undoAttachmentRedaction();
  }, [undoAttachmentRedaction]);

  // Load settings and initial scan
  useEffect(() => {
    if (!apiClient) return;

    const init = async () => {
      try {
        const settingsData = await apiClient.getSettings();
        setSettings(settingsData);
        setAppState('ready');

        if (publicComments.length > 0) {
          scanForPII();
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setAppState('ready');
        if (publicComments.length > 0) {
          scanForPII();
        }
      }
    };

    init();
  }, [apiClient, publicComments.length, scanForPII]);

  // Resize sidebar based on content
  useEffect(() => {
    const totalUndoCount = undoStates.reduce((sum, s) => sum + s.redactedCount, 0);
    const height = totalUndoCount > 0 ? 400 : 300;
    resizeSidebar(height);
  }, [findings, undoStates, resizeSidebar]);

  // Re-scan when comments change
  useEffect(() => {
    if (publicComments.length > 0 && lastScanTimestamp === null) {
      scanForPII();
    }
  }, [publicComments.length, lastScanTimestamp, scanForPII]);

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
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              mode === 'detection' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
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

        {/* Error message */}
        {error && (
          <Card className="mb-4 border-destructive/50 bg-destructive/10">
            <CardContent className="p-3">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabbed interface for Comments vs Attachments */}
        <Tabs
          defaultValue="comments"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'comments' | 'attachments')}
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="comments" className="flex-1">
              Comments
              {findings.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">
                  {findings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex-1">
              Attachments
              {ocrResults.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">
                  {ocrResults.filter((r) => r.findings.length > 0).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments">
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
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments">
            {/* Scan attachments button */}
            {ocrResults.length === 0 && (
              <Card className="mb-4">
                <CardContent className="p-4 text-center">
                  <FileImage className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {attachments.length === 0
                      ? 'No attachments found in this ticket'
                      : `${attachments.length} attachment${attachments.length > 1 ? 's' : ''} found`}
                  </p>
                  {attachments.length > 0 && (
                    <ActionButton
                      onClick={scanAttachments}
                      loading={isScanningAttachments}
                      variant="default"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Scan Attachments
                    </ActionButton>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Attachment list with findings */}
            {ocrResults.length > 0 && (
              <>
                <AttachmentList
                  results={ocrResults}
                  progress={ocrProgress}
                  onRedact={handleRedactAttachment}
                  onUndo={handleUndoAttachment}
                  onPreview={handlePreviewAttachment}
                />

                {/* Scan again button */}
                <div className="mt-4">
                  <ActionButton
                    onClick={scanAttachments}
                    loading={isScanningAttachments}
                    variant="secondary"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Scan Again
                  </ActionButton>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
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
        <ActionButton onClick={scanForPII} loading={appState === 'scanning'} variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Scan Again
        </ActionButton>
      </div>

      {/* Undo banner - comments */}
      {undoStates.length > 0 && (
        <UndoBanner
          itemsRedacted={undoStates.reduce((sum, s) => sum + s.redactedCount, 0)}
          onUndo={handleUndo}
          onExpire={handleUndoExpire}
        />
      )}

      {/* Undo banner - attachments */}
      {attachmentUndoState && (
        <UndoBanner
          itemsRedacted={1}
          onUndo={handleUndoAttachment}
          onExpire={clearAttachmentUndo}
        />
      )}
    </div>
  );
}
