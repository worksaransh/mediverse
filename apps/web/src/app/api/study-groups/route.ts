import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, studyGroups, studyGroupMembers } from "@mediverse/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/study-groups
 * List all study groups, flagging which ones the current student has joined.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();

    // Fetch all study groups
    const groups = await db.query.studyGroups.findMany() || [];

    // Fetch current user's memberships
    const memberships = await db.query.studyGroupMembers.findMany({
      where: eq(studyGroupMembers.userId, session.userId),
    }) || [];

    const joinedGroupIds = new Set(memberships.map((m: any) => m.groupId));

    // Map groups with joined flag
    const groupsWithStatus = groups.map((g: any) => ({
      ...g,
      isJoined: joinedGroupIds.has(g.id),
      role: memberships.find((m: any) => m.groupId === g.id)?.role || null,
    }));

    return NextResponse.json({ groups: groupsWithStatus });
  } catch (error: any) {
    console.error("[Study Groups API] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/study-groups
 * Create a new study group. The creator is registered as owner.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, examTarget, isPublic } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const db = createDb();

    // Create unique 6-character invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Insert group
    const [newGroup] = await db.insert(studyGroups).values({
      name: name.trim(),
      description: description?.trim() || null,
      examTarget: examTarget?.trim() || null,
      ownerId: session.userId,
      inviteCode,
      isPublic: isPublic !== false,
      maxMembers: 50,
      memberCount: 1,
    }).returning();

    if (!newGroup) {
      throw new Error("Failed to create study group");
    }

    // Insert owner member record
    await db.insert(studyGroupMembers).values({
      groupId: newGroup.id,
      userId: session.userId,
      role: "owner",
    });

    return NextResponse.json({ group: { ...newGroup, isJoined: true, role: "owner" } }, { status: 201 });
  } catch (error: any) {
    console.error("[Study Groups API] POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
