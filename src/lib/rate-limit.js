import { LRUCache } from 'lru-cache';

export function rateLimit({ interval, uniqueTokenPerInterval = 500 }) {
  const tokenCache = new LRUCache({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    check: (limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || [0])[0];
        
        if (tokenCount >= limit) {
          reject();
          return;
        }

        tokenCache.set(token, [tokenCount + 1]);
        resolve();
      }),
  };
} 