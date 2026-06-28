const { redisClient } = require("../config/redis");

const defaultTTL = Number(process.env.CACHE_TTL_SECONDS) || 300;

const isRedisReady = () => redisClient && redisClient.isOpen;

const getOrSetCache = async (key, fetchFn, ttl = defaultTTL) => {
  try {
    if (!isRedisReady()) {
      return fetchFn();
    }

    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    if (data !== undefined) {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error("Redis cache error:", error);
    return fetchFn();
  }
};

const invalidateCache = async (...keys) => {
  try {
    if (!isRedisReady() || keys.length === 0) return;
    await redisClient.del(...keys);
  } catch (error) {
    console.error("Redis cache invalidation error:", error);
  }
};

module.exports = { getOrSetCache, invalidateCache };
