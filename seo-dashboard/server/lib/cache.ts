interface CacheEntry<T> {
	data: T;
	expiresAt: number;
}
const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | undefined {
	const entry = cache.get(key);
	if (!entry) return undefined;
	if (entry.expiresAt < Date.now()) {
		cache.delete(key);
		return undefined;
	}
	return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlSeconds: number) {
	cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function clearCache() {
	cache.clear();
}

export function cacheStats() {
	const now = Date.now();
	let total = 0,
		valid = 0,
		expired = 0;
	for (const [, entry] of cache) {
		total++;
		if (entry.expiresAt > now) valid++;
		else expired++;
	}
	return { totalEntries: total, validEntries: valid, expiredEntries: expired };
}
