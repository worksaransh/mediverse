import { NextResponse } from "next/server";
import { createDb, contentItems, aiMessages } from "@mediverse/db";
import { eq } from "drizzle-orm";
import IORedis from "ioredis";
import { verifyAdminSession } from "@/lib/auth";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
let redis: any;
try {
  redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: 1 });
  redis.on("error", () => {});
} catch (e) {
  redis = {
    keys: async () => [],
    del: async () => 0,
  };
}

const createMockEmbedding = (subject: string): number[] => {
  const vec = new Array(768).fill(0.01);
  if (subject === "Pharmacology") {
    for (let i = 0; i < 150; i++) vec[i] = 0.8;
  } else if (subject === "Pathology") {
    for (let i = 150; i < 300; i++) vec[i] = 0.8;
  } else if (subject === "Anatomy") {
    for (let i = 300; i < 450; i++) vec[i] = 0.8;
  } else if (subject === "Biochemistry") {
    for (let i = 450; i < 600; i++) vec[i] = 0.8;
  } else if (subject === "General Surgery") {
    for (let i = 600; i < 750; i++) vec[i] = 0.8;
  }
  return vec;
};

/**
 * POST /api/content/review
 * Handle admin operations (Approve, Edit, Reject, Clear Flag, Ingest Mock)
 */
export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { action, id, title, body, specialtyTags, topicTags } = await req.json();

    const db = createDb();

    if (action === "ingest_mock") {
      const subject = specialtyTags?.[0] || "Pathology";
      // Simulate ingestion task importing a new clinical draft item
      const newDraft = await db.insert(contentItems).values({
        type: "article",
        title: title || "New Ingested Guidelines: HER2 Low Breast Neoplasms",
        body: body || "Reviewing criteria for low-HER2 status and targeted antibody-drug conjugates.",
        summary: "Updated clinical guidelines for low expression profiles.",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/mock-ingested-breast",
        audienceTags: ["pg_prep"],
        specialtyTags: specialtyTags || ["Pathology"],
        topicTags: topicTags || ["Breast Cancer", "Pathology"],
        embedding: createMockEmbedding(subject),
        metadata: { qualityScore: 0.95 },
        status: "draft",
        createdAt: new Date(),
      }).returning();

      return NextResponse.json({ success: true, item: newDraft[0] });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
    }

    if (action === "approve") {
      // Update draft content status to published
      await db
        .update(contentItems)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(contentItems.id, id));

      // Invalidate all user feeds in Redis to trigger re-precomputation
      try {
        const keys = await redis.keys("user:feed:*");
        if (keys && keys.length > 0) {
          await redis.del(...keys);
          console.log(`[Admin Review] Invalidated ${keys.length} user feed caches in Redis.`);
        }
      } catch (redisError) {
        console.warn("[Admin Review] Failed to invalidate Redis keys:", redisError);
      }

      return NextResponse.json({ success: true });
    }

    if (action === "edit") {
      await db
        .update(contentItems)
        .set({
          title: title || "Untitled",
          body: body || "",
          specialtyTags: specialtyTags || [],
          topicTags: topicTags || [],
          updatedAt: new Date(),
        })
        .where(eq(contentItems.id, id));

      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      // Delete draft
      await db.delete(contentItems).where(eq(contentItems.id, id));
      return NextResponse.json({ success: true });
    }

    if (action === "clear_flag") {
      // Clear moderation alerts
      await db
        .update(aiMessages)
        .set({
          flagged: false,
        })
        .where(eq(aiMessages.id, id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (error: any) {
    console.error("[Admin API Review] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
