import { getAuthorizationHeader, getServiceConfig } from './auth';

async function makeRequest(body: any) {
  const { mode, ga4PropertyId } = getServiceConfig();
  if (mode === 'mock') return { rows: [] };
  const authHeader = await getAuthorizationHeader();
  if (!authHeader) throw new Error('Auth unavailable');
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${ga4PropertyId}:runReport`;
  const res = await fetch(url, { method: 'POST', headers: { Authorization: authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GA4 error ${res.status}: ${await res.text()}`);
  return await res.json();
}

export async function getPagesAggregate(startDate: string, endDate: string) {
  const body = { dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }, { name: 'conversions' }], limit: '100000' };
  const data = await makeRequest(body);
  return (data.rows || []).map((row: any) => {
    const metrics = row.metricValues.reduce((acc: any, m: any) => { acc[m.name] = parseFloat(m.value) || 0; return acc; }, {});
    return { pagePath: row.dimensionValues[0]?.value || '', sessions: metrics.sessions || 0, engagedSessions: metrics.engagedSessions || 0, averageSessionDuration: metrics.averageSessionDuration || 0, conversions: metrics.conversions || 0 };
  });
}

export async function getSiteMetrics(startDate: string, endDate: string) {
  const body = { dateRanges: [{ startDate, endDate }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }, { name: 'conversions' }, { name: 'bounceRate' }] };
  const data = await makeRequest(body);
  if (!data.rows || data.rows.length === 0) return { totalSessions: 0, totalEngagedSessions: 0, averageSessionDuration: 0, totalConversions: 0, bounceRate: 0 };
  const row = data.rows[0];
  const metrics = row.metricValues.reduce((acc: any, m: any) => { acc[m.name] = parseFloat(m.value) || 0; return acc; }, {});
  return { totalSessions: metrics.sessions || 0, totalEngagedSessions: metrics.engagedSessions || 0, averageSessionDuration: metrics.averageSessionDuration || 0, totalConversions: metrics.conversions || 0, bounceRate: metrics.bounceRate || 0 };
}
