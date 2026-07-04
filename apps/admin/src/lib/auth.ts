import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createDb, users } from "@mediverse/db";
import { eq } from "drizzle-orm";

const SECRET_KEY = process.env.JWT_SECRET || "mediverse-super-secret-key-1234567890";
const key = new TextEncoder().encode(SECRET_KEY);

export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mediverse_session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const userId = payload.userId as string;
    if (!userId) return null;

    const db = createDb();
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userRecord) return null;
    return userRecord;
  } catch (error) {
    console.error("[verifyAdminSession] Authentication failed:", error);
    return null;
  }
}
