import { Hono } from 'hono';
import { Client } from '@hubspot/api-client';
import { hubspotSignatureAuth, getRawBody } from '../middleware/auth';
import { getValidAccessToken } from '../services/oauth-token';

const hubspotRoute = new Hono();

hubspotRoute.use('*', hubspotSignatureAuth);

const ACTIVITY_CONFIG = {
  note: { pluralName: 'notes', textProperty: 'hs_note_body' },
  email: { pluralName: 'emails', textProperty: 'hs_email_text', htmlProperty: 'hs_email_html' },
  call: { pluralName: 'calls', textProperty: 'hs_call_body' },
} as const;

type ActivityType = keyof typeof ACTIVITY_CONFIG;

interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  timestamp: string;
}

interface GetActivitiesRequest {
  objectId: string;
  objectType: string;
}

interface UpdateActivityRequest {
  activityType: ActivityType;
  text: string;
}

function getPortalIdFromUrl(url: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('portalId');
}

async function getHubSpotClient(portalId: string): Promise<Client> {
  const accessToken = await getValidAccessToken(portalId);
  return new Client({ accessToken });
}

hubspotRoute.post('/activities', async (c) => {
  try {
    const portalId = getPortalIdFromUrl(c.req.url);
    if (!portalId) {
      return c.json({ error: 'Missing portalId query parameter', activities: [] }, 400);
    }

    const rawBody = getRawBody(c);
    const body: GetActivitiesRequest = JSON.parse(rawBody);
    const { objectId, objectType } = body;

    if (!objectId || !objectType) {
      return c.json({ error: 'Missing objectId or objectType', activities: [] }, 400);
    }

    const client = await getHubSpotClient(portalId);
    const activities: Activity[] = [];
    const activityTypes: ActivityType[] = ['note', 'email', 'call'];

    for (const activityType of activityTypes) {
      const config = ACTIVITY_CONFIG[activityType];

      try {
        const associationsResponse = await client.crm.associations.v4.basicApi.getPage(
          objectType,
          objectId,
          config.pluralName,
          undefined,
          100
        );

        const ids = (associationsResponse.results || []).map((r: { toObjectId: string }) =>
          r.toObjectId.toString()
        );
        if (ids.length === 0) continue;

        const limitedIds = ids.slice(0, 50);
        const batchResponse = await client.crm.objects.batchApi.read(config.pluralName, {
          inputs: limitedIds.map((id: string) => ({ id })),
          properties: [config.textProperty, 'hs_timestamp'],
          propertiesWithHistory: [],
        });

        for (const item of batchResponse.results || []) {
          const text = item.properties?.[config.textProperty];
          if (!text) continue;

          activities.push({
            id: item.id,
            type: activityType,
            text: text,
            timestamp: item.properties?.hs_timestamp || '',
          });
        }
      } catch (err) {
        console.error(`Failed to fetch ${activityType}:`, (err as Error).message?.slice(0, 50));
      }
    }

    return c.json({ activities });
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    console.error('HubSpot activities error:', message.slice(0, 50));
    return c.json({ error: message.slice(0, 100), activities: [] }, 500);
  }
});

hubspotRoute.patch('/activities/:activityId', async (c) => {
  try {
    const portalId = getPortalIdFromUrl(c.req.url);
    if (!portalId) {
      return c.json({ error: 'Missing portalId query parameter', success: false }, 400);
    }

    const activityId = c.req.param('activityId');
    const rawBody = getRawBody(c);
    const body: UpdateActivityRequest = JSON.parse(rawBody);
    const { activityType, text: newText } = body;

    if (!activityId || !activityType || !newText) {
      return c.json({ error: 'Missing required parameters', success: false }, 400);
    }

    const config = ACTIVITY_CONFIG[activityType];
    if (!config) {
      return c.json({ error: 'Invalid activity type', success: false }, 400);
    }

    const client = await getHubSpotClient(portalId);

    const properties: Record<string, string> = {
      [config.textProperty]: newText,
    };

    if (activityType === 'email' && 'htmlProperty' in config) {
      properties[config.htmlProperty] = `<div>${newText.replace(/\n/g, '<br>')}</div>`;
    }

    await client.crm.objects.basicApi.update(config.pluralName, activityId, { properties });

    return c.json({ success: true });
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    console.error('HubSpot update error:', message.slice(0, 50));
    return c.json({ error: message.slice(0, 100), success: false }, 500);
  }
});

export default hubspotRoute;
