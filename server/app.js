const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

// Import real routes
const routes = require('./routes');

// Create Express app
const app = express();

// CORS Middleware - Allow all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Additional CORS middleware for extra compatibility
app.use(cors({
  origin: [
    'https://fundyboard.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'file://',
    '*'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Use real routes
app.use('/', routes);

// Configuration
const config = {
  siteUrl: process.env.GSC_SITE_URL || 'https://www.fundingagent.co.uk/',
  ga4PropertyId: process.env.GA4_PROPERTY_ID || '487607826',
  serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || './aqueous-walker-455614-m3-2ab00feb749f.json',
  // Environment variable credentials
  serviceAccount: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
  }
};

// Google Auth setup
let authClient = null;

async function initializeAuth() {
  try {
    let auth;
    
    // Try environment variables first
    if (config.serviceAccount.project_id && config.serviceAccount.private_key) {
      console.log('🔐 Using environment variable credentials...');
      auth = new GoogleAuth({
        credentials: config.serviceAccount,
        scopes: [
          'https://www.googleapis.com/auth/webmasters.readonly',
          'https://www.googleapis.com/auth/analytics.readonly',
        ],
      });
    } else {
      console.log('🔐 Using service account file...');
      auth = new GoogleAuth({
        keyFile: config.serviceAccountPath,
        scopes: [
          'https://www.googleapis.com/auth/webmasters.readonly',
          'https://www.googleapis.com/auth/analytics.readonly',
        ],
      });
    }
    
    authClient = await auth.getClient();
    console.log('✅ Google authentication initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Google authentication failed:', error.message);
    console.error('💡 Make sure your environment variables are set correctly');
    return false;
  }
}

// Real API functions
async function getGSCData(startDate, endDate, dimensions = ['date']) {
  if (!authClient) {
    throw new Error('Authentication not initialized');
  }

  const accessToken = await authClient.getAccessToken();
  const encodedSiteUrl = encodeURIComponent(config.siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;
  
  const body = {
    startDate,
    endDate,
    type: 'web',
    dimensions,
    rowLimit: 1000,
    dataState: 'final',
    orderBy: [{ field: 'impressions', descending: true }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GSC API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Get GSC data with page filter for specific page queries
async function getGSCDataWithPageFilter(startDate, endDate, targetPage) {
  if (!authClient) {
    throw new Error('Authentication not initialized');
  }

  const accessToken = await authClient.getAccessToken();
  const encodedSiteUrl = encodeURIComponent(config.siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;
  
  const body = {
    startDate,
    endDate,
    type: 'web',
    dimensions: ['query', 'page'],
    rowLimit: 1000,
    dataState: 'final',
    orderBy: [{ field: 'impressions', descending: true }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GSC API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Filter results to only include the target page
  if (data.rows) {
    data.rows = data.rows.filter(row => {
      const pageUrl = row.keys[1]; // page is the second dimension
      return pageUrl === targetPage || pageUrl.includes(targetPage) || targetPage.includes(pageUrl);
    });
  }
  
  return data;
}

async function getGA4Data(startDate, endDate) {
  if (!authClient) {
    throw new Error('Authentication not initialized');
  }

  const accessToken = await authClient.getAccessToken();
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.ga4PropertyId}:runReport`;
  
  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'averageSessionDuration' },
      { name: 'conversions' }
    ],
    limit: '10000'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GA4 API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Mock data fallback
const mockGSCData = {
  topPages: [
    { page: '/', clicks: 1250, impressions: 15000, ctr: 0.083, position: 2.1 },
    { page: '/about', clicks: 890, impressions: 12000, ctr: 0.074, position: 3.2 },
    { page: '/services', clicks: 650, impressions: 8500, ctr: 0.076, position: 4.1 },
    { page: '/contact', clicks: 420, impressions: 6000, ctr: 0.070, position: 5.3 }
  ],
  dailyData: [
    { date: '2024-10-01', clicks: 45, impressions: 1200, ctr: 0.037, position: 3.2 },
    { date: '2024-10-02', clicks: 52, impressions: 1350, ctr: 0.038, position: 3.1 },
    { date: '2024-10-03', clicks: 48, impressions: 1280, ctr: 0.037, position: 3.3 },
    { date: '2024-10-04', clicks: 55, impressions: 1420, ctr: 0.039, position: 3.0 },
    { date: '2024-10-05', clicks: 49, impressions: 1310, ctr: 0.037, position: 3.2 }
  ]
};

const mockGA4Data = {
  pages: [
    { pagePath: '/', sessions: 1250, engagedSessions: 890, averageSessionDuration: 145, conversions: 25 },
    { pagePath: '/about', sessions: 890, engagedSessions: 650, averageSessionDuration: 120, conversions: 15 },
    { pagePath: '/services', sessions: 650, engagedSessions: 480, averageSessionDuration: 180, conversions: 35 },
    { pagePath: '/contact', sessions: 420, engagedSessions: 320, averageSessionDuration: 95, conversions: 8 }
  ],
  metrics: {
    totalSessions: 3210,
    totalEngagedSessions: 2340,
    averageSessionDuration: 135,
    totalConversions: 83,
    bounceRate: 0.28
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    mode: authClient ? 'real' : 'mock',
    timestamp: new Date().toISOString()
  });
});

// All API endpoints are now handled by the real routes in ./src/routes.ts

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  // Initialize authentication
  console.log('🔐 Initializing Google authentication...');
  const authSuccess = await initializeAuth();
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Analytics Dashboard Backend running on port ${PORT}`);
    console.log(`📊 Mode: ${authSuccess ? 'Real APIs' : 'Mock data (fallback)'}`);
    console.log(`🔗 CORS enabled for localhost`);
    console.log(`🌐 GSC Site URL: ${config.siteUrl}`);
    console.log(`📈 GA4 Property ID: ${config.ga4PropertyId}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET  /health                    - Health check`);
    console.log(`  GET  /api/gsc/top              - Top pages from GSC`);
    console.log(`  GET  /api/gsc/queries          - Top queries for a page`);
    console.log(`  GET  /api/gsc/daily            - Daily search data`);
    console.log(`  GET  /api/ga4/pages            - GA4 pages aggregate`);
    console.log(`  GET  /api/ga4/metrics           - GA4 site metrics`);
    console.log(`  GET  /api/scoreboard           - Update priority scoreboard`);
    console.log(`  POST /api/cache/clear          - Clear cache`);
    console.log(`  GET  /api/cache/stats          - Cache statistics`);
    console.log('');
    console.log('Example requests:');
    console.log(`  curl http://localhost:${PORT}/health`);
    console.log(`  curl "http://localhost:${PORT}/api/gsc/top?limit=50"`);
    console.log(`  curl "http://localhost:${PORT}/api/ga4/pages"`);
  });

  return server;
}

startServer().then(server => {
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

module.exports = app;
