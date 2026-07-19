import fs from "fs";
import path from "path";

// 1. Parse .env file before importing anything to configure environment variables
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { createDb } from "../../../packages/db/src/client";
import { sql } from "drizzle-orm";
import { askMentor } from "../../../packages/ai/src/index";
import { searchPubMed } from "../../../packages/ingestion/src/index";
import { composeDailyDigest } from "./digest-composer";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

console.log(`[Worker] Initializing Mediverse Background Worker...`);
console.log(`[Worker] Redis Target: ${REDIS_URL}`);

// Setup Database Client wrapper
let db: ReturnType<typeof createDb> | null = null;
try {
  db = createDb();
  console.log("[Worker] Database client initialized.");
} catch (e) {
  console.warn("[Worker] Failed to initialize DB client:", e);
}

// ─── Native Scheduler Fallback ──────────────────────────────
// In local dev, if Redis is down, we use a simple native interval loop to run tasks.
async function runPartitionJob() {
  if (!db) return;
  try {
    console.log("[Scheduler] Running partition cron: SELECT create_monthly_partitions();");
    // Only call execute if it exists on the db object (which it does on real Drizzle postgres connection)
    if (typeof db.execute === "function") {
      await db.execute(sql`SELECT create_monthly_partitions();`);
      console.log("[Scheduler] Partition cron completed successfully.");
    } else {
      console.log("[Scheduler] Mock DB detected. Skipping raw partition SQL execute.");
    }
  } catch (err: any) {
    console.error("[Scheduler] Partition cron failed:", err.message || err);
  }
}

async function runRetentionAndRollupJob() {
  if (!db) return;
  try {
    console.log("[Scheduler] Running DPDP Data Retention & Rollup jobs...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (typeof db.execute === "function") {
      // Roll up/delete detailed feed events older than 30 days
      await db.execute(sql`
        DELETE FROM feed_events 
        WHERE created_at < ${thirtyDaysAgo}
      `);
      console.log("[Scheduler] Detailed feed events older than 30 days cleaned up.");

      // Anonymize/delete old AI conversations messages older than 30 days
      await db.execute(sql`
        DELETE FROM ai_messages 
        WHERE created_at < ${thirtyDaysAgo}
      `);
      console.log("[Scheduler] AI messages history older than 30 days anonymized.");
    } else {
      console.log("[Scheduler] Mock DB detected. Skipping raw retention SQL execute.");
    }
  } catch (err: any) {
    console.error("[Scheduler] Retention job failed:", err.message || err);
  }
}

// Start native scheduler
console.log("[Scheduler] Starting native backup scheduler...");
runPartitionJob();
runRetentionAndRollupJob();

// Run partition checks every 12 hours, retention checks every 24 hours
setInterval(runPartitionJob, 12 * 60 * 60 * 1000);
setInterval(runRetentionAndRollupJob, 24 * 60 * 60 * 1000);


// ─── BullMQ Worker Setup ────────────────────────────────────
let connection: IORedis | null = null;
let taskQueue: Queue | null = null;
let worker: Worker | null = null;

try {
  connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
    retryStrategy(times) {
      // Retry every 10 seconds to avoid spamming connection logs when offline
      return 10000;
    }
  });

  connection.on("connect", () => {
    console.log("[Worker] Successfully connected to Redis.");
  });

  connection.on("error", (err) => {
    console.warn("[Worker] Redis connection error (using native backup scheduler):", err.message);
  });

  const handleIngestionJob = async (job: Job) => {
    console.log(`[Worker] Processing Ingestion Job ${job.id}: query="${job.data.query}"`);
    const results = await searchPubMed(job.data.query);
    console.log(`[Worker] Ingested ${results.length} articles from PubMed.`);
    return { success: true, count: results.length };
  };

  const handleAIMentorJob = async (job: Job) => {
    console.log(`[Worker] Processing AI Mentor Job ${job.id}: question="${job.data.question}"`);
    const response = await askMentor({
      question: job.data.question,
      subject: job.data.subject,
    });
    console.log(`[Worker] AI Mentor Job completed. Response snippet: "${response.answer.slice(0, 50)}..."`);
    return { success: true, answer: response.answer };
  };

  worker = new Worker(
    "mediverse-tasks",
    async (job: Job) => {
      switch (job.name) {
        case "ingest":
          return handleIngestionJob(job);
        case "ai-mentor":
          return handleAIMentorJob(job);
        case "daily-digest":
          return composeDailyDigest(job.data.userId, job.data.overrideHour);
        case "db-partition-rotation":
          await runPartitionJob();
          return { success: true };
        case "db-retention-cleanup":
          await runRetentionAndRollupJob();
          return { success: true };
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

  taskQueue = new Queue("mediverse-tasks", { connection });

  // Register robust database partition and cleanup cron jobs
  taskQueue.add("db-partition-rotation", {}, {
    repeat: { pattern: "0 0 1 * *" } // Every 1st of the month at midnight
  }).catch(err => console.warn("[Worker] Failed to queue db-partition-rotation:", err.message));

  taskQueue.add("db-retention-cleanup", {}, {
    repeat: { pattern: "0 2 * * *" } // Daily at 2:00 AM
  }).catch(err => console.warn("[Worker] Failed to queue db-retention-cleanup:", err.message));
} catch (e: any) {
  console.warn("[Worker] BullMQ / Redis failed to initialize. Relying solely on native backup scheduler:", e.message);
}

export { taskQueue };
