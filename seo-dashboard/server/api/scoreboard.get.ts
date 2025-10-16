import { getTopPages } from '../lib/gsc';
import { getPagesAggregate } from '../lib/ga4';
import { computeUpdatePriority, getDateRange, normalizePagePath } from '../lib/transforms';
import { getServiceConfig } from '../lib/auth';
import { getCached, setCached } from '../lib/cache';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const { mode } = getServiceConfig();
  if (mode === 'mock') return [];
  const { startDate, endDate } = getDateRange(28);
  const previousRange = getDateRange(56); // simplistic previous window
  try {
    const cfg: any = useRuntimeConfig();
    const ttl = cfg.cacheTtlSeconds || 900;
    const cacheKey = `scoreboard:${startDate}:${endDate}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return cached;
    const [gscCurrent, ga4Current, gscPrevious, ga4Previous] = await Promise.all([
      getTopPages(startDate, endDate, 1000),
      getPagesAggregate(startDate, endDate),
      getTopPages(previousRange.startDate, previousRange.endDate, 1000),
      getPagesAggregate(previousRange.startDate, previousRange.endDate)
    ]);
    const normGscCurrent = gscCurrent.map((p: any) => ({ ...p, pagePath: normalizePagePath(p.page) }));
    const normGa4Current = ga4Current.map((p: any) => ({ ...p, pagePath: normalizePagePath(p.pagePath) }));
    const priorities = computeUpdatePriority(normGscCurrent, normGa4Current);
    setCached(cacheKey, priorities, ttl);
    return priorities;
  } catch (e: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: e.message }));
  }
});
