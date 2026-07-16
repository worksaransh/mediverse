import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, flashcardDecks, flashcards } from "@mediverse/db";
import { generateFlashcards } from "@mediverse/ai";

/**
 * POST /api/flashcards/generate
 * Generates an AI flashcard deck for a given subject + topic and persists
 * both the deck and its cards.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, topic, count } = await req.json();
    if (!subject || typeof subject !== "string" || !topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "subject and topic are required" },
        { status: 400 },
      );
    }

    const cards = await generateFlashcards({ subject, topic, count });

    const db = createDb();

    const [deck] = await db
      .insert(flashcardDecks)
      .values({
        userId: session.userId,
        title: `${topic} (${subject})`,
        description: `AI-generated flashcard deck covering ${topic} within ${subject}.`,
        subject,
        topicTags: [topic],
        isPublic: false,
        cardCount: cards.length,
        aiGenerated: true,
      })
      .returning();

    if (!deck) {
      return NextResponse.json({ error: "Failed to create flashcard deck" }, { status: 500 });
    }

    const insertedCards = cards.length
      ? await db
          .insert(flashcards)
          .values(
            cards.map((card, idx) => ({
              deckId: deck.id,
              front: card.front,
              back: card.back,
              hint: card.hint,
              sortOrder: idx,
            })),
          )
          .returning()
      : [];

    return NextResponse.json({ deck, cards: insertedCards });
  } catch (error: any) {
    console.error("[Flashcards Generate API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
