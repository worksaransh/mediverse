import { NextResponse } from "next/server";
import { createDb, users, profiles } from "@mediverse/db";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/session";

/**
 * POST /api/auth/google
 * Mock / Real Google OAuth callback handler
 */
export async function POST(req: Request) {
  try {
    const { email, name, googleId, avatarUrl } = await req.json();
    if (!email || !googleId || !name) {
      return NextResponse.json(
        { error: "Email, name, and googleId are required" },
        { status: 400 },
      );
    }

    const db = createDb();

    // 1. Find or create user
    let userRecord = await db.query.users.findFirst({
      where: or(eq(users.googleId, googleId), eq(users.email, email)),
    });

    if (!userRecord) {
      console.log(`[Auth] Creating new user record for Google login: ${email}`);
      const [newUser] = await db
        .insert(users)
        .values({
          name: name,
          email: email,
          googleId: googleId,
          avatarUrl: avatarUrl || undefined,
          role: "student",
          emailVerified: true,
          lastLoginAt: new Date(),
        })
        .returning();
      userRecord = newUser;
    } else {
      console.log(`[Auth] Existing user found. Updating googleId and lastLoginAt for id: ${userRecord.id}`);
      await db
        .update(users)
        .set({
          googleId: userRecord.googleId || googleId,
          avatarUrl: userRecord.avatarUrl || avatarUrl || undefined,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, userRecord.id));
    }

    if (!userRecord) {
      throw new Error("Failed to resolve user record.");
    }

    // 2. Find or create profile record
    let profileRecord = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userRecord.id),
    });

    if (!profileRecord) {
      console.log(`[Auth] Initializing profile for Google authenticated user: ${userRecord.id}`);
      const [newProfile] = await db
        .insert(profiles)
        .values({
          userId: userRecord.id,
          careerStage: "pg_prep",
          onboardingCompleted: false,
        })
        .returning();
      profileRecord = newProfile;
    }

    // 3. Set session
    await createSession(userRecord.id);

    return NextResponse.json({
      success: true,
      onboardingCompleted: profileRecord.onboardingCompleted,
    });
  } catch (error: any) {
    console.error("[Auth] Google Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
