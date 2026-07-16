import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, flashcards, flashcardDecks, flashcardReviews, computeSm2Update, SM2_INITIAL_STATE } from "@mediverse/db";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/flashcards/review
 * Records a spaced-repetition review for a flashcard (quality 0-5) and
 * schedules its next review date via the shared SM-2 implementation.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId, quality } = await req.json();
    if (!cardId || typeof quality !== "number") {
      return NextResponse.json(
        { error: "cardId and a numeric quality (0-5) are required" },
        { status: 400 },
      );
    }
    if (quality < 0 || quality > 5) {
      return NextResponse.json({ error: "quality must be between 0 and 5" }, { status: 400 });
    }

    const db = createDb();

    // Verify the card exists and its deck is owned by the caller.
    const card = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, cardId),
    });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const deck = await db.query.flashcardDecks.findFirst({
      where: eq(flashcardDecks.id, card.deckId),
    });
    if (!deck || deck.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find this user's most recent review of this card, if any.
    const priorReviews = await db.query.flashcardReviews.findMany({
      where: and(
        eq(flashcardReviews.userId, session.userId),
        eq(flashcardReviews.cardId, cardId),
      ),
    });
    const latest = priorReviews.sort(
      (a: any, b: any) => b.reviewedAt.getTime() - a.reviewedAt.getTime(),
    )[0];

    const prevState = latest
      ? {
          easinessFactor: latest.easinessFactor,
          intervalDays: latest.intervalDays,
          repetitions: latest.repetitions,
        }
      : SM2_INITIAL_STATE;

    const sm2 = computeSm2Update(quality, prevState);

    const [review] = await db
      .insert(flashcardReviews)
      .values({
        userId: session.userId,
        cardId,
        quality,
        easinessFactor: sm2.easinessFactor,
        intervalDays: sm2.intervalDays,
        repetitions: sm2.repetitions,
        nextReviewAt: sm2.nextReviewAt,
      })
      .returning();

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("[Flashcards Review API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
