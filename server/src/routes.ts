import express from 'express';
import { getTopPages, getTopQueriesForPage, getDailySearchData } from './gscClient';
import { getPagesAggregate, getPagesByDay, getSiteMetrics } from './ga4Client';
import { computeUpdatePriority, getDateRange, normalizePagePath } from './transforms';
import { config } from './env';

const router = express.Router();

// In-memory cache
const cache = new Map<string, { data: any; expiresAt: number }>();

/**
 * Get cached data or execute function and cache result
 */
async function getCachedData<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = config.cacheTtlSeconds): Promise<T> {
	const cached = cache.get(key);
	const now = Date.now();

	if (cached && cached.expiresAt > now) {
		console.log(`Cache hit for key: ${key}`);
		return cached.data;
	}

	console.log(`Cache miss for key: ${key}, fetching data...`);
	const data = await fetcher();

	cache.set(key, {
		data,
		expiresAt: now + ttlSeconds * 1000,
	});

	return data;
}

/**
 * Validate and parse query parameters
 */
function parseQueryParams(req: express.Request) {
	const { start, end, limit, page } = req.query;

	// Default to 28 days if no dates provided
	const defaultRange = getDateRange(28);

	const startDate = (start as string) || defaultRange.startDate;
	const endDate = (end as string) || defaultRange.endDate;
	const limitNum = limit ? Math.min(parseInt(limit as string, 10), 5000) : 200;

	// Validate dates
	const startDateObj = new Date(startDate);
	const endDateObj = new Date(endDate);

	if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
		throw new Error('Invalid date format. Use YYYY-MM-DD');
	}

	if (startDateObj >= endDateObj) {
		throw new Error('Start date must be before end date');
	}

	return {
		startDate,
		endDate,
		limit: limitNum,
		page: page as string,
	};
}

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
	res.json({
		ok: true,
		mode: config.authMode,
		timestamp: new Date().toISOString(),
	});
});

/**
 * Health check alias under /api for consistency with other endpoints
 */
router.get('/api/health', (req, res) => {
	const memory = process.memoryUsage();
	res.json({
		ok: true,
		mode: config.authMode,
		timestamp: new Date().toISOString(),
		siteUrlConfigured: !!config.siteUrl,
		ga4PropertyConfigured: !!config.ga4PropertyId,
		cacheTtlSeconds: config.cacheTtlSeconds,
		memory: {
			rss: memory.rss,
			heapTotal: memory.heapTotal,
			heapUsed: memory.heapUsed,
		},
		uptimeSeconds: process.uptime(),
	});
});

/**
 * Get top pages from GSC
 * GET /api/gsc/top?start=2024-01-01&end=2024-01-31&limit=200
 */
