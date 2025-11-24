import { Redis } from "@upstash/redis";

// In-memory fallback for local development
let memoryStorage = {};
let redis = null;
let redisInitialized = false;

function initRedis() {
  if (redisInitialized) return;
  redisInitialized = true;

  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log("✅ Redis initialized");
    } else {
      console.log("⚠️ Redis credentials not found, using memory storage");
    }
  } catch (e) {
    console.error("❌ Redis init error:", e.message);
  }
}

export async function getScript(name) {
  initRedis();
  
  if (redis) {
    try {
      const data = await redis.get(`script:${name}`);
      if (data) {
        console.log(`📖 Retrieved from Redis: ${name}`);
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("❌ Redis get error:", e.message);
    }
  }
  return memoryStorage[name] || null;
}

export async function addScript(name, data) {
  initRedis();
  
  if (redis) {
    try {
      await redis.set(`script:${name}`, JSON.stringify(data));
      console.log(`📦 Stored in Redis: ${name}`);
      return;
    } catch (e) {
      console.error("❌ Redis set error:", e.message);
    }
  }
  memoryStorage[name] = data;
  console.log(`📦 Stored in memory: ${name}`);
}

export async function scriptExists(name) {
  initRedis();
  
  if (redis) {
    try {
      const exists = await redis.exists(`script:${name}`);
      return exists === 1;
    } catch (e) {
      console.error("❌ Redis exists error:", e.message);
      return name in memoryStorage;
    }
  }
  return name in memoryStorage;
}
