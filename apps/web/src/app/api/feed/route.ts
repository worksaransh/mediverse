import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, contentItems } from "@mediverse/db";
import { inArray, eq } from "drizzle-orm";
import { redis } from "@/lib/redis";
import { precomputeUserFeed } from "@/lib/feed-precompute";

/**
 * GET /api/feed
 * Retrieve paginated personalized discover feed content.
 */
export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "5");

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: "Invalid pagination params" }, { status: 400 });
    }

    const db = createDb();
    const redisKey = `user:feed:${session.userId}`;
    let candidateIdsStr = await redis.get(redisKey);
    let candidateIds: string[] = [];

    if (candidateIdsStr) {
      candidateIds = JSON.parse(candidateIdsStr);
    }

    // Check if cache is missing or stale compared to total published database items
    const allPublished = await db.query.contentItems.findMany({
      where: eq(contentItems.status, "published"),
    });

    if (candidateIds.length === 0 || candidateIds.length < allPublished.length) {
      console.log(`[Feed API] Cache miss or stale for user ${session.userId} — generating feed candidates...`);
      candidateIds = await precomputeUserFeed(session.userId);
    }

    if (candidateIds.length === 0) {
      return NextResponse.json({ items: [], hasMore: false });
    }

    // 3. Paginate candidates list
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageCandidates = candidateIds.slice(startIndex, endIndex);

    if (pageCandidates.length === 0) {
      return NextResponse.json({ items: [], hasMore: false });
    }

    // 4. Batch fetch content items from database
    const items = await db.query.contentItems.findMany({
      where: inArray(contentItems.id, pageCandidates),
    });

    // 5. Preserving exact candidate order (since DB in-clause doesn't guarantee order)
    const sortedItems = pageCandidates
      .map((id) => items.find((item: any) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => !!item);

    const hasMore = endIndex < candidateIds.length;

    return NextResponse.json({
      items: sortedItems,
      hasMore,
    });
  } catch (error: any) {
    console.error("[Feed API] Error fetching user feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
