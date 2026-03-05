import Redis from "ioredis";

// Centralized Redis Client
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(process.env.REDIS_URL || "redis://localhost:6379");

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function getCached<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
        return JSON.parse(data) as T;
    } catch (err) {
        console.error(`Failed to parse cached data for key \${key}`, err);
        return null;
    }
}

export async function setCached(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function invalidateCache(key: string): Promise<void> {
    await redis.del(key);
}
