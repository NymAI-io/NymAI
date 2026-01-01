import { describe, it, expect } from 'vitest';
import { detect, redact, maskValue } from '../src';
import type { DataType } from '../src';

describe('maskValue utility', () => {
  const cases: Array<{ type: DataType; input: string; expected: string }> = [
    { type: 'SSN', input: '123-45-6789', expected: '***-**-6789' },
    { type: 'CC', input: '4111111111111111', expected: '****-****-****-1111' },
    { type: 'EMAIL', input: 'test@example.com', expected: 't***@****.com' },
    { type: 'PHONE', input: '555-123-4567', expected: '(***) ***-4567' },
    { type: 'DL', input: 'CA12345678', expected: '******5678' },
  ];

  it.each(cases)('masks $type correctly', ({ type, input, expected }) => {
    expect(maskValue(input, type)).toBe(expected);
  });
});

describe('Redaction preserves non-PII content', () => {
  it('preserves surrounding text exactly', () => {
    const text = 'Hello, my SSN is 123-45-6789. Thank you!';
    const findings = detect(text);
    const result = redact(text, findings);

    expect(result.redactedText).toBe('Hello, my SSN is ***-**-6789. Thank you!');
  });

  it('handles adjacent findings with space', () => {
    const text = '123-45-6789 111-22-3333';
    const findings = detect(text, { types: ['SSN'] });
    const result = redact(text, findings);

    expect(findings).toHaveLength(2);
    expect(result.redactedText).toContain('***-**-6789');
    expect(result.redactedText).toContain('***-**-3333');
  });

  it('handles concatenated numbers (not detected as separate SSNs)', () => {
    // Without word boundaries, concatenated SSNs are not detected
    const text = '123-45-6789111-22-3333';
    const findings = detect(text, { types: ['SSN'] });

    // This tests current behavior - regex uses \b word boundaries
    expect(findings).toHaveLength(0);
  });
});

describe('Redaction with complex scenarios', () => {
  it('handles same value appearing multiple times', () => {
    const text = 'SSN1: 123-45-6789, SSN2: 123-45-6789';
    const findings = detect(text, { types: ['SSN'] });
    const result = redact(text, findings);

    expect(findings).toHaveLength(2);
    expect(result.redactedText).toBe('SSN1: ***-**-6789, SSN2: ***-**-6789');
  });

  it('handles overlapping pattern types gracefully', () => {
    // Phone number that could be confused with other patterns
    const text = 'Contact: 800-555-1212';
    const findings = detect(text);

    // Should find phone, should NOT find SSN (wrong format)
    const phoneFindings = findings.filter((f) => f.type === 'PHONE');
    const ssnFindings = findings.filter((f) => f.type === 'SSN');

    expect(phoneFindings.length).toBeGreaterThanOrEqual(1);
    expect(ssnFindings).toHaveLength(0);
  });
});
