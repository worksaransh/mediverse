import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, quizSessions, quizSessionQuestions, mcqs } from "@mediverse/db";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

/**
 * POST /api/quiz/[sessionId]/answer
 * Records the answer for one question within a quiz session and returns
 * whether it was correct, plus whether the session is now fully answered.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const { mcqId, selectedOption, timeTakenMs } = await req.json();
    if (!mcqId || !selectedOption) {
      return NextResponse.json(
        { error: "mcqId and selectedOption are required" },
        { status: 400 },
      );
    }

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
    if (quizSession.status !== "in_progress") {
      return NextResponse.json({ error: "This quiz session is no longer in progress" }, { status: 409 });
    }

    const sessionQuestion = await db.query.quizSessionQuestions.findFirst({
      where: and(
        eq(quizSessionQuestions.sessionId, sessionId),
        eq(quizSessionQuestions.mcqId, mcqId),
      ),
    });
    if (!sessionQuestion) {
      return NextResponse.json({ error: "Question not found in this session" }, { status: 404 });
    }

    const mcq = await db.query.mcqs.findFirst({ where: eq(mcqs.id, mcqId) });
    if (!mcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
    }

    const isCorrect = selectedOption === mcq.correctOption;

    await db
      .update(quizSessionQuestions)
      .set({
        selectedOption,
        isCorrect: isCorrect ? 1 : 0,
        timeTakenMs: timeTakenMs || 0,
        answeredAt: new Date(),
      })
      .where(eq(quizSessionQuestions.id, sessionQuestion.id));

    if (isCorrect) {
      await db
        .update(quizSessions)
        .set({ correctAnswers: quizSession.correctAnswers + 1 })
        .where(eq(quizSessions.id, sessionId));
    }

    const allQuestions = await db.query.quizSessionQuestions.findMany({
      where: eq(quizSessionQuestions.sessionId, sessionId),
    });
    const answeredCount = allQuestions.filter(
      (q: any) => q.id === sessionQuestion.id || q.answeredAt !== null,
    ).length;
    const allAnswered = answeredCount >= allQuestions.length;

    return NextResponse.json({
      isCorrect,
      correctOption: mcq.correctOption,
      explanation: mcq.explanation,
      allAnswered,
    });
  } catch (error: any) {
    console.error("[Quiz Answer API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
