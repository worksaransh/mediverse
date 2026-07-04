import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, feedEvents } from "@mediverse/db";

/**
 * POST /api/feed/event
 * Log user interaction metrics (dwell time and impressions)
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyText = await req.text();
    if (!bodyText) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch (err: any) {
      console.warn("[Feed Event API] Received malformed JSON payload:", err.message);
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { contentItemId, eventType, metadata } = payload;

    if (!contentItemId || !eventType) {
      return NextResponse.json(
        { error: "contentItemId and eventType are required" },
        { status: 400 },
      );
    }

    // 2. Write event to database
    console.log(`[Feed Event] Logging interaction for user ${session.userId} on item ${contentItemId}: ${eventType}`, metadata);
    const db = createDb();
    
    await db.insert(feedEvents).values({
      userId: session.userId,
      eventType: eventType,
      contentItemId: contentItemId,
      metadata: metadata || {},
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Feed Event API] Error logging interaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
