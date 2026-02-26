/**
 * Simple in-memory cache for AzuraCast data
 * TODO: Replace with Redis in production
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();
  private ttl: number = 60000; // 60 seconds default

  set(key: string, value: any, ttlSeconds?: number): void {
    const expiresAt = Date.now() + (ttlSeconds || this.ttl);
    this.store.set(key, { data: value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  clear(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  setTTL(seconds: number): void {
    this.ttl = seconds * 1000;
  }
}

export const cache = new Cache();
