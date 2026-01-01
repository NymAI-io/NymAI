/**
 * Admin Console Types
 */

// Settings types
export type WorkspaceMode = 'detection' | 'redaction';

export interface WorkspaceSettings {
    workspace_id: string;
    mode: WorkspaceMode;
    detect_ssn: boolean;
    detect_cc: boolean;
    detect_email: boolean;
    detect_phone: boolean;
    detect_dl: boolean;
}

export interface SettingsUpdateRequest {
    mode?: WorkspaceMode;
    detect_ssn?: boolean;
    detect_cc?: boolean;
    detect_email?: boolean;
    detect_phone?: boolean;
    detect_dl?: boolean;
}

// Log types
export type LogAction = 'redacted' | 'detected';
export type DataType = 'SSN' | 'CC' | 'EMAIL' | 'PHONE' | 'DL';

export interface MetadataLog {
    id: string;
    workspace_id: string;
    ticket_id: string;
    comment_id: string | null;
    data_types: DataType[];
    agent_id: string;
    action: LogAction;
    created_at: string;
}

export interface LogsResponse {
    logs: MetadataLog[];
    total: number;
    page: number;
    per_page: number;
}

export interface LogsQuery {
    start_date?: string;
    end_date?: string;
    action?: LogAction;
    limit?: number;
    offset?: number;
}

// Stats types
export interface StatsResponse {
    total_redactions: number;
    total_detections: number;
    data_type_breakdown: Record<DataType, number>;
}

// Error types
export interface APIError {
    error: string;
    code: string;
    message: string;
}

// Auth types
export interface User {
    id: string;
    email: string;
    name?: string;
}
