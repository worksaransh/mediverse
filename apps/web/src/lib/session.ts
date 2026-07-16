import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error(
    "JWT_SECRET environment variable must be set. Refusing to start with an insecure default secret.",
  );
}
const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(session: string | undefined): Promise<any> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });
  
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  const cookieStore = await cookies();
  
  cookieStore.set("mediverse_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !isLocal,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mediverse_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async funct