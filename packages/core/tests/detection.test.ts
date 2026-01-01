import { describe, it, expect } from 'vitest';
import { detect, redact, luhnCheck } from '../src';
import type { Finding } from '../src';

// ============================================================
// SSN Detection Tests
// ============================================================
describe('SSN Detection', () => {
  const ssnCases = [
    { input: 'My SSN is 123-45-6789', expected: 1, match: '123-45-6789' },
    { input: 'SSN: 000-00-0000', expected: 1, match: '000-00-0000' },
    { input: 'Multiple: 111-22-3333 and 444-55-6666', expected: 2 },
    { input: 'No SSN here', expected: 0 },
    { input: '123456789 (no dashes)', expected: 0 },
    { input: '123-456-7890 (wrong format)', expected: 0 },
  ];

  it.each(ssnCases)('detects $expected SSN(s) in: "$input"', ({ input, expected, match }) => {
    const findings = detect(input, { types: ['SSN'] });
    expect(findings).toHaveLength(expected);
    if (match && findings.length > 0) {
      expect(findings[0].value).toBe(match);
      expect(findings[0].confidence).toBe(90);
    }
  });

  it('correctly identifies SSN positions', () => {
    const text = 'SSN: 123-45-6789';
    const findings = detect(text, { types: ['SSN'] });
    expect(findings[0].start).toBe(5);
    expect(findings[0].end).toBe(16);
  });
});

// ============================================================
// Credit Card Detection Tests
// ============================================================
describe('Credit Card Detection', () => {
  // Valid test card numbers (pass Luhn)
  const validCards = [
    '4111111111111111', // Visa test
    '4111-1111-1111-1111',
    '4111 1111 1111 1111',
    '5500000000000004', // Mastercard test
    '340000000000009', // Amex (15 digits) - won't match 16-digit pattern
  ];

  const invalidCards = [
    '1234567890123456', // Fails Luhn
    '1234-5678-9012-3456', // Fails Luhn
  ];

  it.each(validCards.slice(0, 3))('detects valid card: %s', (card) => {
    const findings = detect(`Card: ${card}`, { types: ['CC'] });
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings[0].confidence).toBe(95);
  });

  it.each(invalidCards)('rejects invalid card: %s', (card) => {
    const findings = detect(`Card: ${card}`, { types: ['CC'] });
    expect(findings).toHaveLength(0);
  });
});

describe('Luhn Algorithm', () => {
  it('validates correct card numbers', () => {
    expect(luhnCheck('4111111111111111')).toBe(true);
    expect(luhnCheck('5500000000000004')).toBe(true);
    expect(luhnCheck('4111-1111-1111-1111')).toBe(true);
  });

  it('rejects invalid card numbers', () => {
    expect(luhnCheck('1234567890123456')).toBe(false);
    expect(luhnCheck('1234567890123457')).toBe(false);
    expect(luhnCheck('12345')).toBe(false); // Too short
  });

  it('accepts all-zeros (edge case - Luhn valid)', () => {
    // 0000000000000000 technically passes Luhn (0 mod 10 = 0)
    // Real-world validation would reject this, but pure Luhn accepts it
    expect(luhnCheck('0000000000000000')).toBe(true);
  });
});

// ============================================================
// Email Detection Tests
// ============================================================
describe('Email Detection', () => {
  const emailCases = [
    { input: 'Contact: test@example.com', expected: 1, match: 'test@example.com' },
    { input: 'user.name+tag@domain.co.uk', expected: 1 },
    { input: 'Multiple: a@b.com and c@d.org', expected: 2 },
    { input: 'No email here', expected: 0 },
    { input: 'invalid@', expected: 0 },
    { input: '@domain.com', expected: 0 },
  ];

  it.each(emailCases)('detects $expected email(s) in: "$input"', ({ input, expected }) => {
    const findings = detect(input, { types: ['EMAIL'] });
    expect(findings).toHaveLength(expected);
    if (expected > 0) {
      expect(findings[0].confidence).toBe(98);
    }
  });
});

// ============================================================
// Phone Detection Tests
// ============================================================
describe('Phone Detection', () => {
  const phoneCases = [
    { input: 'Call: 555-123-4567', expected: 1 },
    { input: 'Phone: (555) 123-4567', expected: 1 },
    { input: '+1 555-123-4567', expected: 1 },
    { input: '5551234567', expected: 1 },
    { input: 'Multiple: 111-222-3333 and 444-555-6666', expected: 2 },
    { input: 'No phone here', expected: 0 },
    { input: '123-4567 (7 digits)', expected: 0 },
  ];

  it.each(phoneCases)('detects $expected phone(s) in: "$input"', ({ input, expected }) => {
    const findings = detect(input, { types: ['PHONE'] });
    expect(findings).toHaveLength(expected);
    if (expected > 0) {
      expect(findings[0].confidence).toBe(85);
    }
  });
});

