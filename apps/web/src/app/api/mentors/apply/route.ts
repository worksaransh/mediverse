import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, mentorProfiles } from "@mediverse/db";
import { eq } from "drizzle-orm";

/**
 * POST /api/mentors/apply
 * Registers the authenticated user as a mentor. Idempotent — if the user
 * already has a mentor profile, it is reactivated with updated details
 * rather than duplicated.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { specialization, bio, yearsExperience } = await req.json();
    if (!specialization || typeof specialization !== "string") {
      return NextResponse.json({ error: "specialization is required" }, { status: 400 });
    }

    const db = createDb();

    const existing = await db.query.mentorProfiles.findFirst({
      where: eq(mentorProfiles.userId, session.userId),
    });

    if (existing) {
      const [updated] = await db
        .update(mentorProfiles)
        .set({
          specialization,
          bio: bio ?? existing.bio,
          yearsExperience: typeof yearsExperience === "number" ? yearsExperience : existing.yearsExperience,
          isActive: true,
        })
        .where(eq(mentorProfiles.id, existing.id))
        .returning();
      return NextResponse.json({ mentorProfile: updated });
    }

    const [created] = await db
      .insert(mentorProfiles)
      .values({
        userId: session.userId,
        specialization,
        bio: bio ?? null,
        yearsExperience: typeof yearsExperience === "number" ? yearsExperience : 0,
      })
      .returning();

    return NextResponse.json({ mentorProfile: created }, { status: 201 });
  } catch (error: any) {
    console.error("[Mentor Apply API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
