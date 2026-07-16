import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, jobListings, jobApplications } from "@mediverse/db";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

/**
 * POST /api/jobs/[jobId]/apply
 * Submits an in-app application to a job/internship listing. One
 * application per (job, user) — the schema enforces this with a unique
 * constraint as a defense-in-depth backstop to this check.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const { coverNote } = await req.json().catch(() => ({ coverNote: undefined }));

    const db = createDb();

    const job = await db.query.jobListings.findFirst({
      where: eq(jobListings.id, jobId),
    });
    if (!job || !job.isActive) {
      return NextResponse.json({ error: "Listing not found or no longer active" }, { status: 404 });
    }

    const existing = await db.query.jobApplications.findFirst({
      where: and(eq(jobApplications.jobId, jobId), eq(jobApplications.userId, session.userId)),
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied to this listing" }, { status: 409 });
    }

    const [application] = await db
      .insert(jobApplications)
      .values({
        jobId,
        userId: session.userId,
        coverNote: coverNote ?? null,
      })
      .returning();

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error("[Jobs Apply API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
