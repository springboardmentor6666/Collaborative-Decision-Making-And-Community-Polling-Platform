/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: queryCache.js
 * Architecture Tier: Utility / State Management Layer
 * Path: frontend/src/utils/queryCache.js
 *
 * Purpose:
 *   Provides in-memory caching and Stale-While-Revalidate (SWR) mechanics for frontend data.
 *   Prevents repeated full-page loading spinners across route navigations while keeping
 *   data fresh via silent background refetches.
 */

// In-memory store: Map<string, { data: any, timestamp: number }>
const cacheStore = new Map();

/**
 * Serializes query keys (string, array, or object) into a deterministic cache key string.
 */
export function serializeKey(key) {
  if (Array.isArray(key)) {
    return key
      .map((part) => (typeof part === 'object' && part !== null ? JSON.stringify(part) : String(part)))
      .join('::');
  }
  return String(key);
}

/**
 * Returns cached data for a key, or undefined if not found.
 */
export function getQueryData(key) {
  const serialized = serializeKey(key);
  const entry = cacheStore.get(serialized);
  return entry ? entry.data : undefined;
}

/**
 * Returns full cache entry with timestamp and data.
 */
export function getQueryEntry(key) {
  const serialized = serializeKey(key);
  return cacheStore.get(serialized);
}

/**
 * Sets data into the cache with the current timestamp.
 */
export function setQueryData(key, data) {
  const serialized = serializeKey(key);
  cacheStore.set(serialized, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Invalidates cache entries matching a key or prefix. If no key is passed, clears the entire cache.
 */
export function invalidateQueries(keyOrPrefix) {
  if (!keyOrPrefix) {
    cacheStore.clear();
    return;
  }
  const prefix = serializeKey(keyOrPrefix);
  for (const k of cacheStore.keys()) {
    if (k === prefix || k.startsWith(`${prefix}::`) || k.startsWith(prefix)) {
      cacheStore.delete(k);
    }
  }
}

/**
 * Clears the entire cache store.
 */
export function clearCache() {
  cacheStore.clear();
}

// Automatically clear / invalidate cache on global refresh events
if (typeof window !== 'undefined') {
  window.addEventListener('decisionhub:refresh', () => {
    cacheStore.clear();
  });
}
