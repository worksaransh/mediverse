import { NextResponse } from "next/server";
import { createDb, users } from "@mediverse/db";
import { eq } from "drizzle-orm";
import { getSession, deleteSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the caller — only the logged-in user may delete their own account
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = createDb();

    // 2. Resolve the authenticated user's own record
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, session.userId as string),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "No user found for the current session" },
        { status: 404 }
      );
    }

    // 3. Perform cascade delete in compliance with DPDP Right of Erasure
    await db.delete(users).where(eq(users.id, existingUser.id));

    console.log(`[DPDP Erasure] Deleted user ID ${existingUser.id} (self-requested account deletion)`);

    // 4. Clear the now-invalid session cookie
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: "Your account and all associated profile, study, and learning data have been permanently erased from our records.",
    });
  } catch (error: any) {
    console.error("[DPDP Erasure API] Error processing delete request:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing deletion" },
      { status: 500 }
    );
  }
}
