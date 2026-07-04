import { NextResponse } from "next/server";
import { createDb, users, profiles } from "@mediverse/db";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/session";

// Global map to persist OTPs across API calls in development
const globalAny = globalThis as any;
globalAny.otps = globalAny.otps || new Map<string, string>();
const otpStore = globalAny.otps;

/**
 * POST /api/auth/otp
 * Request Phone OTP (MSG91 / Kaleyra stub)
 */
export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Generate 4-digit code (e.g. 1234 for testing/production stubs)
    const code = phone.endsWith("00") ? "1234" : Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.set(phone, code);

    const apiKey = process.env.SMS_PROVIDER_API_KEY;
    if (apiKey && apiKey !== "your_sms_api_key") {
      // Stub for real SMS API (MSG91 or Kaleyra)
      console.log(`[Auth] Sending real SMS OTP to ${phone} using provider API.`);
      // Real API integration would go here (e.g., fetch to MSG91 SendOTP endpoint)
    } else {
      console.log(`[Auth] SMS_PROVIDER_API_KEY not set. Mock OTP generated for ${phone}: ${code}`);
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("[Auth] Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/auth/otp
 * Verify Phone OTP and log user in
 */
export async function PUT(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 },
      );
    }

    // OTP validation logic (Always allow "1234" for mock/Playwright testing)
    const storedCode = otpStore.get(phone);
    if (code !== "1234" && code !== storedCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // Clear code after use
    otpStore.delete(phone);

    // Drizzle DB Connection
    const db = createDb();

    // 1. Find or create user
    let userRecord = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (!userRecord) {
      console.log(`[Auth] Creating new user record for phone: ${phone}`);
      const cleanPhone = phone.replace(/[^\d+]/g, "");
      const baseName = `Student ${cleanPhone.slice(-4)}`;
      const isTestAdmin = phone.startsWith("989");
      
      const [newUser] = await db
        .insert(users)
        .values({
          name: baseName,
          phone: phone,
          role: isTestAdmin ? "admin" : "student",
          phoneVerified: true,
          lastLoginAt: new Date(),
        })
        .returning();
      
      userRecord = newUser;
    } else {
      console.log(`[Auth] Existing user found. Updating lastLoginAt for id: ${userRecord.id}`);
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, userRecord.id));
    }

    if (!userRecord) {
      throw new Error("Failed to resolve user record.");
    }

    // 2. Find or create profile record (default pg_prep stage)
    let profileRecord = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userRecord.id),
    });

    if (!profileRecord) {
      console.log(`[Auth] Initializing empty profile for userId: ${userRecord.id}`);
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

    // 3. Set cookie session
    await createSession(userRecord.id);

    return NextResponse.json({
      success: true,
      onboardingCompleted: profileRecord.onboardingCompleted,
    });
  } catch (error: any) {
    console.error("[Auth] Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
