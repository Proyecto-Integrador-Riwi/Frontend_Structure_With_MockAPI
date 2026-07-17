/** Cache en memoria con TTL configurable para datos que cambian poco (catalogos). */
const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

export async function getCached(key, fetcher, ttl = DEFAULT_TTL) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
}

export function clearCache(key) {
    if (key) cache.delete(key);
    else cache.clear();
}
