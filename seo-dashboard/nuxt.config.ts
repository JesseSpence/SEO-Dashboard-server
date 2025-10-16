// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: { port: 3001 },
  runtimeConfig: {
    googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    oauthClientId: process.env.GOOGLE_CLIENT_ID,
    oauthClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    oauthRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    oauthRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '900', 10),
    public: {
      gscSiteUrl: process.env.GSC_SITE_URL,
      ga4PropertyId: process.env.GA4_PROPERTY_ID
    }
  }
})