// ============================================================
// Driver's License Detection Tests
// ============================================================
describe("Driver's License Detection", () => {
  const dlCases = [
    { input: 'DL: A1234567', expected: 1 },
    { input: 'License: CA12345678', expected: 1 },
    { input: 'NY123456789012', expected: 1 },
    { input: 'No DL here', expected: 0 },
    { input: 'ABC123 (too short)', expected: 0 },
  ];

  it.each(dlCases)('detects $expected DL(s) in: "$input"', ({ input, expected }) => {
    const findings = detect(input, { types: ['DL'] });
    expect(findings).toHaveLength(expected);
    if (expected > 0) {
      expect(findings[0].confidence).toBe(70);
    }
  });
});

// ============================================================
// Redaction Tests
// ============================================================
describe('Redaction', () => {
  it('masks SSN correctly', () => {
    const text = 'My SSN is 123-45-6789';
    const findings = detect(text);
    const result = redact(text, findings);
    expect(result.redactedText).toBe('My SSN is ***-**-6789');
  });

  it('masks credit card correctly', () => {
    const text = 'Card: 4111-1111-1111-1111';
    const findings = detect(text, { types: ['CC'] });
    const result = redact(text, findings);
    expect(result.redactedText).toBe('Card: ****-****-****-1111');
  });

  it('masks email correctly', () => {
    const text = 'Email: john@example.com';
    const findings = detect(text, { types: ['EMAIL'] });
    const result = redact(text, findings);
    expect(result.redactedText).toBe('Email: j***@****.com');
  });

  it('masks phone correctly', () => {
    const text = 'Phone: 555-123-4567';
    const findings = detect(text, { types: ['PHONE'] });
    const result = redact(text, findings);
    expect(result.redactedText).toBe('Phone: (***) ***-4567');
  });

  it('handles multiple findings', () => {
    const text = 'SSN: 123-45-6789, Email: test@example.com';
    const findings = detect(text);
    const result = redact(text, findings);
    expect(result.redactedText).toContain('***-**-6789');
    expect(result.redactedText).toContain('t***@****.com');
  });

  it('returns sanitized findings without raw values', () => {
    const text = 'SSN: 123-45-6789';
    const findings = detect(text);
    const result = redact(text, findings);

    // Original findings have value
    expect(findings[0].value).toBeDefined();

    // Redacted findings should not have value
    expect((result.findings[0] as any).value).toBeUndefined();
  });

  it('handles empty findings', () => {
    const text = 'No sensitive data here';
    const findings = detect(text);
    const result = redact(text, findings);
    expect(result.redactedText).toBe(text);
    expect(result.findings).toHaveLength(0);
  });
});

// ============================================================
// Multi-Type Detection Tests
// ============================================================
describe('Multi-Type Detection', () => {
  it('detects all types in mixed content', () => {
    const text = `
      Customer Info:
      SSN: 123-45-6789
      Card: 4111111111111111
      Email: customer@example.com
      Phone: (555) 123-4567
      DL: CA12345678
    `;

    const findings = detect(text);

    const types = findings.map((f) => f.type);
    expect(types).toContain('SSN');
    expect(types).toContain('CC');
    expect(types).toContain('EMAIL');
    expect(types).toContain('PHONE');
    expect(types).toContain('DL');
  });

  it('filters by specified types', () => {
    const text = 'SSN: 123-45-6789, Email: test@example.com';

    const ssnOnly = detect(text, { types: ['SSN'] });
    expect(ssnOnly).toHaveLength(1);
    expect(ssnOnly[0].type).toBe('SSN');

    const emailOnly = detect(text, { types: ['EMAIL'] });
    expect(emailOnly).toHaveLength(1);
    expect(emailOnly[0].type).toBe('EMAIL');
  });

  it('returns findings sorted by position', () => {
    const text = 'First: 123-45-6789, Second: test@example.com';
    const findings = detect(text);

    for (let i = 1; i < findings.length; i++) {
      expect(findings[i].start).toBeGreaterThan(findings[i - 1].start);
    }
  });
});

// ============================================================
// Edge Cases
// ============================================================
describe('Edge Cases', () => {
  it('handles empty string', () => {
    expect(detect('')).toHaveLength(0);
  });

  it('handles special characters', () => {
    const text = '!@#$%^&*() 123-45-6789 !@#$%^&*()';
    const findings = detect(text, { types: ['SSN'] });
    expect(findings).toHaveLength(1);
  });

  it('handles unicode text', () => {
    const text = '日本語 123-45-6789 中文';
    const findings = detect(text, { types: ['SSN'] });
    expect(findings).toHaveLength(1);
  });

  it('handles newlines and tabs', () => {
    const text = 'SSN:\n\t123-45-6789';
    const findings = detect(text, { types: ['SSN'] });
    expect(findings).toHaveLength(1);
  });
});
