import { getQueriesForPage } from '../../lib/gsc';
import { getDateRange } from '../../lib/transforms';
import { getServiceConfig } from '../../lib/auth';
import { getCached, setCached } from '../../lib/cache';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const page = query.page as string;
	const limit = parseInt((query.limit as string) || '50', 10);
	const start = query.start as string;
	const end = query.end as string;
	const { startDate, endDate } = start && end ? { startDate: start, endDate: end } : getDateRange(28);
	const { mode } = getServiceConfig();
	if (!page) {
		return sendError(event, createError({ statusCode: 400, statusMessage: 'Missing page parameter' }));
	}
	if (mode === 'mock') {
		return [];
	}
	try {
		const cfg: any = useRuntimeConfig();
		const ttl = cfg.cacheTtlSeconds || 900;
		const cacheKey = `gsc:queries:${page}:${startDate}:${endDate}:${limit}`;
		const cached = getCached<any[]>(cacheKey);
		if (cached) return cached.slice(0, limit);
		const rows = await getQueriesForPage(startDate, endDate, page, limit);
		setCached(cacheKey, rows, ttl);
		return rows.slice(0, limit);
	} catch (e: any) {
		return sendError(event, createError({ statusCode: 500, statusMessage: e.message }));
	}
});
