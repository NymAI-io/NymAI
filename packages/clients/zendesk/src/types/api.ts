import type { DataType } from '@nymai/core';

/**
 * NymAI API Types
 * Types for API requests and responses
 */

// Detection types
export interface Finding {
    type: DataType;
    confidence: number;
    start: number;
    end: number;
}

export interface DetectRequest {
    ticket_id: string;
    comment_id?: string;
    text: string;
    agent_id: string;
}

export interface DetectResponse {
    findings: Finding[];
    summary: {
        total_count: number;
        by_type: Record<DataType, number>;
    };
    log_id: string;
}

// Redaction types
export interface RedactRequest {
    ticket_id: string;
    comment_id: string;
    text: string;
    agent_id: string;
}

export interface RedactResponse {
    redacted_text: string;
    findings: Finding[];
    log_id: string;
}

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

// Error types
export interface APIError {
    error: string;
    code: string;
    message: string;
}
