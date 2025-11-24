import { Redis } from "@upstash/redis";

// In-memory fallback for local development
let memoryStorage = {};

// Try to use Upstash Redis in production
let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.log("Redis not configured, using memory storage");
}

export async function getScript(name) {
  if (redis) {
    try {
      const data = await redis.get(`script:${name}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Redis get error:", e);
      return memoryStorage[name] || null;
    }
  }
  return memoryStorage[name] || null;
}

export async function addScript(name, data) {
  if (redis) {
    try {
      await redis.set(`script:${name}`, JSON.stringify(data));
      console.log(`📦 Stored in Redis: ${name}`);
      return;
    } catch (e) {
      console.error("Redis set error:", e);
    }
  }
  memoryStorage[name] = data;
  console.log(`📦 Stored in memory: ${name}`);
}

export async function scriptExists(name) {
  if (redis) {
    try {
      const exists = await redis.exists(`script:${name}`);
      return exists === 1;
    } catch (e) {
      console.error("Redis exists error:", e);
      return name in memoryStorage;
    }
  }
  return name in memoryStorage;
}

export function getMemoryStorage() {
  return memoryStorage;
}
