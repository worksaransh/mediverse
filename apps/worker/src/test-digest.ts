import { composeDailyDigest } from "./digest-composer";
import { createDb, users, profiles, streaks } from "@mediverse/db";
import { eq } from "drizzle-orm";

async function runTests() {
  console.log("--> Initializing test database state for Notification Digest verification");
  const db = createDb();

  // 1. Create User A (Pharmacology weak focus)
  const userIdA = "test-user-a-uuid";
  const userA = await db.query.users.findFirst({ where: eq(users.id, userIdA) });
  if (!userA) {
    await db.insert(users).values({
      id: userIdA,
      phoneNumber: "9876549901",
      email: "pharmacology-student@mediverse.edu",
    });
    await db.insert(profiles).values({
      userId: userIdA,
      examTarget: "neet_pg",
      careerStage: "intern",
      examTargetYear: 2027,
      aiProfile: { weak_subjects: ["Pharmacology"] },
    });
    await db.insert(streaks).values({
      userId: userIdA,
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: "2026-07-03", // Yesterday, streak active but needs nudge today
    });
  }

  // 2. Create User B (Pathology weak focus)
  const userIdB = "test-user-b-uuid";
  const userB = await db.query.users.findFirst({ where: eq(users.id, userIdB) });
  if (!userB) {
    await db.insert(users).values({
      id: userIdB,
      phoneNumber: "9876549902",
      email: "pathology-student@mediverse.edu",
    });
    await db.insert(profiles).values({
      userId: userIdB,
      examTarget: "neet_pg",
      careerStage: "post_intern",
      examTargetYear: 2027,
      aiProfile: { weak_subjects: ["Pathology"] },
    });
    await db.insert(streaks).values({
      userId: userIdB,
      currentStreak: 0,
      longestStreak: 2,
      lastActivityDate: "2026-07-01",
    });
  }

  console.log("--> Seeding complete. Executing tests...\n");

  // TEST 1: Compose digest during active hours (12:00 PM) for User A
  console.log("--- TEST 1: Active hours (12:00 PM) User A (Pharmacology Focus) ---");
  const digestA = await composeDailyDigest(userIdA, 12);
  console.log("Result A:", digestA);
  if (!digestA.sent) throw new Error("Test 1 failed: Digest should be sent at 12:00 PM");
  if (!digestA.digestText.toLowerCase().includes("pharmacology")) {
    throw new Error("Test 1 failed: Digest should contain Pharmacology keywords");
  }
  if (!digestA.nudgeText || !digestA.nudgeText.includes("3-day streak")) {
    throw new Error("Test 1 failed: User A should receive streak nudge");
  }

  // TEST 2: Compose digest during active hours (12:00 PM) for User B
  console.log("\n--- TEST 2: Active hours (12:00 PM) User B (Pathology Focus) ---");
  const digestB = await composeDailyDigest(userIdB, 12);
  console.log("Result B:", digestB);
  if (!digestB.sent) throw new Error("Test 2 failed: Digest should be sent at 12:00 PM");
  if (!digestB.digestText.toLowerCase().includes("pathology")) {
    throw new Error("Test 2 failed: Digest should contain Pathology keywords");
  }
  
  // Verify personalization difference
  if (digestA.digestText === digestB.digestText) {
    throw new Error("Test 2 failed: User A and User B digests should be different and personalized");
  }
  console.log("✓ Verified that User A and User B receive visibly different personalized digests.");

  // TEST 3: Compose digest during quiet hours (11:00 PM)
  console.log("\n--- TEST 3: Quiet Hours Block (11:00 PM / hour 23) ---");
  const quietDigest = await composeDailyDigest(userIdA, 23);
  console.log("Quiet Hour Result:", quietDigest);
  if (quietDigest.sent) {
    throw new Error("Test 3 failed: Digest should NOT be sent during quiet hours (11:00 PM)");
  }
  if (quietDigest.reason !== "Quiet hours active") {
    throw new Error("Test 3 failed: Reason should state quiet hours are active");
  }
  console.log("✓ Verified that digests respect quiet hours successfully.");

  console.log("\n--> ALL DAILY DIGEST NOTIFICATION TESTS PASSED SUCCESSFULLY! <--\n");
}

runTests().catch((e) => {
  console.error("❌ TEST RUN FAILED:", e);
  process.exit(1);
});
