export type DataType = 'SSN' | 'CC' | 'EMAIL' | 'PHONE' | 'DL';

export interface Finding {
  type: DataType;
  confidence: number;
  start: number;
  end: number;
  value: string;
}

export interface DetectOptions {
  types?: DataType[];
}

export interface RedactResult {
  redactedText: string;
  findings: Omit<Finding, 'value'>[];
}

export interface Pattern {
  regex: RegExp;
  confidence: number;
  validate?: (match: string) => boolean;
  mask: (match: string) => string;
}
