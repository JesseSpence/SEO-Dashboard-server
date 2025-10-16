import { getPagesAggregate } from '../../lib/ga4';
import { getDateRange } from '../../lib/transforms';
import { getServiceConfig } from '../../lib/auth';
import { getCached, setCached } from '../../lib/cache';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const start = query.start as string;
  const end = query.end as string;
  const { startDate, endDate } = start && end ? { startDate: start, endDate: end } : getDateRange(28);
  const { mode } = getServiceConfig();
  if (mode === 'mock') return [];
  try {
    const cfg: any = useRuntimeConfig();
    const ttl = cfg.cacheTtlSeconds || 900;
    const cacheKey = `ga4:pages:${startDate}:${endDate}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;
    const rows = await getPagesAggregate(startDate, endDate);
    setCached(cacheKey, rows, ttl);
    return rows;
  } catch (e: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: e.message }));
  }
});
