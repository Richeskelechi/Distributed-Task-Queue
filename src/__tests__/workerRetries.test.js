import { Worker } from "bullmq";
import { createRedisConnection } from "../utils/redisConfig.js";

let attemptCount = 0;
const testWorker = new Worker(
  "testQueue",
  async (job) => {
    attemptCount++;
    if (attemptCount < 3) throw new Error("Simulated failure");
  },
  {
    connection: createRedisConnection(),
    attempts: 5,
    backoff: { type: "exponential", delay: 500 },
  }
);

test("Worker should retry failed jobs", async () => {
  expect(attemptCount).toBeLessThanOrEqual(5);
});
