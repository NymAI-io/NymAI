/**
 * ZAF (Zendesk Apps Framework) SDK Type Definitions
 *
 * @see https://developer.zendesk.com/apps/docs/developer-guide/getting_started
 */

export interface ZAFClient {
  get: (path: string | string[]) => Promise<Record<string, unknown>>;
  set: (path: string, value: unknown) => Promise<void>;
  invoke: (action: string, ...args: unknown[]) => Promise<unknown>;
  request: (options: ZAFRequestOptions) => Promise<ZAFResponse>;
  on: (event: string, callback: (data: unknown) => void) => void;
  context: () => Promise<ZAFContext>;
  metadata: () => Promise<ZAFMetadata>;
  trigger: (event: string, data?: unknown) => void;
}

export interface ZAFRequestOptions {
  url: string;
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  contentType?: string;
  headers?: Record<string, string>;
  secure?: boolean;
  responseType?: 'blob' | 'json' | 'text';
}

export interface ZAFResponse<T = unknown> {
  responseJSON?: T;
  responseText?: string;
  status?: number;
  blob?: Blob;
}

export interface ZAFContext {
  instanceGuid: string;
  product: string;
  account: {
    subdomain: string;
  };
  location: string;
  ticketId?: number;
}

export interface ZAFMetadata {
  appId: number;
  installationId: number;
  name: string;
  version: string;
  settings: Record<string, string>;
}

// Zendesk Ticket Types
export interface ZendeskTicket {
  id: number;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
  requester: {
    id: number;
    name: string;
    email: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  comments: ZendeskComment[];
}

export interface ZendeskComment {
  id: number;
  type: 'Comment' | 'VoiceComment';
  body: string;
  htmlBody?: string;
  plainBody?: string;
  public: boolean;
  authorId: number;
  createdAt: string;
  attachments?: ZendeskAttachment[];
}

export interface ZendeskAttachment {
  id: number;
  fileName: string;
  contentUrl: string;
  contentType: string;
  size: number;
}

export interface ZendeskUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'end-user';
}

// Declare global ZAFClient
declare global {
  interface Window {
    ZAFClient?: {
      init: () => ZAFClient;
    };
  }
}
