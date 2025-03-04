import { logFailedJob } from "../utils/jobLogger.js";
import { createRedisConnection } from "../utils/redisConfig.js";

const redis = createRedisConnection();

test("Should log failed jobs", async () => {
    await logFailedJob("123", { task: "test" }, "Simulated error");
    const log = await redis.hgetall("failedJobs:123");
  
    expect(log.jobId).toBe("123");
    expect(log.errorMessage).toBe("Simulated error");
  
    await redis.del("failedJobs:123");
    await redis.quit();
  });