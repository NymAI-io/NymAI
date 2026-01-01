import type { Finding, RedactResult } from '../types';
import { PATTERNS } from '../detection/patterns';

/**
 * Redacts sensitive data from text by replacing findings with masked values.
 * @param text - The original text containing sensitive data
 * @param findings - Array of findings from detect()
 * @returns Object containing redacted text and sanitized findings (without raw values)
 */
export function redact(text: string, findings: Finding[]): RedactResult {
  if (findings.length === 0) {
    return { redactedText: text, findings: [] };
  }

  // Sort by position descending to replace from end to start
  // This preserves position indices during replacement
  const sorted = [...findings].sort((a, b) => b.start - a.start);

  let result = text;
  for (const finding of sorted) {
    const pattern = PATTERNS[finding.type];
    const masked = pattern.mask(finding.value);
    result = result.slice(0, finding.start) + masked + result.slice(finding.end);
  }

  // Strip 'value' from findings before returning (security: never expose raw values)
  const sanitizedFindings = findings.map(({ value: _value, ...rest }) => rest);

  return { redactedText: result, findings: sanitizedFindings };
}
