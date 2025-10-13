import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
}

// Export configuration object
export const config = {
  // Authentication mode
  authMode: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'service-account' : 'oauth' as 'service-account' | 'oauth',
  
  // Service account config
  serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // OAuth config (only used if authMode is 'oauth')
  oauth: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
  },
  
  // API configuration
  siteUrl: process.env.GSC_SITE_URL!,
  ga4PropertyId: process.env.GA4_PROPERTY_ID!,
  
  // Server configuration
  port: parseInt(process.env.PORT || '3001', 10),
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '900', 10)
};

// Validate environment on import
validateEnv();

// Log configuration (without secrets)
console.log('Configuration loaded:');
console.log(`- Auth mode: ${config.authMode}`);
console.log(`- GSC Site URL: ${config.siteUrl}`);
console.log(`- GA4 Property ID: ${config.ga4PropertyId}`);
console.log(`- Port: ${config.port}`);
console.log(`- Cache TTL: ${config.cacheTtlSeconds}s`);

