import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, jobListings } from "@mediverse/db";
import { eq, desc } from "drizzle-orm";

const VALID_TYPES = ["internship", "job", "research_assistantship"];

/**
 * GET /api/jobs
 * Lists active job/internship/research-assistantship listings, most
 * recent first. Supports an optional ?type= filter.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();
    const allActive = await db.query.jobListings.findMany({
      where: eq(jobListings.isActive, true),
      orderBy: [desc(jobListings.createdAt)],
    });

    const url = new URL(req.url);
    const typeFilter = url.searchParams.get("type");
    const listings =
      typeFilter && VALID_TYPES.includes(typeFilter)
        ? allActive.filter((j: any) => j.listingType === typeFilter)
        : allActive;

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("[Jobs List API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/jobs
 * Creates a new job/internship listing. Any authenticated user may post
 * (e.g. institutes, colleges, alumni) — this mirrors the platform's current
 * MVP approach elsewhere of not yet gating by organization role.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, organization, location, listingType, description, requirements, examTags, applicationUrl } =
      await req.json();

    if (!title || !organization || !description) {
      return NextResponse.json(
        { error: "title, organization, and description are required" },
        { status: 400 },
      );
    }

    const db = createDb();
    const [listing] = await db
      .insert(jobListings)
      .values({
        postedByUserId: session.userId,
        title,
        organization,
        location: location ?? null,
        listingType: VALID_TYPES.includes(listingType) ? listingType : "internship",
        description,
        requirements: requirements ?? null,
        examTags: Array.isArray(examTags) ? examTags : [],
        applicationUrl: applicationUrl ?? null,
      })
      .returning();

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    console.error("[Jobs Create API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
