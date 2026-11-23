import { Redis } from "@upstash/redis";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, RateLimitBucket>();

let redisClient: Redis | null | undefined;

export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redisClient = new Redis({ url, token });
  } else {
    redisClient = null;
  }
  return redisClient;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAfterSeconds: number;
}

/**
 * Simple fixed-window rate limiter backed by Upstash Redis when configured,
 * with an automatic in-memory fallback for local development or single-instance deploys.
 */
export async function checkRateLimit(params: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = params;
  const redis = getRedisClient();

  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      const ttl = await redis.ttl(redisKey);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAfterSeconds: ttl > 0 ? ttl : windowSeconds,
      };
    } catch {
      // Fall through to in-memory limiter on transient Redis error
    }
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAfterSeconds: windowSeconds,
    };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
