import { getAuthorizationHeader } from './googleAuth';
import { config } from './env';

// Types for GA4 API responses
interface GA4Dimension {
	name: string;
	value: string;
}

interface GA4Metric {
	name: string;
	value: string;
}

interface GA4Row {
	dimensionValues: GA4Dimension[];
	metricValues: GA4Metric[];
}

interface GA4Response {
	rows: GA4Row[];
	dimensionHeaders: Array<{ name: string }>;
	metricHeaders: Array<{ name: string }>;
}

interface PageResult {
	pagePath: string;
	sessions: number;
	engagedSessions: number;
	averageSessionDuration: number;
	conversions: number;
}

interface DailyPageResult {
	date: string;
	pagePath: string;
	sessions: number;
	engagedSessions: number;
	averageSessionDuration: number;
	conversions: number;
}

/**
 * Make authenticated request to Google Analytics 4 API
 */
async function makeGA4Request(body: any): Promise<any> {
	const authorization = await getAuthorizationHeader();
	const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.ga4PropertyId}:runReport`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: authorization,
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

/**
 * Get pages aggregate data from GA4
 */
export async function getPagesAggregate({ startDate, endDate }: { startDate: string; endDate: string }): Promise<PageResult[]> {
	try {
		const body = {
			dateRanges: [{ startDate, endDate }],
			dimensions: [{ name: 'pagePath' }],
			metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }, { name: 'conversions' }],
			limit: '100000',
		};

		const response: GA4Response = await makeGA4Request(body);

		if (!response.rows) {
			return [];
		}

		// Map response rows to our format, converting string values to numbers
		return response.rows.map((row) => {
			const metrics = row.metricValues.reduce((acc, metric) => {
				acc[metric.name] = parseFloat(metric.value) || 0;
				return acc;
			}, {} as Record<string, number>);

			return {
				pagePath: row.dimensionValues[0]?.value || '',
				sessions: metrics.sessions || 0,
				engagedSessions: metrics.engagedSessions || 0,
				averageSessionDuration: metrics.averageSessionDuration || 0,
				conversions: metrics.conversions || 0,
			};
		});
	} catch (error) {
		console.error('Error fetching pages aggregate from GA4:', error);
		throw error;
	}
}

/**
 * Get pages data by day from GA4
 */
export async function getPagesByDay({ startDate, endDate, limit = 100000 }: { startDate: string; endDate: string; limit?: number }): Promise<DailyPageResult[]> {
	try {
		const body = {
			dateRanges: [{ startDate, endDate }],
			dimensions: [{ name: 'date' }, { name: 'pagePath' }],
			metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }, { name: 'conversions' }],
			limit: limit.toString(),
		};

		const response: GA4Response = await makeGA4Request(body);

		if (!response.rows) {
			return [];
		}

		// Map response rows to our format, converting string values to numbers
		return response.rows.map((row) => {
			const metrics = row.metricValues.reduce((acc, metric) => {
				acc[metric.name] = parseFloat(metric.value) || 0;
				return acc;
			}, {} as Record<string, number>);

			return {
				date: row.dimensionValues[0]?.value || '',
				pagePath: row.dimensionValues[1]?.value || '',
				sessions: metrics.sessions || 0,
				engagedSessions: metrics.engagedSessions || 0,
				averageSessionDuration: metrics.averageSessionDuration || 0,
				conversions: metrics.conversions || 0,
			};
		});
	} catch (error) {
		console.error('Error fetching pages by day from GA4:', error);
		throw error;
	}
}

/**
 * Get overall site metrics from GA4
 */
export async function getSiteMetrics({ startDate, endDate }: { startDate: string; endDate: string }): Promise<{
	totalSessions: number;
	totalEngagedSessions: number;
	averageSessionDuration: number;
	totalConversions: number;
	bounceRate: number;
}> {
	try {
		const body = {
			dateRanges: [{ startDate, endDate }],
			metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }, { name: 'conversions' }, { name: 'bounceRate' }],
		};

		const response: GA4Response = await makeGA4Request(body);

		if (!response.rows || response.rows.length === 0) {
			return {
				totalSessions: 0,
				totalEngagedSessions: 0,
				averageSessionDuration: 0,
				totalConversions: 0,
				bounceRate: 0,
			};
		}

		const row = response.rows[0];
		const metrics = row.metricValues.reduce((acc, metric) => {
			acc[metric.name] = parseFloat(metric.value) || 0;
			return acc;
		}, {} as Record<string, number>);

		return {
			totalSessions: metrics.sessions || 0,
			totalEngagedSessions: metrics.engagedSessions || 0,
			averageSessionDuration: metrics.averageSessionDuration || 0,
			totalConversions: metrics.conversions || 0,
			bounceRate: metrics.bounceRate || 0,
		};
	} catch (error) {
		console.error('Error fetching site metrics from GA4:', error);
		throw error;
	}
}
