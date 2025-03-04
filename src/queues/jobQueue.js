import { Queue } from "bullmq";
import { createRedisConnection } from "../utils/redisConfig.js";

const jobQueue = new Queue("taskQueue", { connection: createRedisConnection() });

export default jobQueue;