router.get('/api/gsc/top', async (req, res) => {
	try {
		const { startDate, endDate, limit } = parseQueryParams(req);

		const cacheKey = `gsc-top-${startDate}-${endDate}-${limit}`;

		const data = await getCachedData(cacheKey, async () => {
			const pages = await getTopPages({ startDate, endDate, rowLimit: limit });

			// Sort by impressions descending and limit results
			return pages.sort((a, b) => b.impressions - a.impressions).slice(0, limit);
		});

		res.json(data);
	} catch (error) {
		console.error('Error in /api/gsc/top:', error);
		res.status(500).json({
			error: {
				code: 'GSC_TOP_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}
});

/**
 * Get top queries for a specific page from GSC
 * GET /api/gsc/queries?page=/some-page&start=2024-01-01&end=2024-01-31&limit=50
 */
router.get('/api/gsc/queries', async (req, res) => {
	try {
		const { startDate, endDate, limit, page } = parseQueryParams(req);

		if (!page) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PAGE_PARAM',
					message: 'Page parameter is required',
				},
			});
		}

		const cacheKey = `gsc-queries-${page}-${startDate}-${endDate}-${limit}`;

		const data = await getCachedData(cacheKey, async () => {
			const queries = await getTopQueriesForPage({
				startDate,
				endDate,
				pageUrl: page,
				rowLimit: limit,
			});

			// Sort by impressions descending and limit results
			return queries.sort((a, b) => b.impressions - a.impressions).slice(0, limit);
		});

		res.json(data);
	} catch (error) {
		console.error('Error in /api/gsc/queries:', error);
		res.status(500).json({
			error: {
				code: 'GSC_QUERIES_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}
});

/**
 * Get GA4 pages aggregate data
 * GET /api/ga4/pages?start=2024-01-01&end=2024-01-31
 */
router.get('/api/ga4/pages', async (req, res) => {
	try {
		const { startDate, endDate } = parseQueryParams(req);

		const cacheKey = `ga4-pages-${startDate}-${endDate}`;

		const data = await getCachedData(cacheKey, async () => {
			return await getPagesAggregate({ startDate, endDate });
		});

		res.json(data);
	} catch (error) {
		console.error('Error in /api/ga4/pages:', error);
		res.status(500).json({
			error: {
				code: 'GA4_PAGES_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}
});

/**
 * Get GA4 site metrics
 * GET /api/ga4/metrics?start=2024-01-01&end=2024-01-31
 */
router.get('/api/ga4/metrics', async (req, res) => {
	try {
		const { startDate, endDate } = parseQueryParams(req);

		const cacheKey = `ga4-metrics-${startDate}-${endDate}`;

		const data = await getCachedData(cacheKey, async () => {
			return await getSiteMetrics({ startDate, endDate });
		});

		res.json(data);
	} catch (error) {
		console.error('Error in /api/ga4/metrics:', error);
		res.status(500).json({
			error: {
				code: 'GA4_METRICS_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}
});

/**
 * Get daily search data from GSC
 * GET /api/gsc/daily?start=2024-01-01&end=2024-01-31
 */
router.get('/api/gsc/daily', async (req, res) => {
	try {
		const { startDate, endDate } = parseQueryParams(req);

		const cacheKey = `gsc-daily-${startDate}-${endDate}`;

		const data = await getCachedData(cacheKey, async () => {
			return await getDailySearchData({ startDate, endDate });
		});

		res.json(data);
	} catch (error) {
		console.error('Error in /api/gsc/daily:', error);
		res.status(500).json({
			error: {
				code: 'GSC_DAILY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}
});

/**
 * Get update priority scoreboard
 * GET /api/scoreboard?start=2024-01-01&end=2024-01-31
 */
router.get('/api/scoreboard', async (req, res) => {
	try {
		const { startDate, endDate } = parseQueryParams(req);

		const cacheKey = `scoreboard-${startDate}-${endDate}`;

		const data = await getCachedData(cacheKey, async () => {
			// Get data for current and previous periods
			const currentRange = { startDate, endDate };
			const previousRange = getDateRange(56); // 56 days ago to 28 days ago

			const [gscCurrent, ga4Current, gscPrevious, ga4Previous] = await Promise.all([getTopPages({ ...currentRange, rowLimit: 1000 }), getPagesAggregate(currentRange), getTopPages({ ...previousRange, rowLimit: 1000 }), getPagesAggregate(previousRange)]);

			// Normalize page paths for comparison
			const normalizedGscCurrent = gscCurrent.map((p) => ({ ...p, pagePath: normalizePagePath(p.page) }));
			const normalizedGa4Current = ga4Current.map((p) => ({ ...p, pagePath: normalizePagePath(p.pagePath) }));
			const normalizedGscPrevious = gscPrevious.map((p) => ({ ...p, pagePath: normalizePagePath(p.page) }));
			const normalizedGa4Previous = ga4Previous.map((p) => ({ ...p, pagePath: normalizePagePath(p.pagePath) }));

			// Compute update priorities
			const priorities = computeUpdatePriority(
				normalizedGscCurrent,
				normalizedGa4Current,
				[], // TODO: Implement rolling sums
				[]
			);

			return priorities.slice(0, 100); // Limit to top 100
		});

		res.json(data);
	} catch (error) {
		console.error('Error in /api/scoreboard:', error);
		res.status(500).json({
			error: {
				code: 'SCOREBOARD_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
		});
	}
});

/**
 * Clear cache endpoint (for development)
 */
router.post('/api/cache/clear', (req, res) => {
	cache.clear();
	res.json({ message: 'Cache cleared successfully' });
});

/**
 * Get cache stats (for monitoring)
 */
router.get('/api/cache/stats', (req, res) => {
	const now = Date.now();
	const entries = Array.from(cache.entries());
	const validEntries = entries.filter(([_, value]) => value.expiresAt > now);
	const expiredEntries = entries.filter(([_, value]) => value.expiresAt <= now);

	res.json({
		totalEntries: entries.length,
		validEntries: validEntries.length,
		expiredEntries: expiredEntries.length,
		cacheSize: JSON.stringify(Array.from(cache.values())).length,
	});
});

export default router;
