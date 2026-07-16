import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, researchProjects, researchCollaborators, users } from "@mediverse/db";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/research
 * Lists research projects, most recent first, flagging which ones the
 * current user already collaborates on.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();
    const projects = await db.query.researchProjects.findMany({
      orderBy: [desc(researchProjects.createdAt)],
    });

    const myMemberships = await db.query.researchCollaborators.findMany({
      where: eq(researchCollaborators.userId, session.userId),
    });
    const myProjectIds = new Set(myMemberships.map((m: any) => m.projectId));

    const allUsers = await db.query.users.findMany();
    const userById = new Map<string, any>(allUsers.map((u: any) => [u.id, u]));

    const enriched = projects.map((p: any) => ({
      ...p,
      ownerName: userById.get(p.ownerId)?.name || "Researcher",
      isJoined: myProjectIds.has(p.id),
    }));

    return NextResponse.json({ projects: enriched });
  } catch (error: any) {
    console.error("[Research List API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/research
 * Creates a new research project. The creator becomes its owner and first
 * collaborator.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, abstract, tags, maxCollaborators } = await req.json();
    if (!title || !abstract) {
      return NextResponse.json({ error: "title and abstract are required" }, { status: 400 });
    }

    const db = createDb();
    const [project] = await db
      .insert(researchProjects)
      .values({
        ownerId: session.userId,
        title,
        abstract,
        tags: Array.isArray(tags) ? tags : [],
        maxCollaborators: typeof maxCollaborators === "number" ? maxCollaborators : 5,
      })
      .returning();

    if (!project) {
      return NextResponse.json({ error: "Failed to create research project" }, { status: 500 });
    }

    await db.insert(researchCollaborators).values({
      projectId: project.id,
      userId: session.userId,
      role: "owner",
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("[Research Create API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
