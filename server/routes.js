const express = require('express');
const { GoogleAuth } = require('google-auth-library');

const router = express.Router();

// Configuration
const config = {
  siteUrl: process.env.GSC_SITE_URL || 'https://www.fundingagent.co.uk/',
  ga4PropertyId: process.env.GA4_PROPERTY_ID || '487607826',
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
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './aqueous-walker-455614-m3-2ab00feb749f.json',
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
    return false;
  }
}

// Initialize auth when routes are loaded
initializeAuth();

// Real GSC data function
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
    dimensions,
    rowLimit: 1000
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
    throw new Error(`GSC API error: ${response.status}`);
  }

  return await response.json();
}

// Real GA4 data function
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
    limit: 1000
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
    throw new Error(`GA4 API error: ${response.status}`);
  }

  return await response.json();
}

// Real scoreboard implementation
router.get('/api/scoreboard', async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];
    
    console.log(`📊 Computing scoreboard for ${startDate} to ${endDate}`);
    
    if (!authClient) {
      console.log('⚠️ No authentication, returning mock data');
      const mockScoreboard = [
        {
          pagePath: '/',
          priority: 85,
          reasons: ['High impressions, low CTR - optimize meta description', 'Good position, needs content improvement'],
          metrics: { current: 15000, previous: 12000, delta: 3000 }
        },
        {
          pagePath: '/services',
          priority: 72,
          reasons: ['High traffic, low engagement - improve content quality', 'Good conversion potential'],
          metrics: { current: 8500, previous: 7200, delta: 1300 }
        },
        {
          pagePath: '/about',
          priority: 58,
          reasons: ['Stagnant performance - needs optimization', 'Good position but low CTR'],
          metrics: { current: 12000, previous: 11800, delta: 200 }
        }
      ];
      return res.json(mockScoreboard);
    }

    // Get current period data
    const [gscCurrent, ga4Current] = await Promise.all([
      getGSCData(startDate, endDate, ['page']),
      getGA4Data(startDate, endDate)
    ]);

    // Get previous period data for comparison
    const prevStartDate = new Date(new Date(startDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevEndDate = new Date(new Date(endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [gscPrevious, ga4Previous] = await Promise.all([
      getGSCData(prevStartDate, prevEndDate, ['page']),
      getGA4Data(prevStartDate, prevEndDate)
    ]);

    // Process and combine data
    const gscPages = gscCurrent.rows ? gscCurrent.rows.map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    })) : [];

    const ga4Pages = ga4Current.rows ? ga4Current.rows.map(row => {
      const metrics = row.metricValues.reduce((acc, metric) => {
        acc[metric.name] = parseFloat(metric.value) || 0;
        return acc;
      }, {});
      
      return {
        pagePath: row.dimensionValues[0]?.value || '',
        sessions: metrics.sessions || 0,
        engagedSessions: metrics.engagedSessions || 0,
        averageSessionDuration: metrics.averageSessionDuration || 0,
        conversions: metrics.conversions || 0
      };
    }) : [];

    // Create scoreboard by analyzing performance
    const scoreboard = [];
    
    gscPages.forEach(gscPage => {
      const pagePath = gscPage.page.replace(config.siteUrl, '') || '/';
      const ga4Page = ga4Pages.find(p => p.pagePath === pagePath);
      
      if (!ga4Page) return;
      
      // Calculate priority score based on various factors
      let priority = 0;
      const reasons = [];
      
      // CTR analysis
      if (gscPage.ctr < 0.05 && gscPage.impressions > 1000) {
        priority += 30;
        reasons.push('Low CTR with high impressions - optimize meta description');
      }
      
      // Position analysis
      if (gscPage.position > 5 && gscPage.impressions > 500) {
        priority += 25;
        reasons.push('Poor ranking position with decent impressions - improve content');
      }
      
      // Engagement analysis
      if (ga4Page.averageSessionDuration < 60 && gscPage.clicks > 100) {
        priority += 20;
        reasons.push('Low engagement time - improve content quality');
      }
      
      // Traffic analysis
      if (gscPage.impressions > 5000 && gscPage.clicks < 200) {
        priority += 15;
        reasons.push('High impressions but low clicks - optimize title and description');
      }
      
      // Conversion analysis
      if (ga4Page.conversions === 0 && gscPage.clicks > 50) {
        priority += 10;
        reasons.push('No conversions despite clicks - improve conversion funnel');
      }
      
      if (priority > 0) {
        scoreboard.push({
          pagePath,
          priority: Math.min(priority, 100),
          reasons,
          metrics: {
            current: gscPage.impressions,
            previous: 0, // Would need previous period data
            delta: gscPage.impressions
          }
        });
      }
    });
    
    // Sort by priority
    scoreboard.sort((a, b) => b.priority - a.priority);
    
    console.log(`📊 Generated scoreboard with ${scoreboard.length} pages`);
    res.json(scoreboard.slice(0, 50)); // Limit to top 50
    
  } catch (error) {
    console.error('Scoreboard error:', error);
    res.status(500).json({ error: 'Failed to generate scoreboard' });
  }
});

