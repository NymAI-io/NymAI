import { Hono } from 'hono';
import { storeTokens, deleteTokens } from '../services/oauth-token';

const oauthRoute = new Hono();

interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

oauthRoute.get('/callback', async (c) => {
  const code = c.req.query('code');

  if (!code) {
    return c.json({ error: 'Missing authorization code' }, 400);
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('OAuth config missing');
    return c.json({ error: 'OAuth not configured' }, 500);
  }

  try {
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText.slice(0, 100));
      return c.json({ error: 'Failed to exchange authorization code' }, 400);
    }

    const tokens = (await tokenResponse.json()) as OAuthTokenResponse;

    const tokenInfoResponse = await fetch(
      `https://api.hubapi.com/oauth/v1/access-tokens/${tokens.access_token}`
    );

    if (!tokenInfoResponse.ok) {
      return c.json({ error: 'Failed to get token info' }, 400);
    }

    const tokenInfo = (await tokenInfoResponse.json()) as { hub_id: number };
    const portalId = String(tokenInfo.hub_id);

    await storeTokens(portalId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    });

    return c.redirect(`https://app.hubspot.com/contacts/${portalId}?nymai_installed=true`);
  } catch (error) {
    console.error('OAuth callback error:', (error as Error).message?.slice(0, 50));
    return c.json({ error: 'OAuth flow failed' }, 500);
  }
});

oauthRoute.post('/uninstall', async (c) => {
  try {
    const body = (await c.req.json()) as { portalId?: string };
    const portalId = body.portalId;

    if (!portalId) {
      return c.json({ error: 'Missing portalId' }, 400);
    }

    await deleteTokens(portalId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Uninstall error:', (error as Error).message?.slice(0, 50));
    return c.json({ error: 'Uninstall failed' }, 500);
  }
});

oauthRoute.get('/install', async (c) => {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  const scopes = [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.companies.read',
    'crm.objects.companies.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write',
    'tickets',
  ].join(' ');

  if (!clientId || !redirectUri) {
    return c.json({ error: 'OAuth not configured' }, 500);
  }

  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

  return c.redirect(authUrl);
});

export default oauthRoute;
