import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mcqs, quizSessions, quizSessionQuestions } from "@mediverse/db";
import { eq } from "drizzle-orm";

const VALID_MODES = ["practice", "timed", "mock_exam"];

/**
 * POST /api/quiz/generate
 * Creates a scoped test/quiz session by selecting existing MCQs matching a
 * subject (optionally narrowed to a specific topicId), then returns the
 * session plus its ordered question list. Question content the client
 * needs to render is included; correctOption/explanation are withheld
 * until each question is answered via /api/quiz/[sessionId]/answer.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, topicId, count, mode, timeLimitSeconds } = await req.json();
    if (!subject || typeof subject !== "string") {
      return NextResponse.json({ error: "subject is required" }, { status: 400 });
    }

    const questionCount = Math.min(Math.max(Number(count) || 10, 1), 50);
    const sessionMode = VALID_MODES.includes(mode) ? mode : "practice";

    const db = createDb();

    const allMatching = await db.query.mcqs.findMany({
      where: eq(mcqs.subject, subject),
    });

    let pool = topicId
      ? allMatching.filter((m: any) => m.topicId === topicId)
      : allMatching;

    // Fall back to the full subject pool if the topic-scoped pool is too thin.
    if (topicId && pool.length < questionCount) {
      pool = allMatching;
    }

    if (pool.length === 0) {
      return NextResponse.json(
        { error: `No questions available for subject "${subject}"` },
        { status: 404 },
      );
    }

    // Shuffle (Fisher-Yates) and take up to questionCount.
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    const [quizSession] = await db
      .insert(quizSessions)
      .values({
        userId: session.userId,
        title: topicId ? `${subject} — Topic Test` : `${subject} — Practice Test`,
        mode: sessionMode,
        subject,
        totalQuestions: selected.length,
        timeLimitSeconds: sessionMode === "practice" ? null : (timeLimitSeconds ?? selected.length * 90),
        status: "in_progress",
      })
      .returning();

    if (!quizSession) {
      return NextResponse.json({ error: "Failed to create quiz session" }, { status: 500 });
    }

    const sessionQuestions = await db
      .insert(quizSessionQuestions)
      .values(
        selected.map((mcq: any, idx: number) => ({
          sessionId: quizSession.id,
          mcqId: mcq.id,
          questionOrder: idx,
        })),
      )
      .returning();

    // Return questions in order, without the answer key.
    const questionsForClient = sessionQuestions
      .sort((a: any, b: any) => a.questionOrder - b.questionOrder)
      .map((sq: any) => {
        const mcq = selected.find((m: any) => m.id === sq.mcqId);
        return {
          questionOrder: sq.questionOrder,
          mcqId: sq.mcqId,
          question: mcq?.question,
          options: mcq?.options,
          difficulty: mcq?.difficulty,
        };
      });

    return NextResponse.json({ session: quizSession, questions: questionsForClient });
  } catch (error: any) {
    console.error("[Quiz Generate API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
