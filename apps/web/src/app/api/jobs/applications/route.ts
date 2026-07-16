import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, jobApplications, jobListings } from "@mediverse/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/jobs/applications
 * Lists the authenticated user's own job applications, with the listing
 * details attached for display.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();
    const applications = await db.query.jobApplications.findMany({
      where: eq(jobApplications.userId, session.userId),
    });

    const allListings = await db.query.jobListings.findMany();
    const listingById = new Map(allListings.map((j: any) => [j.id, j]));

    const enriched = applications.map((a: any) => ({
      ...a,
      listing: listingById.get(a.jobId) || null,
    }));

    return NextResponse.json({ applications: enriched });
  } catch (error: any) {
    console.error("[Jobs Applications API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
