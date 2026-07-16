import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mentorshipSessions, mentorProfiles, users } from "@mediverse/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/mentorship
 * Lists the authenticated user's mentorship sessions, both as a student
 * (sessions they requested) and as a mentor (sessions requested of them).
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();

    const asStudent = await db.query.mentorshipSessions.findMany({
      where: eq(mentorshipSessions.studentId, session.userId),
    });

    const myMentorProfile = await db.query.mentorProfiles.findFirst({
      where: eq(mentorProfiles.userId, session.userId),
    });

    const asMentor = myMentorProfile
      ? await db.query.mentorshipSessions.findMany({
          where: eq(mentorshipSessions.mentorId, myMentorProfile.id),
        })
      : [];

    const allUsers = await db.query.users.findMany();
    const userById = new Map<string, any>(allUsers.map((u: any) => [u.id, u]));
    const allMentorProfiles = await db.query.mentorProfiles.findMany();
    const mentorProfileById = new Map<string, any>(allMentorProfiles.map((m: any) => [m.id, m]));

    const enrich = (s: any, role: "student" | "mentor") => {
      const mentorProfile = mentorProfileById.get(s.mentorId);
      const mentorUser = mentorProfile ? userById.get(mentorProfile.userId) : null;
      const studentUser = userById.get(s.studentId);
      return {
        ...s,
        myRole: role,
        mentorName: mentorUser?.name || "Mentor",
        studentName: studentUser?.name || "Student",
      };
    };

    return NextResponse.json({
      asStudent: asStudent.map((s: any) => enrich(s, "student")),
      asMentor: asMentor.map((s: any) => enrich(s, "mentor")),
    });
  } catch (error: any) {
    console.error("[Mentorship List API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
