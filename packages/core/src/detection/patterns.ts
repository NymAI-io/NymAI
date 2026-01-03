import type { DataType, Pattern } from '../types';
import { luhnCheck } from './luhn';
import { abaRoutingCheck } from './aba';

export const PATTERNS: Record<DataType, Pattern> = {
  SSN: {
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    confidence: 90,
    mask: (match: string) => `***-**-${match.slice(-4)}`,
  },
  CC: {
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    confidence: 95,
    validate: luhnCheck,
    mask: (match: string) => {
      const digits = match.replace(/\D/g, '');
      return `****-****-****-${digits.slice(-4)}`;
    },
  },
  EMAIL: {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    confidence: 98,
    mask: (match: string) => {
      const [local, domain] = match.split('@');
      const tld = domain.split('.').pop() || '';
      return `${local[0]}***@****.${tld}`;
    },
  },
  PHONE: {
    regex: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    confidence: 85,
    mask: (match: string) => {
      const digits = match.replace(/\D/g, '');
      return `(***) ***-${digits.slice(-4)}`;
    },
  },
  DL: {
    regex: /\b[A-Z]{1,2}\d{5,12}\b/g,
    confidence: 70,
    mask: (match: string) => `******${match.slice(-4)}`,
  },
  DOB: {
    regex: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
    confidence: 75,
    mask: () => '**/**/****',
  },
  PASSPORT: {
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    confidence: 65,
    mask: (match: string) => `******${match.slice(-3)}`,
  },
  BANK_ACCOUNT: {
    regex: /\b\d{8,17}\b/g,
    confidence: 60,
    mask: (match: string) => `****${match.slice(-4)}`,
  },
  ROUTING: {
    regex: /\b\d{9}\b/g,
    confidence: 85,
    validate: abaRoutingCheck,
    mask: () => '*********',
  },
  IP_ADDRESS: {
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    confidence: 90,
    mask: (match: string) => `***.***.***.${match.split('.').pop()}`,
  },
  MEDICARE: {
    regex: /\b[1-9][A-Z][A-Z0-9]\d-?[A-Z][A-Z0-9]\d-?[A-Z]{2}\d{2}\b/gi,
    confidence: 80,
    mask: () => '****-****-****',
  },
  ITIN: {
    regex: /\b9\d{2}-[7-9]\d-\d{4}\b/g,
    confidence: 90,
    mask: (match: string) => `***-**-${match.slice(-4)}`,
  },
};
