import React from 'react';
import {
  Text,
  Button,
  Flex,
  Divider,
  Alert,
  LoadingSpinner,
  Box,
  Tag,
  Heading,
} from '@hubspot/ui-extensions';
import { hubspot } from '@hubspot/ui-extensions';
import { usePIIScanner } from './hooks/usePIIScanner';
import type { Finding, HubSpotContext, HubSpotFetchFn } from './types';

hubspot.extend<'crm.record.sidebar'>(({ context }) => (
  <NymAIPanel context={context as unknown as HubSpotContext} />
));

interface NymAIPanelProps {
  context: HubSpotContext;
}

const NymAIPanel = ({ context }: NymAIPanelProps) => {
  const {
    status,
    activityFindings,
    totalFindings,
    errorMessage,
    showUndo,
    undoCountdown,
    scan,
    redactAll,
    undo,
  } = usePIIScanner({
    fetchFn: hubspot.fetch as unknown as HubSpotFetchFn,
    portalId: context.portal.id,
    userId: context.user.id,
    objectId: context.crm.objectId,
    objectType: context.crm.objectType,
  });

  const getConfidenceColor = (confidence: number): 'default' | 'warning' | 'success' => {
    if (confidence >= 90) return 'success';
    if (confidence >= 75) return 'warning';
    return 'default';
  };

  const getActivityLabel = (type: string): string => {
    const labels: Record<string, string> = {
      note: 'Note',
      email: 'Email',
      call: 'Call',
    };
    return labels[type] || type;
  };

  return (
    <Flex direction="column" gap="md">
      <Flex direction="row" justify="between" align="center">
        <Heading>NymAI</Heading>
        <Text format={{ fontWeight: 'demibold' }} variant="microcopy">
          {context.crm.objectType}
        </Text>
      </Flex>

      <Divider />

      {status === 'idle' && (
        <Flex direction="column" gap="sm">
          <Text>Scan this record for sensitive data (SSN, credit cards, emails, etc.)</Text>
          <Button variant="primary" onClick={scan}>
            Scan for PII
          </Button>
        </Flex>
      )}

      {status === 'scanning' && (
        <Flex direction="column" align="center" gap="sm">
          <LoadingSpinner label="Scanning..." />
          <Text>Analyzing record for sensitive data...</Text>
        </Flex>
      )}

      {status === 'redacting' && (
        <Flex direction="column" align="center" gap="sm">
          <LoadingSpinner label="Redacting..." />
          <Text>Applying redactions...</Text>
        </Flex>
      )}

      {status === 'found' && (
        <Flex direction="column" gap="md">
          <Alert title="Sensitive Data Detected" variant="warning">
            Found {totalFindings} item(s) across {activityFindings.length} activit
            {activityFindings.length === 1 ? 'y' : 'ies'}.
          </Alert>

          <Flex direction="column" gap="sm">
            {activityFindings.map((af) => (
              <Flex key={af.activity.id} direction="column" gap="xs">
                <Text format={{ fontWeight: 'demibold' }} variant="microcopy">
                  {getActivityLabel(af.activity.type)} ({af.findings.length} finding
                  {af.findings.length === 1 ? '' : 's'})
                </Text>
                {af.findings.map((finding: Finding, index: number) => (
                  <Flex key={index} direction="row" justify="between" align="center">
                    <Flex direction="row" gap="xs" align="center">
                      <Tag variant={getConfidenceColor(finding.confidence)}>{finding.type}</Tag>
                      <Text variant="microcopy">{finding.confidence}%</Text>
                    </Flex>
                    <Text variant="microcopy">{finding.maskedPreview}</Text>
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>

          <Divider />

          <Flex direction="row" gap="sm">
            <Button variant="primary" onClick={redactAll}>
              Redact All
            </Button>
            <Button variant="secondary" onClick={scan}>
              Rescan
            </Button>
          </Flex>
        </Flex>
      )}

      {status === 'clean' && (
        <Flex direction="column" gap="sm">
          <Alert title="No Sensitive Data Found" variant="success">
            This record appears clean. No PII detected.
          </Alert>
          <Button variant="secondary" onClick={scan}>
            Scan Again
          </Button>
        </Flex>
      )}

      {status === 'redacted' && (
        <Flex direction="column" gap="md">
          <Alert title="Redaction Complete" variant="success">
            {totalFindings} item(s) have been redacted.
          </Alert>

          {showUndo && (
            <Box>
              <Button variant="secondary" onClick={undo}>
                Undo ({undoCountdown}s)
              </Button>
            </Box>
          )}

          <Button variant="secondary" onClick={scan}>
            Scan Again
          </Button>
        </Flex>
      )}

      {status === 'error' && (
        <Flex direction="column" gap="sm">
          <Alert title="Error" variant="error">
            {errorMessage || 'An unexpected error occurred. Please try again.'}
          </Alert>
          <Button variant="secondary" onClick={scan}>
            Retry
          </Button>
        </Flex>
      )}

      <Divider />
      <Text variant="microcopy">NymAI processes data ephemerally. No raw content is stored.</Text>
    </Flex>
  );
};
