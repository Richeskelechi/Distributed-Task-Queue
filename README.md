# Distributed Task Queue

This project implements a distributed task queue using Node.js, Redis, and BullMQ. It consists of multiple services, including an API server, a task producer, a worker pool, and a monitoring service.

## Table of Contents
- [Architecture](#architecture)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Scaling Workers](#scaling-workers)
- [Logging & Monitoring](#logging--monitoring)
- [Graceful Shutdown](#graceful-shutdown)
- [License](#license)

---

## Architecture
The system is composed of the following services:

- **API Server (`api`)** - Exposes an endpoint to enqueue jobs.
- **Producer (`producer`)** - Generates tasks and pushes them to Redis.
- **Worker (`worker`)** - Processes jobs from the queue with retry logic.
- **Monitor (`monitor`)** - Monitors the queue and failed jobs.
- **Redis (`redis`)** - Central message broker for job queuing.

```
┌────────────┐      ┌──────────────┐      ┌──────────────┐
│  Producer  │ ───> │   Redis DB   │ <──> │    Worker    │
└────────────┘      └──────────────┘      └──────────────┘
         │                 │                    │
         ▼                 ▼                    ▼
┌───────────────────┐   ┌──────────────┐   ┌──────────────┐
│ API (Enqueue Job) │   │  Monitor UI  │   │Logging/Retry │
└───────────────────┘   └──────────────┘   └──────────────┘
```

## Features
- **Job Queueing** with BullMQ and Redis
- **Task Processing with Workers** (Multiple replicas for parallel execution)
- **Failure Handling & Retry Mechanism** (Exponential backoff)
- **Monitoring & Logging** of failed jobs
- **Graceful Shutdown** of workers

---

## Setup & Installation

### Prerequisites
- Node.js & Yarn
- Docker & Docker Compose

### 1️⃣ Clone the repository
```sh
git clone https://github.com/your-repo/distributed-task-queue.git
cd distributed-task-queue
```

### 2️⃣ Install dependencies
```sh
yarn install
```

### 3️⃣ Start the services
```sh
docker-compose up --build
```

---

## Usage

### Enqueue a job via API
```sh
curl -X POST http://localhost:3002/enqueue \
     -H "Content-Type: application/json" \
     -H "x-api-key: supersecureapikey123" \
     -d '{"jobName": "emailJob", "data": {"email": "user@example.com"}}'
```
Response:
```json
{
  "message": "Job added",
  "jobId": "12345"
}
```

### Check Redis for failed jobs
```sh
docker exec -it redis redis-cli
hgetall failedJobs:123
```

---

## API Endpoints

| Method | Endpoint     | Description           |
|--------|-------------|-----------------------|
| POST   | /enqueue    | Adds a job to the queue (Requires API Key) |

---

## Environment Variables
Create a `.env` file with:
```ini
REDIS_HOST=redis
API_KEY=supersecureapikey123
```

---

## Scaling Workers
Workers are replicated automatically in `docker-compose.yml`:
```yaml
  deploy:
    replicas: 3  # Start with 3 worker instances
    restart_policy:
      condition: always
```
You can adjust the `replicas` count based on workload.

---

## Logging & Monitoring
- All jobs (successful & failed) are logged to Redis.
- Failed jobs are retried up to **5 times** with exponential backoff.
- A cleanup task runs every **24 hours** to remove old logs.

---

## Graceful Shutdown
To gracefully stop workers:
```sh
docker-compose down
```
This ensures that running jobs are completed before termination.

---

## License
This project is licensed under the MIT License.

