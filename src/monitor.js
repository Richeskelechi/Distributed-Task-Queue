import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import { createRedisConnection } from "./utils/redisConfig.js";

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Initialize queues
const taskQueue = new Queue("taskQueue", { connection: createRedisConnection() });

// Create the dashboard
createBullBoard({
  queues: [new BullMQAdapter(taskQueue)],
  serverAdapter,
});

// Attach Bull Board UI
app.use("/admin/queues", serverAdapter.getRouter());

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Bull Board running at http://localhost:${PORT}/admin/queues`);
});
