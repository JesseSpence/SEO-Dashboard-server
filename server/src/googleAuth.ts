import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { config } from './env';

/**
 * Get authenticated Google API client
 * Supports both service account and OAuth2 authentication
 */
export async function getAuthClient() {
	if (config.authMode === 'service-account') {
		return getServiceAccountClient();
	} else {
		return getOAuthClient();
	}
}

/**
 * Authenticate using service account credentials
 */
async function getServiceAccountClient() {
	try {
		const auth = new GoogleAuth({
			keyFile: config.serviceAccountPath,
			scopes: ['https://www.googleapis.com/auth/webmasters.readonly', 'https://www.googleapis.com/auth/analytics.readonly'],
		});

		const client = await auth.getClient();
		console.log('Service account authentication successful');
		return client;
	} catch (error) {
		console.error('Service account authentication failed:', error);
		throw new Error(`Service account authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Authenticate using OAuth2 credentials
 */
async function getOAuthClient() {
	try {
		const oauth2Client = new OAuth2Client(config.oauth.clientId, config.oauth.clientSecret, config.oauth.redirectUri);

		// Set credentials using refresh token
		oauth2Client.setCredentials({
			refresh_token: config.oauth.refreshToken,
		});

		console.log('OAuth2 authentication successful');
		return oauth2Client;
	} catch (error) {
		console.error('OAuth2 authentication failed:', error);
		throw new Error(`OAuth2 authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Get access token for making API requests
 */
export async function getAccessToken(): Promise<string> {
	// Use a single initialized client
	const client = await getAuthClient();

	if (config.authMode === 'service-account') {
		// Prefer client.getAccessToken() first – newer versions return {token:string} or string
		const maybeToken = await (client as GoogleAuth | OAuth2Client).getAccessToken();
		let token: string | undefined;
		if (typeof maybeToken === 'string') {
			token = maybeToken;
		} else if (maybeToken && typeof maybeToken === 'object' && 'token' in maybeToken) {
			token = (maybeToken as any).token;
		}
		if (!token) {
			throw new Error('Failed to obtain service account access token');
		}
		return token;
	} else {
		const oauth2Client = client as OAuth2Client;
		// Refresh if needed
		const { credentials } = await oauth2Client.refreshAccessToken();
		if (!credentials.access_token) {
			throw new Error('Failed to obtain OAuth access token');
		}
		return credentials.access_token;
	}
}

/**
 * Get ready Authorization header (Bearer token)
 */
export async function getAuthorizationHeader(): Promise<string> {
	const token = await getAccessToken();
	return `Bearer ${token}`;
}
