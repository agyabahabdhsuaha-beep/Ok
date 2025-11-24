let memoryStorage = {};
let redis = null;

// Initialize Redis if credentials exist
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log("✅ Redis connected");
  }
} catch (e) {
  console.log("ℹ️ Using memory storage:", e.message);
  redis = null;
}

export async function getScript(name) {
  if (!name) return null;
  
  try {
    if (redis) {
      const data = await redis.get(`script:${name}`);
      if (data) return typeof data === 'string' ? JSON.parse(data) : data;
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

export async function getAllScripts() {
  const scripts = [];
  
  try {
    if (redis) {
      const keys = await redis.keys("script:*");
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          if (parsed.public) {
            const preview = parsed.content.replace(/\u200D/g, '').substring(0, 200);
            scripts.push({
              name: key.replace("script:", ""),
              username: parsed.username || "Anonymous",
              createdAt: parsed.createdAt,
              preview: preview
            });
          }
        }
      }
      return scripts;
    }
  } catch (e) {
    console.error("Redis getAllScripts error:", e.message);
  }
  
  for (const [name, data] of Object.entries(memoryStorage)) {
    if (data.public) {
      const preview = data.content.replace(/\u200D/g, '').substring(0, 200);
      scripts.push({
        name,
        username: data.username || "Anonymous",
        createdAt: data.createdAt,
        preview: preview
      });
    }
  }
  
  return scripts;
}
