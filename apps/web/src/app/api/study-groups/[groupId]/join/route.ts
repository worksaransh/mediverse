import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, studyGroups, studyGroupMembers } from "@mediverse/db";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

/**
 * POST /api/study-groups/[groupId]/join
 * Joins a public study group. Private groups would require an invite code
 * (not yet exposed via this endpoint) — for now this covers the common
 * "browse public groups and join" flow.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const db = createDb();

    const group = await db.query.studyGroups.findFirst({
      where: eq(studyGroups.id, groupId),
    });
    if (!group) {
      return NextResponse.json({ error: "Study group not found" }, { status: 404 });
    }
    if (!group.isPublic) {
      return NextResponse.json({ error: "This group is private" }, { status: 403 });
    }
    if (group.memberCount >= group.maxMembers) {
      return NextResponse.json({ error: "This group is full" }, { status: 409 });
    }

    const existingMembership = await db.query.studyGroupMembers.findFirst({
      where: and(
        eq(studyGroupMembers.groupId, groupId),
        eq(studyGroupMembers.userId, session.userId),
      ),
    });
    if (existingMembership) {
      return NextResponse.json({ error: "You have already joined this group" }, { status: 409 });
    }

    await db.insert(studyGroupMembers).values({
      groupId,
      userId: session.userId,
      role: "member",
    });

    await db
      .update(studyGroups)
      .set({ memberCount: group.memberCount + 1 })
      .where(eq(studyGroups.id, groupId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Study Groups Join API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
