import Redlock from "redlock";
import { createRedisConnection } from "./redisConfig.js";

// Create Redlock instance
const redlock = new Redlock([createRedisConnection()], {
  driftFactor: 0.01, // Lock expiration drift factor
  retryCount: 3, // Number of retry attempts
  retryDelay: 200, // Time between retries in ms
  retryJitter: 100, // Randomness to prevent stampedes
});

export const acquireLock = async (resource, ttl = 5000) => {
  try {
    return await redlock.acquire([resource], ttl);
  } catch (error) {
    console.error("🔒 Failed to acquire lock:", error);
    return null;
  }
};

export const releaseLock = async (lock) => {
  try {
    await lock.release();
  } catch (error) {
    console.error("🔓 Failed to release lock:", error);
  }
};
