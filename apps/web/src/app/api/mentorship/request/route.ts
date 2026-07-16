import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mentorshipSessions, mentorProfiles } from "@mediverse/db";
import { eq } from "drizzle-orm";

/**
 * POST /api/mentorship/request
 * A student requests a mentorship session with a given mentor.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mentorId, topic, message } = await req.json();
    if (!mentorId || typeof mentorId !== "string") {
      return NextResponse.json({ error: "mentorId is required" }, { status: 400 });
    }

    const db = createDb();

    const mentor = await db.query.mentorProfiles.findFirst({
      where: eq(mentorProfiles.id, mentorId),
    });
    if (!mentor || !mentor.isActive) {
      return NextResponse.json({ error: "Mentor not found or inactive" }, { status: 404 });
    }

    if (mentor.userId === session.userId) {
      return NextResponse.json({ error: "You cannot request a session with yourself" }, { status: 400 });
    }

    const [created] = await db
      .insert(mentorshipSessions)
      .values({
        mentorId: mentor.id,
        studentId: session.userId,
        topic: topic ?? null,
        message: message ?? null,
        status: "requested",
      })
      .returning();

    return NextResponse.json({ session: created }, { status: 201 });
  } catch (error: any) {
    console.error("[Mentorship Request API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
