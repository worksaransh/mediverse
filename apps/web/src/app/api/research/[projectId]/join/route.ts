import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, researchProjects, researchCollaborators } from "@mediverse/db";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

/**
 * POST /api/research/[projectId]/join
 * Joins a research project as a collaborator, provided it is still
 * recruiting and has capacity.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const db = createDb();

    const project = await db.query.researchProjects.findFirst({
      where: eq(researchProjects.id, projectId),
    });
    if (!project) {
      return NextResponse.json({ error: "Research project not found" }, { status: 404 });
    }
    if (project.status !== "recruiting") {
      return NextResponse.json({ error: "This project is not currently recruiting" }, { status: 409 });
    }
    if (project.collaboratorCount >= project.maxCollaborators) {
      return NextResponse.json({ error: "This project has reached its collaborator limit" }, { status: 409 });
    }

    const existing = await db.query.researchCollaborators.findFirst({
      where: and(
        eq(researchCollaborators.projectId, projectId),
        eq(researchCollaborators.userId, session.userId),
      ),
    });
    if (existing) {
      return NextResponse.json({ error: "You are already a collaborator on this project" }, { status: 409 });
    }

    await db.insert(researchCollaborators).values({
      projectId,
      userId: session.userId,
      role: "collaborator",
    });

    await db
      .update(researchProjects)
      .set({ collaboratorCount: project.collaboratorCount + 1 })
      .where(eq(researchProjects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Research Join API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
