/**
 * Database schema types for Supabase.
 * NOTE: No raw PII is ever stored - only metadata.
 */

export type WorkspaceMode = 'detection' | 'redaction';
export type LogAction = 'redacted' | 'detected';

export interface Database {
  public: {
    Tables: {
      metadata_logs: {
        Row: {
          id: string;
          workspace_id: string;
          ticket_id: string;
          comment_id: string | null;
          data_types: string[];
          agent_id: string;
          action: LogAction;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          ticket_id: string;
          comment_id?: string | null;
          data_types: string[];
          agent_id: string;
          action: LogAction;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['metadata_logs']['Insert']>;
      };
      workspace_configs: {
        Row: {
          workspace_id: string;
          mode: WorkspaceMode;
          detect_ssn: boolean;
          detect_cc: boolean;
          detect_email: boolean;
          detect_phone: boolean;
          detect_dl: boolean;
          detect_dob: boolean;
          detect_passport: boolean;
          detect_bank_account: boolean;
          detect_routing: boolean;
          detect_ip_address: boolean;
          detect_medicare: boolean;
          detect_itin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          workspace_id: string;
          mode?: WorkspaceMode;
          detect_ssn?: boolean;
          detect_cc?: boolean;
          detect_email?: boolean;
          detect_phone?: boolean;
          detect_dl?: boolean;
          detect_dob?: boolean;
          detect_passport?: boolean;
          detect_bank_account?: boolean;
          detect_routing?: boolean;
          detect_ip_address?: boolean;
          detect_medicare?: boolean;
          detect_itin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspace_configs']['Insert']>;
      };
    };
  };
}

export type MetadataLog = Database['public']['Tables']['metadata_logs']['Row'];
export type MetadataLogInsert = Database['public']['Tables']['metadata_logs']['Insert'];
export type WorkspaceConfig = Database['public']['Tables']['workspace_configs']['Row'];
export type WorkspaceConfigInsert = Database['public']['Tables']['workspace_configs']['Insert'];
