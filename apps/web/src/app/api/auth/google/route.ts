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
  return NextResponse.json(
    { error: "Social login is disabled in Phase 1. Please authenticate using Email/Password or Phone OTP." },
    { status: 403 }
  );
}
