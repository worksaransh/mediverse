import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { createDb } from "@mediverse/db";
import { askMentor } from "@mediverse/ai";
import { searchPubMed } from "@mediverse/ingestion";
import { composeDailyDigest } from "./digest-composer";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

console.log(`[Worker] Initializing Mediverse Background Worker...`);
console.log(`[Worker] Redis Target: ${REDIS_URL}`);

// Create Redis connection
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("[Worker] Successfully connected to Redis.");
});

connection.on("error", (err) => {
  console.error("[Worker] Redis connection error:", err);
});

// Setup Database Client wrapper
let db: ReturnType<typeof createDb> | null = null;
try {
  if (process.env.DATABASE_URL) {
    db = createDb();
    console.log("[Worker] Database client initialized.");
  } else {
    console.log("[Worker] DATABASE_URL not set — database client will initialize lazily.");
  }
} catch (e) {
  console.warn("[Worker] Failed to initialize DB client:", e);
}

// ─── Task Handlers ──────────────────────────────────────────

async function handleIngestionJob(job: Job) {
  console.log(`[Worker] Processing Ingestion Job ${job.id}: query="${job.data.query}"`);
  
  // Call internal ingestion package
  const results = await searchPubMed(job.data.query);
  console.log(`[Worker] Ingested ${results.length} articles from PubMed.`);
  
  return { success: true, count: results.length };
}

async function handleAIMentorJob(job: Job) {
  console.log(`[Worker] Processing AI Mentor Job ${job.id}: question="${job.data.question}"`);
  
  // Call internal AI package
  const response = await askMentor({
    question: job.data.question,
    subject: job.data.subject,
  });
  
  console.log(`[Worker] AI Mentor Job completed. Response snippet: "${response.answer.slice(0, 50)}..."`);
  
  return { success: true, answer: response.answer };
}

// ─── BullMQ Worker Setup ────────────────────────────────────

const worker = new Worker(
  "mediverse-tasks",
  async (job: Job) => {
    switch (job.name) {
      case "ingest":
        return handleIngestionJob(job);
      case "ai-mentor":
        return handleAIMentorJob(job);
      case "daily-digest":
        return composeDailyDigest(job.data.userId, job.data.overrideHour);
      default:
        console.warn(`[Worker] Unknown job name: ${job.name}`);
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} [${job.name}] has completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} [${job?.name}] failed:`, err);
});

// Create task queues for export/triggering elsewhere in apps
export const taskQueue = new Queue("mediverse-tasks", { connection });
