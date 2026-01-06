import { Hono } from 'hono';
import { Client } from '@hubspot/api-client';

const hubspotRoute = new Hono();

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
  activityId: string;
  activityType: ActivityType;
  newText: string;
}

function getHubSpotClient(): Client {
  const accessToken = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!accessToken) {
    throw new Error('HUBSPOT_PRIVATE_APP_TOKEN not configured');
  }
  return new Client({ accessToken });
}

hubspotRoute.post('/activities', async (c) => {
  try {
    const body = await c.req.json<GetActivitiesRequest>();
    const { objectId, objectType } = body;

    if (!objectId || !objectType) {
      return c.json({ error: 'Missing objectId or objectType' }, 400);
    }

    const client = getHubSpotClient();
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
    const activityId = c.req.param('activityId');
    const body = await c.req.json<UpdateActivityRequest>();
    const { activityType, newText } = body;

    if (!activityId || !activityType || !newText) {
      return c.json({ error: 'Missing required parameters', success: false }, 400);
    }

    const config = ACTIVITY_CONFIG[activityType];
    if (!config) {
      return c.json({ error: 'Invalid activity type', success: false }, 400);
    }

    const client = getHubSpotClient();

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