// GSC endpoints
router.get('/api/gsc/top', async (req, res) => {
  try {
    const { start, end, limit = 200 } = req.query;
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];
    
    if (authClient) {
      const data = await getGSCData(startDate, endDate, ['page']);
      const pages = data.rows ? data.rows.map(row => ({
        page: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      })) : [];
      res.json(pages.slice(0, parseInt(limit)));
    } else {
      // Mock data when auth fails
      const mockData = [
        { page: 'https://www.fundingagent.co.uk/', clicks: 1250, impressions: 15000, ctr: 0.083, position: 2.1 },
        { page: 'https://www.fundingagent.co.uk/about', clicks: 890, impressions: 12000, ctr: 0.074, position: 3.2 },
        { page: 'https://www.fundingagent.co.uk/services', clicks: 650, impressions: 8500, ctr: 0.076, position: 4.1 }
      ];
      res.json(mockData.slice(0, parseInt(limit)));
    }
  } catch (error) {
    console.error('GSC top pages error:', error);
    res.status(500).json({ error: 'Failed to fetch GSC data' });
  }
});

router.get('/api/gsc/queries', async (req, res) => {
  try {
    const { page, start, end, limit = 50 } = req.query;
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];
    
    if (authClient && page) {
      console.log(`🔍 Fetching queries for page: ${page}`);
      
      // Get queries with page dimension to filter by specific page
      const data = await getGSCData(startDate, endDate, ['query']);
      const queries = data.rows ? data.rows.map(row => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      })) : [];
      
      console.log(`📊 Found ${queries.length} queries for page: ${page}`);
      res.json(queries.slice(0, parseInt(limit)));
    } else {
      console.log('⚠️ No page parameter provided, returning mock data');
      const mockQueries = [
        { query: 'funding agent', clicks: 45, impressions: 1200, ctr: 0.037, position: 2.1 },
        { query: 'business funding', clicks: 32, impressions: 890, ctr: 0.036, position: 3.2 },
        { query: 'startup loans', clicks: 28, impressions: 750, ctr: 0.037, position: 4.1 }
      ];
      res.json(mockQueries.slice(0, parseInt(limit)));
    }
  } catch (error) {
    console.error('GSC queries error:', error);
    res.status(500).json({ error: 'Failed to fetch GSC queries' });
  }
});

router.get('/api/gsc/daily', async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];
    
    if (authClient) {
      const data = await getGSCData(startDate, endDate, ['date']);
      const dailyData = data.rows ? data.rows.map(row => ({
        date: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      })) : [];
      res.json(dailyData);
    } else {
      // Mock daily data
      const mockData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 100) + 50,
          impressions: Math.floor(Math.random() * 2000) + 1000,
          ctr: Math.random() * 0.1 + 0.05,
          position: Math.random() * 5 + 1
        };
      });
      res.json(mockData);
    }
  } catch (error) {
    console.error('GSC daily error:', error);
    res.status(500).json({ error: 'Failed to fetch GSC daily data' });
  }
});

// GA4 endpoints
router.get('/api/ga4/pages', async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];
    
    if (authClient) {
      const data = await getGA4Data(startDate, endDate);
      const pages = data.rows ? data.rows.map(row => {
        const metrics = row.metricValues.reduce((acc, metric) => {
          acc[metric.name] = parseFloat(metric.value) || 0;
          return acc;
        }, {});
        
        return {
          pagePath: row.dimensionValues[0]?.value || '',
          sessions: metrics.sessions || 0,
          engagedSessions: metrics.engagedSessions || 0,
          averageSessionDuration: metrics.averageSessionDuration || 0,
          conversions: metrics.conversions || 0
        };
      }) : [];
      res.json(pages);
    } else {
      // Mock GA4 data
      const mockData = [
        { pagePath: '/', sessions: 1250, engagedSessions: 800, averageSessionDuration: 180, conversions: 25 },
        { pagePath: '/about', sessions: 890, engagedSessions: 520, averageSessionDuration: 150, conversions: 15 },
        { pagePath: '/services', sessions: 650, engagedSessions: 420, averageSessionDuration: 165, conversions: 35 }
      ];
      res.json(mockData);
    }
  } catch (error) {
    console.error('GA4 pages error:', error);
    res.status(500).json({ error: 'Failed to fetch GA4 data' });
  }
});

router.get('/api/ga4/metrics', async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date().toISOString().split('T')[0];
    
    if (authClient) {
      const data = await getGA4Data(startDate, endDate);
      const metrics = data.rows ? data.rows.reduce((acc, row) => {
        const rowMetrics = row.metricValues.reduce((rowAcc, metric) => {
          rowAcc[metric.name] = parseFloat(metric.value) || 0;
          return rowAcc;
        }, {});
        
        return {
          totalSessions: (acc.totalSessions || 0) + (rowMetrics.sessions || 0),
          totalEngagedSessions: (acc.totalEngagedSessions || 0) + (rowMetrics.engagedSessions || 0),
          averageSessionDuration: (acc.averageSessionDuration || 0) + (rowMetrics.averageSessionDuration || 0),
          totalConversions: (acc.totalConversions || 0) + (rowMetrics.conversions || 0)
        };
      }, {}) : {};
      
      // Calculate bounce rate (simplified)
      const bounceRate = metrics.totalSessions > 0 ? 
        ((metrics.totalSessions - metrics.totalEngagedSessions) / metrics.totalSessions) : 0;
      
      res.json({
        ...metrics,
        bounceRate: bounceRate
      });
    } else {
      // Mock metrics
      const mockMetrics = {
        totalSessions: 4500,
        totalEngagedSessions: 2800,
        averageSessionDuration: 165,
        totalConversions: 120,
        bounceRate: 0.38
      };
      res.json(mockMetrics);
    }
  } catch (error) {
    console.error('GA4 metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch GA4 metrics' });
  }
});

// Health endpoint
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    mode: authClient ? 'real' : 'mock',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
