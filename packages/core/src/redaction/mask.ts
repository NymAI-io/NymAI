import type { DataType } from '../types';
import { PATTERNS } from '../detection/patterns';

/**
 * Masks a sensitive value according to its data type pattern.
 * @param value - The sensitive value to mask
 * @param type - The data type for selecting the masking strategy
 * @returns The masked value
 */
export function maskValue(value: string, type: DataType): string {
  const pattern = PATTERNS[type];
  return pattern.mask(value);
}
