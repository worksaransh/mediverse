// Runs before any test file is loaded. Several modules (e.g. src/lib/session.ts)
// fail fast at import time if required env vars are missing, since that's the
// correct production behavior (see the JWT_SECRET fail-fast check). Tests need a
// value present so those modules can be imported at all; this is a fixed
// test-only value and is never used outside this vitest process.
process.env.JWT_SECRET ||= "test-only-secret-do-not-use-in-production-1234567890";
