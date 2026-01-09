import * as crypto from 'crypto';
import { getSupabaseClient } from '../db/client';
import type { OAuthToken, OAuthTokenInsert } from '../db/schema';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(ENCRYPTION_KEY, 'hex');
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export async function storeTokens(portalId: string, tokens: TokenData): Promise<void> {
  const supabase = getSupabaseClient();

  const record: OAuthTokenInsert = {
    portal_id: portalId,
    access_token_encrypted: encrypt(tokens.accessToken),
    refresh_token_encrypted: encrypt(tokens.refreshToken),
    expires_at: tokens.expiresAt.toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('oauth_tokens').upsert(record, { onConflict: 'portal_id' });

  if (error) {
    console.error('Failed to store tokens:', error.message?.slice(0, 50));
    throw new Error('Failed to store OAuth tokens');
  }
}

export async function getTokens(portalId: string): Promise<TokenData | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('portal_id', portalId)
    .single();

  if (error || !data) {
    return null;
  }

  const token = data as OAuthToken;

  return {
    accessToken: decrypt(token.access_token_encrypted),
    refreshToken: decrypt(token.refresh_token_encrypted),
    expiresAt: new Date(token.expires_at),
  };
}

export async function refreshAccessToken(portalId: string): Promise<string> {
  const tokens = await getTokens(portalId);
  if (!tokens) {
    throw new Error(`No tokens found for portal ${portalId}`);
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET required');
  }

  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Token refresh failed:', errorText.slice(0, 100));
    throw new Error('Failed to refresh access token');
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  await storeTokens(portalId, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  });

  return data.access_token;
}

export async function getValidAccessToken(portalId: string): Promise<string> {
  const tokens = await getTokens(portalId);
  if (!tokens) {
    throw new Error(`Portal ${portalId} not installed. Please install the app first.`);
  }

  const bufferMs = 5 * 60 * 1000;
  if (tokens.expiresAt.getTime() - bufferMs < Date.now()) {
    return refreshAccessToken(portalId);
  }

  return tokens.accessToken;
}

export async function deleteTokens(portalId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('oauth_tokens').delete().eq('portal_id', portalId);

  if (error) {
    console.error('Failed to delete tokens:', error.message?.slice(0, 50));
  }
}
