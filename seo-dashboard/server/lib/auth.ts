import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { useRuntimeConfig } from '#imports';

interface AuthModeConfig {
  mode: 'service-account' | 'oauth' | 'mock';
  siteUrl: string;
  ga4PropertyId: string;
}

function getAuthMode(): AuthModeConfig {
  const config: any = useRuntimeConfig();
  const siteUrl: string = (config.public?.gscSiteUrl as string) || '';
  const ga4PropertyId: string = (config.public?.ga4PropertyId as string) || '';
  const hasService = !!config.googleApplicationCredentials;
  const hasOAuth = !!(config.oauthClientId && config.oauthClientSecret && config.oauthRefreshToken);
  const mode: AuthModeConfig['mode'] = hasService ? 'service-account' : hasOAuth ? 'oauth' : 'mock';
  return { mode, siteUrl, ga4PropertyId };
}

export async function getAuthClient() {
  const config: any = useRuntimeConfig();
  const { mode } = getAuthMode();
  if (mode === 'mock') return null;

  if (mode === 'service-account') {
    const keyFile: string | undefined = config.googleApplicationCredentials;
    const auth = new GoogleAuth({
      ...(keyFile ? { keyFile } : {}),
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/analytics.readonly'
      ]
    });
    return await auth.getClient();
  }

  const oauth2Client = new OAuth2Client(
    config.oauthClientId,
    config.oauthClientSecret,
    config.oauthRedirectUri || 'http://localhost:3000/oauth2callback'
  );
  oauth2Client.setCredentials({ refresh_token: config.oauthRefreshToken });
  return oauth2Client;
}

export async function getAccessToken(): Promise<string | null> {
  const client = await getAuthClient();
  if (!client) return null;
  const maybe = await (client as any).getAccessToken();
  if (typeof maybe === 'string') return maybe;
  if (maybe && maybe.token) return maybe.token;
  return null;
}

export async function getAuthorizationHeader(): Promise<string | null> {
  const token = await getAccessToken();
  return token ? `Bearer ${token}` : null;
}

export function getServiceConfig() {
  return getAuthMode();
}
