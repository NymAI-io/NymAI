import { getObjectTypeForApi } from '../lib/utils';
import type { Activity, ActivityType, HubSpotFetchFn } from '../types';

const NYMAI_API_URL = 'https://nymai-api-dnthb.ondigitalocean.app';

interface GetActivitiesResponse {
  activities: Activity[];
}

interface UpdateActivityResponse {
  success: boolean;
  error?: string;
}

export class HubSpotAPIClient {
  constructor(private fetchFn: HubSpotFetchFn) {}

  async getActivities(objectId: string, objectType: string): Promise<Activity[]> {
    const apiObjectType = getObjectTypeForApi(objectType);

    try {
      const response = await this.fetchFn(`${NYMAI_API_URL}/hubspot/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectId, objectType: apiObjectType }),
      });

      if (!response.ok) {
        console.error('[NymAI] Failed to get activities:', response.status);
        return [];
      }

      const data: GetActivitiesResponse = await response.json();
      return data.activities || [];
    } catch (error) {
      console.error('[NymAI] Failed to get activities:', error);
      return [];
    }
  }

  async updateActivity(
    activityId: string,
    activityType: ActivityType,
    newText: string
  ): Promise<void> {
    const response = await this.fetchFn(`${NYMAI_API_URL}/hubspot/activities/${activityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityType, newText }),
    });

    if (!response.ok) {
      const data: UpdateActivityResponse = await response.json();
      throw new Error(data.error || `Failed to update ${activityType}`);
    }
  }
}
