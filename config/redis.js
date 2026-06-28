const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
const isProduction = process.env.NODE_ENV === "production";
const redisEnabled = Boolean(redisUrl || !isProduction);

let redisClient = null;
let clientOptions = {};

if (redisEnabled) {
  clientOptions = { url: redisUrl || "redis://127.0.0.1:6379" };
  redisClient = createClient(clientOptions);

  redisClient.on("connect", () => {
    console.log("Redis client connecting...");
  });

  redisClient.on("ready", () => {
    console.log(`Redis connected: ${clientOptions.url}`);
  });
}

if (isProduction && !redisUrl) {
  console.warn(
    "No REDIS_URL found in production. Redis cache will be disabled.",
  );
}

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("end", () => {
  console.warn("Redis connection closed");
});

const connectRedis = async () => {
  try {
    if (!redisClient) {
      return;
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection failed:", error);
    throw error;
  }
};

module.exports = { redisClient, connectRedis };
