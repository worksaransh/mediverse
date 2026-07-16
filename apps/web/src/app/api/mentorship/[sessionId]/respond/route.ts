import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mentorshipSessions, mentorProfiles } from "@mediverse/db";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const MENTOR_ACTIONS = new Set(["confirm", "decline", "complete"]);
const STUDENT_ACTIONS = new Set(["cancel", "rate"]);

/**
 * POST /api/mentorship/[sessionId]/respond
 * Drives the mentorship session state machine:
 *   requested -> confirmed | declined   (mentor only)
 *   confirmed -> completed             (mentor only)
 *   requested | confirmed -> cancelled (student only)
 *   completed -> rated (studentRating set, mentor rating aggregate updated) (student only)
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const { action, scheduledAt, rating } = await req.json();

    const db = createDb();

    const mentorshipSession = await db.query.mentorshipSessions.findFirst({
      where: eq(mentorshipSessions.id, sessionId),
    });
    if (!mentorshipSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const mentorProfile = await db.query.mentorProfiles.findFirst({
      where: eq(mentorProfiles.id, mentorshipSession.mentorId),
    });
    if (!mentorProfile) {
      return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
    }

    const isMentor = mentorProfile.userId === session.userId;
    const isStudent = mentorshipSession.studentId === session.userId;
    if (!isMentor && !isStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (MENTOR_ACTIONS.has(action) && !isMentor) {
      return NextResponse.json({ error: "Only the mentor can perform this action" }, { status: 403 });
    }
    if (STUDENT_ACTIONS.has(action) && !isStudent) {
      return NextResponse.json({ error: "Only the student can perform this action" }, { status: 403 });
    }

    if (action === "confirm") {
      if (mentorshipSession.status !== "requested") {
        return NextResponse.json({ error: "Only a requested session can be confirmed" }, { status: 409 });
      }
      const [updated] = await db
        .update(mentorshipSessions)
        .set({ status: "confirmed", scheduledAt: scheduledAt ? new Date(scheduledAt) : null })
        .where(eq(mentorshipSessions.id, sessionId))
        .returning();
      return NextResponse.json({ session: updated });
    }

    if (action === "decline") {
      if (mentorshipSession.status !== "requested") {
        return NextResponse.json({ error: "Only a requested session can be declined" }, { status: 409 });
      }
      const [updated] = await db
        .update(mentorshipSessions)
        .set({ status: "declined" })
        .where(eq(mentorshipSessions.id, sessionId))
        .returning();
      return NextResponse.json({ session: updated });
    }

    if (action === "complete") {
      if (mentorshipSession.status !== "confirmed") {
        return NextResponse.json({ error: "Only a confirmed session can be completed" }, { status: 409 });
      }
      const [updated] = await db
        .update(mentorshipSessions)
        .set({ status: "completed" })
        .where(eq(mentorshipSessions.id, sessionId))
        .returning();
      await db
        .update(mentorProfiles)
        .set({ sessionCount: mentorProfile.sessionCount + 1 })
        .where(eq(mentorProfiles.id, mentorProfile.id));
      return NextResponse.json({ session: updated });
    }

    if (action === "cancel") {
      if (mentorshipSession.status === "completed" || mentorshipSession.status === "cancelled") {
        return NextResponse.json({ error: "This session can no longer be cancelled" }, { status: 409 });
      }
      const [updated] = await db
        .update(mentorshipSessions)
        .set({ status: "cancelled" })
        .where(eq(mentorshipSessions.id, sessionId))
        .returning();
      return NextResponse.json({ session: updated });
    }

    if (action === "rate") {
      if (mentorshipSession.status !== "completed") {
        return NextResponse.json({ error: "Only a completed session can be rated" }, { status: 409 });
      }
      if (mentorshipSession.studentRating !== null) {
        return NextResponse.json({ error: "This session has already been rated" }, { status: 409 });
      }
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "rating must be an integer between 1 and 5" }, { status: 400 });
      }
      const [updated] = await db
        .update(mentorshipSessions)
        .set({ studentRating: rating })
        .where(eq(mentorshipSessions.id, sessionId))
        .returning();
      await db
        .update(mentorProfiles)
        .set({
          ratingSum: mentorProfile.ratingSum + rating,
          ratingCount: mentorProfile.ratingCount + 1,
        })
        .where(eq(mentorProfiles.id, mentorProfile.id));
      return NextResponse.json({ session: updated });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (error: any) {
    console.error("[Mentorship Respond API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
