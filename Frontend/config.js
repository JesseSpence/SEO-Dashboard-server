// Google Search Console API Configuration
const GSC_CONFIG = {
    // Service account credentials should be loaded from environment variables
    // or a secure configuration file that is not committed to version control
    serviceAccount: {
        // These values should be loaded from environment variables
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID || "your-project-id",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "your-private-key-id",
        private_key: process.env.GOOGLE_PRIVATE_KEY || "your-private-key",
        client_email: process.env.GOOGLE_CLIENT_EMAIL || "your-client-email",
        client_id: process.env.GOOGLE_CLIENT_ID || "your-client-id",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL || "your-client-x509-cert-url"
    },
    
    // Your website URL (must be verified in GSC)
    siteUrl: "https://www.fundingagent.co.uk/",
    
    // API Configuration
    apiVersion: "v1",
    baseUrl: "https://www.googleapis.com/webmasters/v3",
    
    // Request limits and timeouts
    requestTimeout: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    
    // Date range limits
    maxDays: 90, // Maximum days for data requests
    defaultDays: 30 // Default date range
};

// Alternative: OAuth2 Configuration (for user authentication)
const OAUTH_CONFIG = {
    clientId: "your-oauth-client-id",
    redirectUri: window.location.origin + "/oauth-callback.html",
    scopes: [
        "https://www.googleapis.com/auth/webmasters.readonly"
    ],
    discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/webmasters/v3/rest"
    ]
};

// Export configuration
window.GSC_CONFIG = GSC_CONFIG;
window.OAUTH_CONFIG = OAUTH_CONFIG;

