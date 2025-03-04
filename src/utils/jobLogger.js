import { createRedisConnection } from "./redisConfig.js";

const redisClient = createRedisConnection();
const FAILED_JOBS_TTL = 7 * 24 * 60 * 60; // Expire after 7 days (in seconds)

export const logFailedJob = async (jobId, jobData, errorMessage) => {
  const failedJob = {
    jobId,
    jobData: JSON.stringify(jobData), // Store as string
    errorMessage,
    failedAt: new Date().toISOString(),
  };

  try {
    await redisClient.hset(`failedJobs:${jobId}`, failedJob);
    await redisClient.expire(`failedJobs:${jobId}`, FAILED_JOBS_TTL); // Set expiration time
    console.log(`📌 Logged failed job ${jobId} to Redis (expires in ${FAILED_JOBS_TTL / 86400} days).`);
  } catch (err) {
    console.error(`❌ Error logging failed job ${jobId}:`, err);
  }
};

// Cleanup function to remove expired failed jobs
export const cleanupFailedJobs = async () => {
  try {
    const keys = await redisClient.keys("failedJobs:*");
    for (const key of keys) {
      const ttl = await redisClient.ttl(key);
      if (ttl === -1) {
        await redisClient.expire(key, FAILED_JOBS_TTL);
        console.log(`🧹 Set expiration for ${key}`);
      }
    }
    console.log("✅ Cleanup process completed.");
  } catch (err) {
    console.error("❌ Error during failed jobs cleanup:", err);
  }
};
