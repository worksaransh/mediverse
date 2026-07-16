import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./session";

// Scope note: this file tests `encrypt`/`decrypt` — the actual JWT signing/verification
// logic, which is the security-critical part of this module (and was directly involved
// in a prior security fix: removing a hardcoded JWT secret fallback). `createSession`,
// `getSession`, and `deleteSession` additionally call Next.js's `cookies()`/`headers()`
// from "next/headers", which require a real request-scoped server context that isn't
// practical to faithfully emulate in plain vitest without heavy mocking that would test
// the mock more than the real behavior. Those three are left uncovered here deliberately;
// encrypt/decrypt round-tripping correctly is what actually protects against session
// forgery, and that's what's exercised below.
//
// vitest.setup.ts sets a fixed JWT_SECRET before this file is imported, since the module
// throws at import time otherwise (correct production behavior for a missing secret).

describe("encrypt / decrypt", () => {
  it("round-trips a userId through encrypt then decrypt", async () => {
    const token = await encrypt({ userId: "user-123", expiresAt: new Date() });
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // header.payload.signature — a real JWT shape

    const payload = await decrypt(token);
    expect(payload).not.toBeNull();
    expect(payload.userId).toBe("user-123");
  });

  it("produces different tokens for different userIds", async () => {
    const tokenA = await encrypt({ userId: "user-aaa", expiresAt: new Date() });
    const tokenB = await encrypt({ userId: "user-bbb", expiresAt: new Date() });
    expect(tokenA).not.toBe(tokenB);

    const payloadA = await decrypt(tokenA);
    const payloadB = await decrypt(tokenB);
    expect(payloadA.userId).toBe("user-aaa");
    expect(payloadB.userId).toBe("user-bbb");
  });

  it("returns null for undefined input instead of throwing", async () => {
    const result = await decrypt(undefined);
    expect(result).toBeNull();
  });

  it("returns null for an empty string instead of throwing", async () => {
    const result = await decrypt("");
    expect(result).toBeNull();
  });

  it("returns null for a garbage/malformed token instead of throwing", async () => {
    const result = await decrypt("not.a.validjwt");
    expect(result).toBeNull();
  });

  it("rejects a tampered token — flips the signature/payload and confirms it no longer verifies", async () => {
    const token = await encrypt({ userId: "user-456", expiresAt: new Date() });

    // Flip a character inside the payload segment (the middle part of header.payload.signature)
    // to simulate someone trying to forge a different userId into an existing token.
    const parts = token.split(".");
    const tamperedPayload =
      parts[1].slice(0, -1) + (parts[1].slice(-1) === "A" ? "B" : "A");
    const tamperedToken = [parts[0], tamperedPayload, parts[2]].join(".");

    const result = await decrypt(tamperedToken);
    expect(result).toBeNull();
  });

  it("rejects a token signed with a different secret (simulates the pre-fix hardcoded-fallback scenario)", async () => {
    // This directly exercises the security property the JWT_SECRET fail-fast fix protects:
    // a token forged with a different/guessed secret must not verify against this app's real key.
    const { SignJWT } = await import("jose");
    const wrongKey = new TextEncoder().encode("a-completely-different-secret-an-attacker-might-guess");
    const forgedToken = await new SignJWT({ userId: "attacker-controlled-id" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(wrongKey);

    const result = await decrypt(forgedToken);
    expect(result).toBeNull();
  });
});
