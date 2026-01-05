import { HUBSPOT_API_URL, ACTIVITY_CONFIG, MAX_ACTIVITIES_PER_SCAN } from '../lib/constants';
import { getObjectTypeForApi } from '../lib/utils';
import type { Activity, ActivityType, HubSpotFetchFn } from '../types';

interface AssociationResult {
  toObjectId: string;
}

interface BatchReadResult {
  id: string;
  properties: Record<string, string>;
}

export class HubSpotAPIClient {
  constructor(private fetchFn: HubSpotFetchFn) {}

  async getActivities(objectId: string, objectType: string): Promise<Activity[]> {
    const apiObjectType = getObjectTypeForApi(objectType);
    const activityTypes: ActivityType[] = ['note', 'email', 'call'];

    const fetchPromises = activityTypes.map((type) =>
      this.fetchActivitiesOfType(objectId, apiObjectType, type)
    );

    const results = await Promise.all(fetchPromises);
    return results.flat();
  }

  private async fetchActivitiesOfType(
    objectId: string,
    apiObjectType: string,
    activityType: ActivityType
  ): Promise<Activity[]> {
    try {
      const config = ACTIVITY_CONFIG[activityType];
      const ids = await this.getAssociatedIds(objectId, apiObjectType, config.pluralName);

      if (ids.length === 0) return [];

      const limitedIds = ids.slice(0, MAX_ACTIVITIES_PER_SCAN);
      return this.batchReadActivities(limitedIds, activityType, config);
    } catch (error) {
      console.error(`Failed to fetch ${activityType}s:`, error);
      return [];
    }
  }

  private async getAssociatedIds(
    objectId: string,
    objectType: string,
    activityPluralName: string
  ): Promise<string[]> {
    const response = await this.fetchFn(
      `${HUBSPOT_API_URL}/crm/v4/objects/${objectType}/${objectId}/associations/${activityPluralName}`
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { results?: AssociationResult[] };
    return (data.results || []).map((r) => r.toObjectId);
  }

  private async batchReadActivities(
    ids: string[],
    activityType: ActivityType,
    config: (typeof ACTIVITY_CONFIG)[ActivityType]
  ): Promise<Activity[]> {
    const properties = [config.textProperty, 'hs_timestamp'];

    const response = await this.fetchFn(
      `${HUBSPOT_API_URL}/crm/v3/objects/${config.pluralName}/batch/read`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: ids.map((id) => ({ id })),
          properties,
        }),
      }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { results?: BatchReadResult[] };
    return (data.results || [])
      .filter((r) => r.properties?.[config.textProperty])
      .map((r) => ({
        id: r.id,
        type: activityType,
        text: r.properties[config.textProperty],
        timestamp: r.properties.hs_timestamp || '',
      }));
  }

  async updateActivity(
    activityId: string,
    activityType: ActivityType,
    newText: string
  ): Promise<void> {
    const config = ACTIVITY_CONFIG[activityType];

    const properties: Record<string, string> = {
      [config.textProperty]: newText,
    };

    if (activityType === 'email' && 'htmlProperty' in config) {
      properties[config.htmlProperty] = `<div>${newText.replace(/\n/g, '<br>')}</div>`;
    }

    const response = await this.fetchFn(
      `${HUBSPOT_API_URL}/crm/v3/objects/${config.pluralName}/${activityId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update ${activityType}: ${response.status}`);
    }
  }
}
