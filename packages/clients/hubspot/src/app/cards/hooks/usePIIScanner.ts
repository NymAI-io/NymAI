import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { NymAIClient } from '../api/nymai-client';
import { HubSpotAPIClient } from '../api/hubspot-client';
import { createMaskedPreview } from '../lib/utils';
import type { ActivityFindings, Finding, ScannerStatus, UndoState, HubSpotFetchFn } from '../types';

interface UsePIIScannerConfig {
  fetchFn: HubSpotFetchFn;
  portalId: number;
  userId: number;
  objectId: string;
  objectType: string;
}

interface UsePIIScannerResult {
  status: ScannerStatus;
  activityFindings: ActivityFindings[];
  totalFindings: number;
  errorMessage: string;
  showUndo: boolean;
  undoCountdown: number;
  scan: () => Promise<void>;
  redactAll: () => Promise<void>;
  undo: () => Promise<void>;
}

export function usePIIScanner(config: UsePIIScannerConfig): UsePIIScannerResult {
  const { fetchFn, portalId, userId, objectId, objectType } = config;

  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [activityFindings, setActivityFindings] = useState<ActivityFindings[]>([]);
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nymaiClient = useMemo(() => new NymAIClient(fetchFn), [fetchFn]);
  const hubspotClient = useMemo(() => new HubSpotAPIClient(fetchFn), [fetchFn]);

  const totalFindings = activityFindings.reduce(
    (sum: number, af: ActivityFindings) => sum + af.findings.length,
    0
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const clearCountdownInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scan = useCallback(async () => {
    if (status === 'scanning' || status === 'redacting') return;

    setStatus('scanning');
    setErrorMessage('');
    setActivityFindings([]);

    try {
      const activities = await hubspotClient.getActivities(objectId, objectType);

      if (activities.length === 0) {
        setStatus('clean');
        return;
      }

      const results: ActivityFindings[] = [];

      for (const activity of activities) {
        try {
          const response = await nymaiClient.detect({
            ticket_id: activity.id,
            text: activity.text,
            agent_id: String(userId),
            workspace_id: String(portalId),
          });

          if (response.findings.length > 0) {
            const findings: Finding[] = response.findings.map(
              (f: { type: Finding['type']; confidence: number; start: number; end: number }) => ({
                type: f.type,
                confidence: f.confidence,
                maskedPreview: createMaskedPreview(activity.text, f.start, f.end),
                activityId: activity.id,
                activityType: activity.type,
                start: f.start,
                end: f.end,
              })
            );

            results.push({ activity, findings });
          }
        } catch (error) {
          console.error(`Failed to scan activity ${activity.id}:`, error);
        }
      }

      setActivityFindings(results);
      setStatus(results.length > 0 ? 'found' : 'clean');
    } catch (error) {
      console.error('Scan error:', error);
      setErrorMessage('Failed to scan record. Please try again.');
      setStatus('error');
    }
  }, [status, objectId, objectType, portalId, userId, hubspotClient, nymaiClient]);

  const redactAll = useCallback(async () => {
    if (status === 'scanning' || status === 'redacting') return;

    setStatus('redacting');
    const newUndoStack: UndoState[] = [];

    for (const af of activityFindings) {
      try {
        const { redacted_text } = await nymaiClient.redact({
          ticket_id: af.activity.id,
          comment_id: af.activity.id,
          text: af.activity.text,
          agent_id: String(userId),
          workspace_id: String(portalId),
        });

        await hubspotClient.updateActivity(af.activity.id, af.activity.type, redacted_text);

        newUndoStack.push({
          activityId: af.activity.id,
          activityType: af.activity.type,
          originalText: af.activity.text,
        });
      } catch (error) {
        console.error(`Failed to redact activity ${af.activity.id}:`, error);
      }
    }

    setUndoStack(newUndoStack);
    setStatus('redacted');
    setShowUndo(true);
    setUndoCountdown(10);

    clearCountdownInterval();
    intervalRef.current = setInterval(() => {
      setUndoCountdown((prev: number) => {
        if (prev <= 1) {
          clearCountdownInterval();
          setShowUndo(false);
          setUndoStack([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [
    status,
    activityFindings,
    portalId,
    userId,
    hubspotClient,
    nymaiClient,
    clearCountdownInterval,
  ]);

  const undo = useCallback(async () => {
    if (status === 'scanning' || status === 'redacting') return;

    clearCountdownInterval();
    setStatus('redacting');

    try {
      for (const undoItem of undoStack) {
        await hubspotClient.updateActivity(
          undoItem.activityId,
          undoItem.activityType,
          undoItem.originalText
        );
      }

      setShowUndo(false);
      setUndoStack([]);
      setActivityFindings([]);
      setStatus('idle');
    } catch (error) {
      console.error('Undo error:', error);
      setErrorMessage('Undo failed. Please restore manually.');
      setStatus('error');
    }
  }, [status, undoStack, hubspotClient, clearCountdownInterval]);

  return {
    status,
    activityFindings,
    totalFindings,
    errorMessage,
    showUndo,
    undoCountdown,
    scan,
    redactAll,
    undo,
  };
}
