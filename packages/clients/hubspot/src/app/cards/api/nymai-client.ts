import { NYMAI_API_URL } from '../lib/constants';
import type {
  DetectRequest,
  DetectResponse,
  RedactRequest,
  RedactResponse,
  HubSpotFetchFn,
} from '../types';

export class NymAIClient {
  constructor(private fetchFn: HubSpotFetchFn) {}

  async detect(request: DetectRequest): Promise<DetectResponse> {
    const response = await this.fetchFn(`${NYMAI_API_URL}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-workspace-id': request.workspace_id,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.status}`);
    }

    return response.json() as Promise<DetectResponse>;
  }

  async redact(request: RedactRequest): Promise<RedactResponse> {
    const response = await this.fetchFn(`${NYMAI_API_URL}/api/redact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-workspace-id': request.workspace_id,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Redaction failed: ${response.status}`);
    }

    return response.json() as Promise<RedactResponse>;
  }
}
