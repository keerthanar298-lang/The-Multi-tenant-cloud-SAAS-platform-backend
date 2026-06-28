const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL || null;
const localFallback = "redis://127.0.0.1:6379";

if (!redisUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "REDIS_URL is required in production. Set REDIS_URL in Render / Vercel environment variables.",
  );
}

const clientOptions = { url: redisUrl || localFallback };
const redisClient = createClient(clientOptions);

redisClient.on("connect", () => {
  console.log("Redis client connecting...");
});

redisClient.on("ready", () => {
  console.log(`Redis connected: ${clientOptions.url}`);
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("end", () => {
  console.warn("Redis connection closed");
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection failed:", error);
    throw error;
  }
};

module.exports = { redisClient, connectRedis };
