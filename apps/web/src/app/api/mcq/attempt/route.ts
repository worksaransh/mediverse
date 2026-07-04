import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mcqs, mcqAttempts, userTopicMastery, streaks } from "@mediverse/db";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

/**
 * POST /api/mcq/attempt
 * Process MCQ answer, update SM-2, Mastery EMA, and Streaks.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mcqId, selectedOption, timeTakenMs } = await req.json();

    if (!mcqId || !selectedOption) {
      return NextResponse.json(
        { error: "mcqId and selectedOption are required" },
        { status: 400 },
      );
    }

    const db = createDb();

    // 2. Fetch the question details
    const mcq = await db.query.mcqs.findFirst({
      where: eq(mcqs.id, mcqId),
    });

    if (!mcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
    }

    const isCorrect = selectedOption === mcq.correctOption;

    // 3. Write attempt to partitioned table
    await db.insert(mcqAttempts).values({
      userId: session.userId,
      mcqId: mcqId,
      selectedOption: selectedOption,
      isCorrect: isCorrect,
      timeTakenMs: timeTakenMs || 0,
    });

    // 4. Update or Insert User Topic Mastery (composite key)
    const topic = mcq.subject; // e.g. "Pharmacology"
    const mastery = await db.query.userTopicMastery.findFirst({
      where: and(
        eq(userTopicMastery.userId, session.userId),
        eq(userTopicMastery.topicTag, topic)
      ),
    });

    let currentEma = isCorrect ? 1.0 : 0.0;
    let oldEma = 0;
    let finalEma = 0;

    if (mastery) {
      oldEma = mastery.accuracyEma;
      // EMA formula: old_ema * 0.8 + score * 0.2
      finalEma = oldEma * 0.8 + (isCorrect ? 1.0 : 0.0) * 0.2;

      // SM-2 calculations
      let ef = mastery.easinessFactor;
      let rep = mastery.repetitions;
      let interval = mastery.intervalDays;

      if (isCorrect) {
        // Quality rating q = 5
        if (rep === 0) {
          interval = 1;
        } else if (rep === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * ef);
        }
        rep += 1;
        ef = ef + (0.1 - (5 - 5) * (0.08 + (5 - 5) * 0.02)); // q = 5 -> ef increases by 0.1
      } else {
        // Quality rating q = 1
        rep = 0;
        interval = 1;
        ef = ef + (0.1 - (5 - 1) * (0.08 + (5 - 1) * 0.02)); // q = 1 -> ef drops by 0.54
      }

      if (ef < 1.3) ef = 1.3;
      const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

      await db
        .update(userTopicMastery)
        .set({
          attemptsCount: mastery.attemptsCount + 1,
          correctCount: mastery.correctCount + (isCorrect ? 1 : 0),
          accuracyEma: finalEma,
          easinessFactor: ef,
          repetitions: rep,
          intervalDays: interval,
          nextReviewAt: nextReview,
          lastAttemptedAt: new Date(),
        })
        .where(
          and(
            eq(userTopicMastery.userId, session.userId),
            eq(userTopicMastery.topicTag, topic)
          )
        );
    } else {
      // Initialize mastery
      finalEma = (isCorrect ? 1.0 : 0.0) * 0.2;
      let interval = 1;
      let rep = isCorrect ? 1 : 0;
      let ef = isCorrect ? 2.6 : 1.96; // base starting easiness factors depending on first try
      const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

      await db.insert(userTopicMastery).values({
        userId: session.userId,
        topicTag: topic,
        attemptsCount: 1,
        correctCount: isCorrect ? 1 : 0,
        accuracyEma: finalEma,
        easinessFactor: ef,
        repetitions: rep,
        intervalDays: interval,
        nextReviewAt: nextReview,
        lastAttemptedAt: new Date(),
      });
    }

    // 5. Update Daily Study Streak
    const todayStr = new Date().toISOString().split("T")[0];
    const userStreak = await db.query.streaks.findFirst({
      where: eq(streaks.userId, session.userId),
    });

    if (userStreak) {
      const lastDate = userStreak.lastActivityDate;
      let current = userStreak.currentStreak;
      let longest = userStreak.longestStreak;

      if (lastDate !== todayStr) {
        if (lastDate) {
          const lastActive = new Date(lastDate);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day
            current += 1;
          } else if (diffDays > 1) {
            // Broken streak
            current = 1;
          }
        } else {
          current = 1;
        }

        if (current > longest) {
          longest = current;
        }

        await db
          .update(streaks)
          .set({
            currentStreak: current,
            longestStreak: longest,
            lastActivityDate: todayStr,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, session.userId));
      }
    } else {
      await db.insert(streaks).values({
        userId: session.userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: todayStr,
      });
    }

    // 6. Manage Adaptivity override session cookie
    const cookieStore = await cookies();
    if (isCorrect) {
      // Clear force-focus on correct
      cookieStore.delete("mcq_failed_topic");
    } else {
      // Lock focus onto this weak subject on wrong answer
      cookieStore.set("mcq_failed_topic", topic, { maxAge: 60 * 15 }); // 15 mins lock
    }

    return NextResponse.json({
      isCorrect,
      correctOption: mcq.correctOption,
      explanation: mcq.explanation,
      accuracyEma: finalEma,
      oldEma: oldEma,
      topic,
    });
  } catch (error: any) {
    console.error("[MCQ Attempt API] Error registering attempt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
