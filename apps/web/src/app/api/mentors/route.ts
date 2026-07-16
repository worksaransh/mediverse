import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mentorProfiles, users } from "@mediverse/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/mentors
 * Lists active mentors with basic profile info for students to browse.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();
    const activeMentors = await db.query.mentorProfiles.findMany({
      where: eq(mentorProfiles.isActive, true),
    });

    const allUsers = await db.query.users.findMany();
    const userById = new Map<string, any>(allUsers.map((u: any) => [u.id, u]));

    const mentors = activeMentors.map((m: any) => {
      const user = userById.get(m.userId);
      return {
        id: m.id,
        userId: m.userId,
        name: user?.name || "Mediverse Mentor",
        specialization: m.specialization,
        bio: m.bio,
        yearsExperience: m.yearsExperience,
        sessionCount: m.sessionCount,
        averageRating: m.ratingCount > 0 ? Math.round((m.ratingSum / m.ratingCount) * 10) / 10 : null,
      };
    });

    return NextResponse.json({ mentors });
  } catch (error: any) {
    console.error("[Mentors List API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
