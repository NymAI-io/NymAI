import type { Activity, ActivityType, HubSpotFetchFn } from '../types';
import { NYMAI_API_URL } from '../lib/constants';

interface GetActivitiesResponse {
  activities: Activity[];
  error?: string;
}

/**
 * HubSpot API Client for UI Extensions (v2025.2+)
 *
 * IMPORTANT: hubspot.fetch() does NOT support custom headers.
 * Authentication is handled automatically via:
 * - X-HubSpot-Signature-v3 header (HMAC signature)
 * - X-HubSpot-Request-Timestamp header
 * - Query params: userId, portalId, userEmail, appId
 *
 * The backend verifies requests using signature verification.
 */
export class HubSpotAPIClient {
  constructor(
    private fetchFn: HubSpotFetchFn,
    private portalId: number
  ) {}

  async getActivities(objectId: string, objectType: string): Promise<Activity[]> {
    try {
      const url = `${NYMAI_API_URL}/hubspot/activities?portalId=${this.portalId}`;
      const response = await this.fetchFn(url, {
        method: 'POST',
        body: JSON.stringify({ objectId, objectType }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[NymAI] getActivities failed:', response.status, errorText.slice(0, 100));
        return [];
      }

      const data = (await response.json()) as GetActivitiesResponse;
      return data.activities || [];
    } catch (error) {
      console.error('[NymAI] getActivities error:', error);
      return [];
    }
  }

  async updateActivity(
    activityId: string,
    activityType: ActivityType,
    newText: string
  ): Promise<void> {
    try {
      const url = `${NYMAI_API_URL}/hubspot/activities/${activityId}?portalId=${this.portalId}`;
      const response = await this.fetchFn(url, {
        method: 'PATCH',
        body: JSON.stringify({ activityType, text: newText }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `Failed to update ${activityType}: ${response.status} - ${errorText.slice(0, 100)}`
        );
      }
    } catch (error) {
      console.error('[NymAI] updateActivity error:', error);
      throw error;
    }
  }
}
