import { Queue } from "bullmq";
import { createRedisConnection } from "../utils/redisConfig.js";

const taskQueue = new Queue("taskQueue", {
  connection: createRedisConnection(),
});

test("Should add a job to the queue", async () => {
  const job = await taskQueue.add("testJob", { foo: "bar" });

  expect(job.id).toBeDefined();
  expect(job.data.foo).toBe("bar");

  await taskQueue.close();
});
