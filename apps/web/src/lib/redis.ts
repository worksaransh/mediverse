import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Global in-memory cache fallback for environments without a running Redis server
const globalAny = globalThis as any;
globalAny.redisMemoryStore = globalAny.redisMemoryStore || new Map<string, string>();
const memoryStore = globalAny.redisMemoryStore;

let redisClient: IORedis | null = null;
let useMemoryFallback = true;

if (REDIS_URL && REDIS_URL !== "redis://127.0.0.1:6379") {
  try {
    console.log(`[Redis] Connecting to ${REDIS_URL}...`);
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });
    
    redisClient.on("connect", () => {
      console.log("[Redis] Connected successfully.");
      useMemoryFallback = false;
    });

    redisClient.on("error", (err) => {
      console.warn("[Redis] Connection error — falling back to memory cache:", err.message);
      useMemoryFallback = true;
    });
  } catch (error: any) {
    console.warn("[Redis] Initialization failed — falling back to memory cache:", error.message);
    useMemoryFallback = true;
  }
} else {
  console.log("[Redis] REDIS_URL not configured. Using in-memory cache fallback.");
  useMemoryFallback = true;
}

export const redis = {
  async get(key: string): Promise<string | null> {
    if (useMemoryFallback || !redisClient) {
      return memoryStore.get(key) || null;
    }
    try {
      return await redisClient.get(key);
    } catch (e) {
      return memoryStore.get(key) || null;
    }
  },

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (useMemoryFallback || !redisClient) {
      memoryStore.set(key, value);
      return;
    }
    try {
      if (expireSeconds) {
        await redisClient.set(key, value, "EX", expireSeconds);
      } else {
        await redisClient.set(key, value);
      }
    } catch (e) {
      memoryStore.set(key, value);
    }
  },

  async del(key: string): Promise<void> {
    if (useMemoryFallback || !redisClient) {
      memoryStore.delete(key);
      return;
    }
    try {
      await redisClient.del(key);
    } catch (e) {
      memoryStore.delete(key);
    }
  },

  async incr(key: string): Promise<number> {
    if (useMemoryFallback || !redisClient) {
      const current = Number(memoryStore.get(key) || 0) + 1;
      memoryStore.set(key, current.toString());
      return current;
    }
    try {
      return await redisClient.incr(key);
    } catch (e) {
      const current = Number(memoryStore.get(key) || 0) + 1;
      memoryStore.set(key, current.toString());
      return current;
    }
  },

  async expire(key: string, seconds: number): Promise<boolean> {
    if (useMemoryFallback || !redisClient) {
      // Setup automatic deletion in memory
      setTimeout(() => {
        memoryStore.delete(key);
      }, seconds * 1000);
      return true;
    }
    try {
      const res = await redisClient.expire(key, seconds);
      return res === 1;
    } catch (e) {
      return true;
    }
  },

  async ttl(key: string): Promise<number> {
    if (useMemoryFallback || !redisClient) {
      return 60; // Mock default remaining TTL
    }
    try {
      return await redisClient.ttl(key);
    } catch (e) {
      return 60;
    }
  },
};

