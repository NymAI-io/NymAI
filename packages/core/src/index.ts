// @nymai/core - PII Detection and Redaction Engine
// Zero dependencies - can run in any JavaScript environment

export { detect, PATTERNS } from './detection';
export { redact } from './redaction';
export { maskValue } from './redaction/mask';
export { luhnCheck } from './detection/luhn';
export type { DataType, Finding, DetectOptions, RedactResult, Pattern } from './types';
