import { Redis } from "@upstash/redis";

let memoryStorage = {};
let redis = null;

// Initialize Redis if credentials exist
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("✅ Redis connected");
  } catch (e) {
    console.error("❌ Redis error:", e.message);
    redis = null;
  }
}

export async function getScript(name) {
  if (!name) return null;
  
  try {
    if (redis) {
      const data = await redis.get(`script:${name}`);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.error("Redis get error:", e.message);
  }
  
  return memoryStorage[name] || null;
}

export async function addScript(name, data) {
  if (!name || !data) return;
  
  try {
    if (redis) {
      await redis.set(`script:${name}`, JSON.stringify(data), { ex: 86400 * 365 });
      console.log(`✅ Stored in Redis: ${name}`);
      return;
    }
  } catch (e) {
    console.error("Redis set error:", e.message);
  }
  
  memoryStorage[name] = data;
  console.log(`✅ Stored in memory: ${name}`);
}

export async function scriptExists(name) {
  if (!name) return false;
  
  try {
    if (redis) {
      return (await redis.exists(`script:${name}`)) === 1;
    }
  } catch (e) {
    console.error("Redis exists error:", e.message);
  }
  
  return name in memoryStorage;
}
