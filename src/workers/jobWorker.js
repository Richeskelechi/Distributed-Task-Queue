import { Worker } from "bullmq";
import { createRedisConnection } from "../utils/redisConfig.js";
import { acquireLock, releaseLock } from "../utils/lockManager.js";
import { logFailedJob, cleanupFailedJobs } from "../utils/jobLogger.js";

// Run cleanup every 24 hours
setInterval(async () => {
  console.log("🧹 Running failed job cleanup...");
  await cleanupFailedJobs();
}, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

const jobWorker = new Worker(
  "taskQueue",
  async (job) => {
    const lockKey = `lock:job:${job.id}`;
    const lock = await acquireLock(lockKey);

    if (!lock) {
      console.log(`🚫 Skipping job ${job.id} as it's already being processed.`);
      return;
    }

    try {
      console.log(`Processing job ${job.id}:`, job.data);

      // Simulating a task that takes time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulating success/failure
      if (Math.random() < 0.2) {
        throw new Error("Random failure for testing retries.");
      }

      console.log(`✅ Job ${job.id} completed successfully.`);
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error.message);
      await logFailedJob(job.id, job.data, error.message); // Log failure to Redis
      throw error;
    } finally {
      await releaseLock(lock);
    }
  },
  {
    connection: createRedisConnection(),
    attempts: 5, // Retry up to 5 times
    backoff: { type: "exponential", delay: 1000 }, // Exponential backoff strategy
  }
);

jobWorker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} finished successfully.`);
});

jobWorker.on("failed", async (job, err) => {
  console.error(`❌ Job ${job.id} failed with error:`, err.message);
  await logFailedJob(job.id, job.data, err.message); // Store failed job in Redis
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await jobWorker.close();
  process.exit(0);
});

console.log("Worker is running...");
