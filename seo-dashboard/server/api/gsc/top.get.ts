import { getTopPages } from '../../lib/gsc';
import { getDateRange } from '../../lib/transforms';
import { getServiceConfig } from '../../lib/auth';
import { getCached, setCached } from '../../lib/cache';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const limit = parseInt((query.limit as string) || '200', 10);
	const start = query.start as string;
	const end = query.end as string;
	const { startDate, endDate } = start && end ? { startDate: start, endDate: end } : getDateRange(28);
	const { mode } = getServiceConfig();
	if (mode === 'mock') {
		return [];
	}
	try {
		const cfg: any = useRuntimeConfig();
		const ttl = cfg.cacheTtlSeconds || 900;
		const cacheKey = `gsc:top:${startDate}:${endDate}:${limit}`;
		const cached = getCached<any[]>(cacheKey);
		if (cached) return cached.slice(0, limit);
		const pages = await getTopPages(startDate, endDate, limit);
		setCached(cacheKey, pages, ttl);
		return pages.slice(0, limit);
	} catch (e: any) {
		return sendError(event, createError({ statusCode: 500, statusMessage: e.message }));
	}
});
