import type { DataType, Pattern } from '../types';
import { luhnCheck } from './luhn';

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
};
