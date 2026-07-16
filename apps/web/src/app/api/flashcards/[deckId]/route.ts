import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, flashcardDecks, flashcards, flashcardReviews } from "@mediverse/db";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

/**
 * GET /api/flashcards/[deckId]
 * Fetch a deck's cards, along with each card's most recent SM-2 review
 * state for the authenticated user (or a default "never reviewed" state).
 * Owner-only — a deck may only be read by the user who owns it, unless it
 * has been explicitly marked public.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;

    const db = createDb();
    const deck = await db.query.flashcardDecks.findFirst({
      where: eq(flashcardDecks.id, deckId),
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== session.userId && !deck.isPublic) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cards = await db.query.flashcards.findMany({
      where: eq(flashcards.deckId, deckId),
    });
    cards.sort((a: any, b: any) => a.sortOrder - b.sortOrder);

    // Resolve each card's most recent review (if any) for this user.
    const reviews = await db.query.flashcardReviews.findMany({
      where: eq(flashcardReviews.userId, session.userId),
    });

    const latestReviewByCard = new Map<string, (typeof reviews)[number]>();
    for (const review of reviews) {
      const existing = latestReviewByCard.get(review.cardId);
      if (!existing || review.reviewedAt > existing.reviewedAt) {
        latestReviewByCard.set(review.cardId, review);
      }
    }

    const cardsWithSchedule = cards.map((card: any) => {
      const latest = latestReviewByCard.get(card.id);
      return {
        ...card,
        schedule: latest
          ? {
              easinessFactor: latest.easinessFactor,
              intervalDays: latest.intervalDays,
              repetitions: latest.repetitions,
              nextReviewAt: latest.nextReviewAt,
            }
          : null,
      };
    });

    return NextResponse.json({ deck, cards: cardsWithSchedule });
  } catch (error: any) {
    console.error("[Flashcards Deck API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
