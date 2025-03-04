# Distributed Task Queue

## Overview
This project implements a **Distributed Task Queue** using **Node.js, BullMQ, and Redis**, allowing asynchronous job processing across multiple worker instances.

## Services and Components
The system is composed of several Dockerized services:

- **API Service (`api`)** - Accepts job requests and adds them to the queue.
- **Producer (`producer`)** - (Optional) Generates jobs and enqueues them.
- **Worker (`worker`)** - Processes queued jobs and logs success or failure.
- **Redis (`redis`)** - Stores job queues and handles distribution.
- **Monitor (`monitor`)** - Tracks job execution and system performance.

## Execution Flow

### 1️⃣ Start Redis
Redis starts first and listens on port **6379**. Since all services depend on Redis, it must be running before others start.

### 2️⃣ Start the API Server (`api`)
- Runs `src/api.js`.
- Initializes a **BullMQ queue** (`taskQueue`).
- Exposes an endpoint (`POST /enqueue`) to receive job requests.
- Adds jobs to Redis for worker processing.

### 3️⃣ Start Worker Service (`worker`)
- Runs `src/workers/jobWorker.js`.
- Continuously listens for new jobs in `taskQueue`.
- When a job arrives:
  - **Locks the job** to prevent duplicate processing.
  - **Simulates work** with a 2-second delay.
  - **Handles job success or failure**:
    - ✅ **Success** → Logs completion.
    - ❌ **Failure** → Retries up to 5 times (with exponential backoff) and logs error.
- Failed jobs are stored in Redis under `failedJobs:{jobId}`.

### 4️⃣ (Optional) Start the Producer (`producer`)
- Generates test jobs and enqueues them in `taskQueue`.

### 5️⃣ Start the Monitor Service (`monitor`)
- Runs `src/monitor.js`.
- Tracks Redis queues, showing:
  - Active jobs.
  - Completed jobs.
  - Failed jobs.
- Can be extended for real-time job monitoring.

### 6️⃣ Job Completion and Cleanup
- Workers process jobs until completion.
- If a job fails after **5 retries**, it is permanently marked as failed.
- A **cleanup task runs every 24 hours** to remove old failed jobs from Redis.

## How Services Interact
1. **Redis** starts first.
2. **API Server** starts and listens for job requests.
3. **Workers** start, waiting for jobs.
4. **Client or Producer** calls `POST /enqueue` to add jobs.
5. **Workers process jobs**:
   - **Success** → Logs completion.
   - **Failure** → Retries up to 5 times, then logs failure.
6. **Monitor Service** tracks job execution.
7. **Cleanup runs every 24 hours** to remove old failed jobs.

## Summary
This system ensures **scalable, fault-tolerant, and efficient background processing** using Redis and BullMQ. 🚀

