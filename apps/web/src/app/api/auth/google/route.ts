import { NextResponse } from "next/server";
import { createDb, users, profiles } from "@mediverse/db";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/session";
import { redis } from "@/lib/redis";
import * as jose from "jose";

/**
 * POST /api/auth/google
 * Verify Google ID token and log user in with Rate Limiting
 */
export async function POST(req: Request) {
  try {
    // 1. IP-based rate limiting (Max 10 Google auth requests/hour per IP)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const googleLimitKey = `rate:google:ip:${ip}`;
    
    const attempts = await redis.incr(googleLimitKey);
    if (attempts === 1) {
      await redis.expire(googleLimitKey, 3600); // 1 hour TTL
    }
    if (attempts > 10) {
      return NextResponse.json(
        { error: "Too many authentication requests. Please try again in an hour." },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const bodyText = await req.clone().text();
    let payloadJson: any = {};
    try {
      payloadJson = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { credential } = payloadJson;

    let email: string;
    let name: string;
    let googleId: string;
    let avatarUrl: string | null = null;

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;

    // 3. Perform Google OAuth token verification
    if (clientId && clientId !== "your_google_client_id") {
      if (!credential) {
        return NextResponse.json(
          { error: "OAuth credential token is required" },
          { status: 400 }
        );
      }

      console.log("[Auth] Verifying Google ID token signature and audience claims...");
      const JWKS = jose.createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
      
      const { payload } = await jose.jwtVerify(credential, JWKS, {
        issuer: ["accounts.google.com", "https://accounts.google.com"],
        audience: clientId,
      });

      email = payload.email as string;
      name = payload.name as string;
      googleId = payload.sub as string;
      avatarUrl = (payload.picture as string) || null;

      if (!email || !googleId || !name) {
        return NextResponse.json(
          { error: "Google token verification succeeded but returned incomplete profile info" },
          { status: 400 }
        );
      }
    } else {
      // Local development/test fallback mode (allows Playwright and mock UI to bypass remote call if not configured)
      console.warn("[Auth] GOOGLE_OAUTH_CLIENT_ID is not configured in .env. Using mock token fallback.");
      
      if (credential && credential.startsWith("eyJ")) {
        // Decode JWT claims unsafely for debugging/local testing
        const decoded = jose.decodeJwt(credential);
        email = decoded.email as string;
        name = decoded.name as string;
        googleId = decoded.sub as string;
        avatarUrl = (decoded.picture as string) || null;
      } else {
        // Allow fallback to direct request attributes for client mock logging page
        email = payloadJson.email;
        name = payloadJson.name;
        googleId = payloadJson.googleId;
        avatarUrl = payloadJson.avatarUrl || null;
      }

      if (!email || !googleId || !name) {
        return NextResponse.json(
          { error: "Required profile parameters (email, name, googleId) are missing" },
          { status: 400 }
        );
      }
    }

    const db = createDb();

    // 4. Find or create user
    let userRecord = await db.query.users.findFirst({
      where: or(eq(users.googleId, googleId), eq(users.email, email)),
    });

    if (!userRecord) {
      console.log(`[Auth] Creating new user record for verified Google email: ${email}`);
      const [newUser] = await db
        .insert(users)
        .values({
          name: name,
          email: email,
          googleId: googleId,
          avatarUrl: avatarUrl || undefined,
          role: "student",
          emailVerified: true,
          lastLoginAt: new Date(),
        })
        .returning();
      userRecord = newUser;
    } else {
      console.log(`[Auth] Existing user authenticated. Updating lastLoginAt for: ${userRecord.id}`);
      await db
        .update(users)
        .set({
          googleId: userRecord.googleId || googleId,
          avatarUrl: userRecord.avatarUrl || avatarUrl || undefined,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, userRecord.id));
    }

    if (!userRecord) {
      throw new Error("Failed to resolve authenticated Google user record");
    }

    // 5. Find or create profile record
    let profileRecord = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userRecord.id),
    });

    if (!profileRecord) {
      console.log(`[Auth] Initializing default profile for Google user: ${userRecord.id}`);
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

    // 6. Establish secure cookie session
    await createSession(userRecord.id);

    return NextResponse.json({
      success: true,
      onboardingCompleted: profileRecord.onboardingCompleted,
    });
  } catch (error: any) {
    console.error("[Auth] Google Login verification error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Google ID token signature is invalid or expired." },
      { status: 401 }
    );
  }
}
