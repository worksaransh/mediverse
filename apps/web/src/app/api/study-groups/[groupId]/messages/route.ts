import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, studyGroupMembers, studyGroupMessages, users } from "@mediverse/db";
import { eq, and, desc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ groupId: string }>;
}

async function requireMembership(db: ReturnType<typeof createDb>, groupId: string, userId: string) {
  return db.query.studyGroupMembers.findFirst({
    where: and(eq(studyGroupMembers.groupId, groupId), eq(studyGroupMembers.userId, userId)),
  });
}

/**
 * GET /api/study-groups/[groupId]/messages
 * Lists messages in a group, most recent last. Members-only.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const db = createDb();

    const membership = await requireMembership(db, groupId, session.userId);
    if (!membership) {
      return NextResponse.json({ error: "You must join this group to view messages" }, { status: 403 });
    }

    const messages = await db.query.studyGroupMessages.findMany({
      where: eq(studyGroupMessages.groupId, groupId),
      orderBy: [desc(studyGroupMessages.createdAt)],
    });

    const allUsers = await db.query.users.findMany();
    const userById = new Map<string, any>(allUsers.map((u: any) => [u.id, u]));

    const enriched = messages
      .slice()
      .reverse()
      .map((m: any) => ({
        ...m,
        authorName: userById.get(m.userId)?.name || "Student",
      }));

    return NextResponse.json({ messages: enriched });
  } catch (error: any) {
    console.error("[Study Group Messages GET API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/study-groups/[groupId]/messages
 * Posts a new message to the group. Members-only.
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const { content, replyToId } = await req.json();
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const db = createDb();

    const membership = await requireMembership(db, groupId, session.userId);
    if (!membership) {
      return NextResponse.json({ error: "You must join this group to post messages" }, { status: 403 });
    }

    const [message] = await db
      .insert(studyGroupMessages)
      .values({
        groupId,
        userId: session.userId,
        content: content.trim(),
        replyToId: replyToId ?? null,
      })
      .returning();

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error("[Study Group Messages POST API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
