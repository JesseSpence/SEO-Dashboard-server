import { getAccessToken } from './googleAuth';
import { config } from './env';

// Types for GSC API responses
interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCResponse {
  rows: GSCRow[];
  dimensionHeaders: Array<{ name: string }>;
}

interface TopPageResult {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TopQueryResult {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Make authenticated request to Google Search Console API
 */
async function makeGSCRequest(endpoint: string, body: any): Promise<any> {
  const accessToken = await getAccessToken();
  const url = `https://www.googleapis.com/webmasters/v3/${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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

/**
 * Get top pages from Google Search Console
 */
export async function getTopPages({
  startDate,
  endDate,
  rowLimit = 25000
}: {
  startDate: string;
  endDate: string;
  rowLimit?: number;
}): Promise<TopPageResult[]> {
  try {
    const encodedSiteUrl = encodeURIComponent(config.siteUrl);
    const endpoint = `sites/${encodedSiteUrl}/searchAnalytics/query`;
    
    const body = {
      startDate,
      endDate,
      type: 'web',
      dimensions: ['page'],
      rowLimit,
      dataState: 'final',
      orderBy: [{ field: 'impressions', descending: true }]
    };

    const response: GSCResponse = await makeGSCRequest(endpoint, body);
    
    if (!response.rows) {
      return [];
    }

    // Map response rows to our format
    return response.rows.map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));
  } catch (error) {
    console.error('Error fetching top pages from GSC:', error);
    throw error;
  }
}

/**
 * Get top queries for a specific page from Google Search Console
 */
export async function getTopQueriesForPage({
  startDate,
  endDate,
  pageUrl,
  rowLimit = 1000
}: {
  startDate: string;
  endDate: string;
  pageUrl: string;
  rowLimit?: number;
}): Promise<TopQueryResult[]> {
  try {
    const encodedSiteUrl = encodeURIComponent(config.siteUrl);
    const endpoint = `sites/${encodedSiteUrl}/searchAnalytics/query`;
    
    const body = {
      startDate,
      endDate,
      type: 'web',
      dimensions: ['query'],
      rowLimit,
      dataState: 'final',
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'equals',
              expression: pageUrl
            }
          ]
        }
      ],
      orderBy: [{ field: 'impressions', descending: true }]
    };

    const response: GSCResponse = await makeGSCRequest(endpoint, body);
    
    if (!response.rows) {
      return [];
    }

    // Map response rows to our format
    return response.rows.map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));
  } catch (error) {
    console.error('Error fetching queries for page from GSC:', error);
    throw error;
  }
}

/**
 * Get daily search analytics data
 */
export async function getDailySearchData({
  startDate,
  endDate
}: {
  startDate: string;
  endDate: string;
}): Promise<Array<{
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}>> {
  try {
    const encodedSiteUrl = encodeURIComponent(config.siteUrl);
    const endpoint = `sites/${encodedSiteUrl}/searchAnalytics/query`;
    
    const body = {
      startDate,
      endDate,
      type: 'web',
      dimensions: ['date'],
      rowLimit: 1000,
      dataState: 'final',
      orderBy: [{ field: 'date', descending: false }]
    };

    const response: GSCResponse = await makeGSCRequest(endpoint, body);
    
    if (!response.rows) {
      return [];
    }

    // Map response rows to our format
    return response.rows.map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));
  } catch (error) {
    console.error('Error fetching daily search data from GSC:', error);
    throw error;
  }
}

