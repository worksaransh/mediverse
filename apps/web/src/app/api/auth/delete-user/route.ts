import { NextResponse } from "next/server";
import { createDb, users } from "@mediverse/db";
import { eq, or } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json(
        { error: "Phone number or email identifier is required" },
        { status: 400 }
      );
    }

    const db = createDb();

    // 1. Attempt to find the user by phone or email
    const cleanId = identifier.trim();
    const existingUser = await db.query.users.findFirst({
      where: or(
        eq(users.phone, cleanId),
        eq(users.email, cleanId)
      ),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "No user found with the provided identifier" },
        { status: 404 }
      );
    }

    // 2. Perform cascade delete in compliance with DPDP Right of Erasure
    await db.delete(users).where(eq(users.id, existingUser.id));

    console.log(`[DPDP Erasure] Deleted user ID ${existingUser.id} matching identifier "${cleanId}"`);

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
