import jobQueue from "./queues/jobQueue.js";

const enqueueJob = async (jobData) => {
  try {
    const job = await jobQueue.add("processJob", jobData, {
      attempts: 3, // Retry failed jobs up to 3 times
      backoff: { type: "exponential", delay: 5000 }, // Exponential backoff
      removeOnComplete: true, // Remove job after completion
      removeOnFail: false, // Keep failed jobs for debugging
    });

    console.log(`Job ${job.id} added to the queue.`);
  } catch (error) {
    console.error("Error adding job to queue:", error);
  }
};

// Example job enqueue
enqueueJob({ userId: 123, action: "process-data" });
