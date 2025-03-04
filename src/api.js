import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Queue } from "bullmq";
import { createRedisConnection } from "./utils/redisConfig.js";

dotenv.config();
const app = express();
const PORT = 3002;
const API_KEY = process.env.API_KEY;
console.log(API_KEY);


// Middleware
app.use(cors());
app.use(express.json());

// Initialize BullMQ Queue
const taskQueue = new Queue("taskQueue", { connection: createRedisConnection() });

// Authentication Middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }
  next();
};

// API Route to Add Jobs (Protected)
app.post("/enqueue", authenticate, async (req, res) => {
  try {
    const { jobName, data } = req.body;
    if (!jobName || !data) {
      return res.status(400).json({ error: "Missing jobName or data" });
    }

    const job = await taskQueue.add(jobName, data);
    res.json({ message: "Job added", jobId: job.id });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ error: "Failed to add job" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Secure API Server running at http://localhost:${PORT}`);
});
