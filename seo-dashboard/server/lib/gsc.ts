import { getAuthorizationHeader, getServiceConfig } from './auth';
import { useRuntimeConfig } from '#imports';

async function makeRequest(body: any) {
  const { mode, siteUrl } = getServiceConfig();
  if (mode === 'mock') return { rows: [] };
  const config = useRuntimeConfig();
  const authHeader = await getAuthorizationHeader();
  if (!authHeader) throw new Error('Auth unavailable');
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GSC error ${res.status}: ${await res.text()}`);
  return await res.json();
}

export async function getTopPages(startDate: string, endDate: string, limit: number) {
  const body = { startDate, endDate, type: 'web', dimensions: ['page'], rowLimit: limit, dataState: 'final', orderBy: [{ field: 'impressions', descending: true }] };
  const data = await makeRequest(body);
  return (data.rows || []).map((r: any) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}

export async function getQueriesForPage(startDate: string, endDate: string, pageUrl: string, limit: number) {
  const body = { startDate, endDate, type: 'web', dimensions: ['query'], rowLimit: limit, dataState: 'final', dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: pageUrl }] }], orderBy: [{ field: 'impressions', descending: true }] };
  const data = await makeRequest(body);
  return (data.rows || []).map((r: any) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}

export async function getDaily(startDate: string, endDate: string) {
  const body = { startDate, endDate, type: 'web', dimensions: ['date'], rowLimit: 1000, dataState: 'final', orderBy: [{ field: 'date', descending: false }] };
  const data = await makeRequest(body);
  return (data.rows || []).map((r: any) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
}
