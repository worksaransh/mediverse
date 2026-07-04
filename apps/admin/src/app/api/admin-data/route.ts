import { NextResponse } from "next/server";
import { createDb, contentItems, users, profiles, streaks, aiMessages } from "@mediverse/db";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin-data
 * Returns all dashboard metrics, tables, and ingestion lists.
 */
export async function GET() {
  try {
    const adminUser = await verifyAdminSession();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const db = createDb();

    // 1. Fetch content items (review queue)
    const items = await db.query.contentItems.findMany({
      orderBy: [desc(contentItems.createdAt)],
    });

    // 2. Fetch users and profiles
    const usersList = await db.query.users.findMany();
    const profilesList = await db.query.profiles.findMany();
    const streaksList = await db.query.streaks.findMany();

    const formattedUsers = usersList.map((u: any) => {
      const p = profilesList.find((prof: any) => prof.userId === u.id);
      const s = streaksList.find((strk: any) => strk.userId === u.id);
      return {
        id: u.id,
        email: u.email || "no-email@mediverse.edu",
        phoneNumber: u.phoneNumber || "No Phone",
        examTarget: p?.examTarget || "neet_pg",
        careerStage: p?.careerStage || "Student",
        streak: s?.currentStreak || 0,
        lastActivity: s?.lastActivityDate || "—",
      };
    });

    // 3. Fetch flagged messages
    const flagged = await db.query.aiMessages.findMany({
      where: eq(aiMessages.flagged, true),
      orderBy: [desc(aiMessages.createdAt)],
    });

    // 4. Compute stats summary
    const draftCount = items.filter((i: any) => i.status === "draft").length;
    const publishedCount = items.filter((i: any) => i.status === "published").length;
    const totalUsers = formattedUsers.length;
    const flaggedCount = flagged.length;

    // 5. Ingestion tracking mock stats
    const ingestionSources = [
      {
        source: "PubMed Clinical Lit",
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
        status: "success",
        successCount: 42,
        failureCount: 0,
      },
      {
        source: "Semantic Scholar RAG",
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24h ago
        status: "success",
        successCount: 15,
        failureCount: 1,
      },
      {
        source: "YouTube Medical Ingestion",
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        status: "success",
        successCount: 8,
        failureCount: 0,
      },
    ];

    return NextResponse.json({
      contentItems: items,
      users: formattedUsers,
      flaggedMessages: flagged,
      stats: {
        draftCount,
        publishedCount,
        totalUsers,
        flaggedCount,
      },
      ingestionSources,
    });

  } catch (error: any) {
    console.error("[Admin Data API] Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
