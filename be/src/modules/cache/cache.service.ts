import { env } from "../../shared/config/env.js";
import { redisClient } from "../../shared/infra/redis.js";

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = env.CACHE_TTL_SECONDS) {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(...keys: string[]) {
    if (keys.length === 0) {
      return;
    }
    await redisClient.del(...keys);
  }
}

export const cacheService = new CacheService();
