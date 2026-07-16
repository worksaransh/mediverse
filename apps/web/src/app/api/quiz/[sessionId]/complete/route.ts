import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, quizSessions } from "@mediverse/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/quiz/[sessionId]/complete
 * Finalizes a quiz session: marks it completed, records the score and
 * time taken. Safe to call even if some questions were skipped.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const clientTimeTakenSeconds = typeof body?.timeTakenSeconds === "number" ? body.timeTakenSeconds : undefined;

    const db = createDb();

    const quizSession = await db.query.quizSessions.findFirst({
      where: eq(quizSessions.id, sessionId),
    });
    if (!quizSession) {
      return NextResponse.json({ error: "Quiz session not found" }, { status: 404 });
    }
    if (quizSession.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const completedAt = new Date();
    const timeTakenSeconds =
      clientTimeTakenSeconds ??
      Math.max(0, Math.round((completedAt.getTime() - quizSession.startedAt.getTime()) / 1000));

    const scorePercent =
      quizSession.totalQuestions > 0
        ? Math.round((quizSession.correctAnswers / quizSession.totalQuestions) * 100)
        : 0;

    const [updated] = await db
      .update(quizSessions)
      .set({
        status: "completed",
        completedAt,
        timeTakenSeconds,
        scorePercent,
      })
      .where(eq(quizSessions.id, sessionId))
      .returning();

    return NextResponse.json({ session: updated });
  } catch (error: any) {
    console.error("[Quiz Complete API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
