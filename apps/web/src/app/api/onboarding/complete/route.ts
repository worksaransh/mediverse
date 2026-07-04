import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, profiles } from "@mediverse/db";
import { eq } from "drizzle-orm";
import { generateAIProfile } from "@mediverse/ai";
import { precomputeUserFeed } from "@/lib/feed-precompute";

/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete and generate AI Study Profile.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 },
      );
    }

    const { examTarget, currentYear, examTargetYear, examDate, weakSubjects } =
      await req.json();

    if (!examTarget || !currentYear || !examTargetYear || !examDate || !weakSubjects || !Array.isArray(weakSubjects)) {
      return NextResponse.json(
        { error: "Missing required onboarding parameters" },
        { status: 400 },
      );
    }

    const db = createDb();

    // 2. Generate personalized AI Study Profile
    console.log(`[AI] Invoking Anthropic Claude for user ${session.userId} profiling...`);
    const aiProfileData = await generateAIProfile({
      examTarget,
      currentYear,
      examTargetYear,
      examDate,
      weakSubjects,
    });

    // 3. Generate a subject-specific interest vector (768 dimensions)
    const interestVector = new Array(768).fill(0.02);
    if (weakSubjects.includes("Pharmacology")) {
      for (let i = 0; i < 150; i++) interestVector[i] = 0.8;
    }
    if (weakSubjects.includes("Pathology")) {
      for (let i = 150; i < 300; i++) interestVector[i] = 0.8;
    }
    if (weakSubjects.includes("Anatomy")) {
      for (let i = 300; i < 450; i++) interestVector[i] = 0.8;
    }
    if (weakSubjects.includes("Biochemistry")) {
      for (let i = 450; i < 600; i++) interestVector[i] = 0.8;
    }
    if (weakSubjects.includes("General Surgery")) {
      for (let i = 600; i < 750; i++) interestVector[i] = 0.8;
    }

    const finalProfileData = {
      ...aiProfileData,
      weak_subjects: weakSubjects,
    };

    // 4. Update database profile
    console.log(`[DB] Updating onboarding stats and saving AI profile for userId: ${session.userId}`);
    
    // Check if profile exists
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.userId),
    });

    if (existingProfile) {
      await db
        .update(profiles)
        .set({
          careerStage: "pg_prep", // Force career stage as requested
          examTargetYear: Number(examTargetYear),
          onboardingCompleted: true,
          aiProfile: finalProfileData,
          interestVector: interestVector,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, session.userId));
    } else {
      await db
        .insert(profiles)
        .values({
          userId: session.userId,
          careerStage: "pg_prep",
          examTargetYear: Number(examTargetYear),
          onboardingCompleted: true,
          aiProfile: finalProfileData,
          interestVector: interestVector,
        });
    }

    // 5. Precompute user discover feed candidates in Redis
    await precomputeUserFeed(session.userId);

    return NextResponse.json({ success: true, aiProfile: finalProfileData });
  } catch (error: any) {
    console.error("[Onboarding] Completion API error:", error);
    return NextResponse.json(
      { error: "Internal server error during onboarding completion" },
      { status: 500 },
    );
  }
}
