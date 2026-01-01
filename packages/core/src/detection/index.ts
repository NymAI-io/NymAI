import type { DataType, Finding, DetectOptions } from '../types';
import { PATTERNS } from './patterns';

const ALL_TYPES: DataType[] = ['SSN', 'CC', 'EMAIL', 'PHONE', 'DL'];

/**
 * Detects sensitive data patterns in the given text.
 * @param text - The text to scan for sensitive data
 * @param options - Optional configuration (e.g., which types to detect)
 * @returns Array of findings with type, confidence, position, and matched value
 */
export function detect(text: string, options?: DetectOptions): Finding[] {
  const types = options?.types ?? ALL_TYPES;
  const findings: Finding[] = [];

  for (const type of types) {
    const pattern = PATTERNS[type];
    // Create new regex instance to reset lastIndex
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      // Skip if validation function exists and fails (e.g., Luhn check for CC)
      if (pattern.validate && !pattern.validate(match[0])) {
        continue;
      }

      findings.push({
        type,
        confidence: pattern.confidence,
        start: match.index,
        end: match.index + match[0].length,
        value: match[0],
      });
    }
  }

  // Sort findings by position (start index)
  return findings.sort((a, b) => a.start - b.start);
}

export { PATTERNS };
