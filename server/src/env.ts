import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables (.env in current working directory)
const envPath = path.resolve(process.cwd(), '.env');
const dotenvResult = dotenv.config({ path: envPath });

if (process.env.DEBUG_ENV) {
	console.log('[env] Working directory:', process.cwd());
	console.log('[env] .env path resolved to:', envPath);
	console.log('[env] .env exists:', fs.existsSync(envPath));
	if (dotenvResult.error) {
		console.warn('[env] dotenv error:', dotenvResult.error.message);
	}
	// Show a sanitized snapshot of key variables
	const keysToShow = ['GOOGLE_APPLICATION_CREDENTIALS', 'GSC_SITE_URL', 'GA4_PROPERTY_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
	keysToShow.forEach((k) => {
		const raw = process.env[k];
		if (raw) {
			const clean = raw.trim();
			const display = clean.length > 24 ? clean.slice(0, 24) + '...' : clean;
			console.log(`[env] ${k}: present (${display})`);
		} else {
			console.log(`[env] ${k}: <missing>`);
		}
	});
}

// Validate required environment variables
function validateEnv() {
	const errors: string[] = [];

	// Check authentication mode
	const hasServiceAccount = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
	const hasOAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

	if (!hasServiceAccount && !hasOAuth) {
		errors.push('Either GOOGLE_APPLICATION_CREDENTIALS or OAuth credentials must be provided');
	}

	if (hasServiceAccount && hasOAuth) {
		console.warn('Both service account and OAuth credentials found. Using service account.');
	}

	// Required for both modes
	if (!process.env.GSC_SITE_URL) {
		errors.push('GSC_SITE_URL is required');
	}

	if (!process.env.GA4_PROPERTY_ID) {
		errors.push('GA4_PROPERTY_ID is required');
	}

	// Allow mock mode fallback if explicitly opted-in
	if (errors.length > 0) {
		if (process.env.ALLOW_MOCK === '1' || process.env.ALLOW_MOCK === 'true') {
			console.warn('[env] Fallback to mock mode due to missing env vars:\n' + errors.join('\n'));
			return false; // signal validation not fully successful
		}
		throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
	}
	return true;
}

// Export configuration object
const validationOk = validateEnv();

export const config = {
	// Authentication mode (can be 'mock' if fallback triggered)
	authMode: validationOk ? (process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'service-account' : 'oauth') : ('mock' as 'service-account' | 'oauth' | 'mock'),

	// Service account config
	serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,

	// OAuth config (only used if authMode is 'oauth')
	oauth: {
		clientId: process.env.GOOGLE_CLIENT_ID || '',
		clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
		redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback',
	},

	// API configuration
	siteUrl: process.env.GSC_SITE_URL || '',
	ga4PropertyId: process.env.GA4_PROPERTY_ID || '',

	// Server configuration
	port: parseInt(process.env.PORT || '3001', 10),
	cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '900', 10),
};

// (Validation already executed; result stored in validationOk)

// Log configuration (without secrets)
console.log('Configuration loaded:');
console.log(`- Auth mode: ${config.authMode}`);
console.log(`- GSC Site URL: ${config.siteUrl || '<none>'}`);
console.log(`- GA4 Property ID: ${config.ga4PropertyId || '<none>'}`);
console.log(`- Port: ${config.port}`);
console.log(`- Cache TTL: ${config.cacheTtlSeconds}s`);
if (config.authMode === 'mock') {
	console.warn('[env] Running in MOCK mode – real Google API calls will be skipped.');
}
