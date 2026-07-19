import { NextResponse } from "next/server";
import { createDb, users, profiles } from "@mediverse/db";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/session";
import { redis } from "@/lib/redis";
import crypto from "crypto";

// Secure PBKDF2/scrypt helper for password hashing (no external dependencies)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, originalHash] = stored.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}

/**
 * POST /api/auth/email
 * Handle Email & Password Signup & Login
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const body = await req.json();
    const { action, email, password, name } = body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    const db = createDb();

    if (action === "signup") {
      // 1. Rate limiting check (Max 5 signups per IP per hour)
      const signupLimitKey = `rate:email:signup:${ip}`;
      const isLimited = await redis.checkSlidingWindowLimit(signupLimitKey, 5, 3600);
      if (isLimited) {
        return NextResponse.json(
          { error: "Too many registration attempts. Please try again in an hour." },
          { status: 429 }
        );
      }

      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name is required for registration" }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
      }

      // 2. Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, cleanEmail),
      });

      if (existingUser) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

      // 3. Create user
      const passwordHash = hashPassword(password);
      const [newUser] = await db
        .insert(users)
        .values({
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role: "student",
          emailVerified: true, // Auto-verified for simplicity in Phase 1
          lastLoginAt: new Date(),
        })
        .returning();

      // 4. Initialize empty profile record
      const [profileRecord] = await db
        .insert(profiles)
        .values({
          userId: newUser.id,
          careerStage: "pg_prep",
          onboardingCompleted: false,
        })
        .returning();

      // 5. Establish secure session cookie
      await createSession(newUser.id);

      return NextResponse.json({
        success: true,
        onboardingCompleted: profileRecord.onboardingCompleted,
      });

    } else if (action === "login") {
      // 1. Rate limiting check (Max 10 login attempts per IP per hour)
      const loginLimitKey = `rate:email:login:${ip}`;
      const isLimited = await redis.checkSlidingWindowLimit(loginLimitKey, 10, 3600);
      if (isLimited) {
        return NextResponse.json(
          { error: "Too many login attempts. Please try again in an hour." },
          { status: 429 }
        );
      }

      // 2. Query user by email
      const userRecord = await db.query.users.findFirst({
        where: eq(users.email, cleanEmail),
      });

      if (!userRecord || !userRecord.passwordHash) {
        // Generic failure message for security
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // 3. Verify password
      const isValid = verifyPassword(password, userRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // 4. Resolve profile
      let profileRecord = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userRecord.id),
      });

      if (!profileRecord) {
        const [newProfile] = await db
          .insert(profiles)
          .values({
            userId: userRecord.id,
            careerStage: "pg_prep",
            onboardingCompleted: false,
          })
          .returning();
        profileRecord = newProfile;
      }

      // 5. Update lastLoginAt
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, userRecord.id));

      // 6. Establish secure session cookie
      await createSession(userRecord.id);

      return NextResponse.json({
        success: true,
        onboardingCompleted: profileRecord.onboardingCompleted,
      });

    } else {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Auth] Email login/signup handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
