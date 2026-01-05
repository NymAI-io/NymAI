export type HubSpotObjectType = 'CONTACT' | 'COMPANY' | 'DEAL' | 'TICKET';

export interface HubSpotContext {
  crm: {
    objectId: string;
    objectType: HubSpotObjectType;
  };
  portal: {
    id: number;
  };
  user: {
    id: number;
  };
}

export type ActivityType = 'note' | 'email' | 'call';

export interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  timestamp: string;
}

export type PIIType =
  | 'SSN'
  | 'CC'
  | 'EMAIL'
  | 'PHONE'
  | 'DL'
  | 'DOB'
  | 'PASSPORT'
  | 'BANK_ACCOUNT'
  | 'ROUTING'
  | 'IP_ADDRESS'
  | 'MEDICARE'
  | 'ITIN';

export interface Finding {
  type: PIIType;
  confidence: number;
  start: number;
  end: number;
  maskedPreview: string;
  activityId: string;
  activityType: ActivityType;
}

export interface DetectionSummary {
  total_count: number;
  by_type: Record<PIIType, number>;
}

export interface DetectRequest {
  ticket_id: string;
  text: string;
  agent_id: string;
  workspace_id: string;
  comment_id?: string;
}

export interface DetectResponse {
  findings: Array<{
    type: PIIType;
    confidence: number;
    start: number;
    end: number;
  }>;
  summary: DetectionSummary;
  log_id: string;
}

export interface RedactRequest {
  ticket_id: string;
  comment_id: string;
  text: string;
  agent_id: string;
  workspace_id: string;
}

export interface RedactResponse {
  redacted_text: string;
  findings: Array<{
    type: PIIType;
    confidence: number;
    start: number;
    end: number;
  }>;
  log_id: string;
}

export type ScannerStatus =
  | 'idle'
  | 'scanning'
  | 'found'
  | 'clean'
  | 'redacting'
  | 'redacted'
  | 'error';

export interface ActivityFindings {
  activity: Activity;
  findings: Finding[];
  redactedText?: string;
}

export interface UndoState {
  activityId: string;
  activityType: ActivityType;
  originalText: string;
}

export interface ScannerState {
  status: ScannerStatus;
  activityFindings: ActivityFindings[];
  undoStack: UndoState[];
  showUndo: boolean;
  errorMessage: string;
}

export type HubSpotFetchFn = (url: string, options?: RequestInit) => Promise<Response>;
