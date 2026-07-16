import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, flashcardDecks } from "@mediverse/db";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/flashcards
 * Lists the authenticated user's own flashcard decks, most recent first.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();
    const decks = await db.query.flashcardDecks.findMany({
      where: eq(flashcardDecks.userId, session.userId),
      orderBy: [desc(flashcardDecks.createdAt)],
    });

    return NextResponse.json({ decks });
  } catch (error: any) {
    console.error("[Flashcards List API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
