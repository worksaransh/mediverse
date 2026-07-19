import { createDb } from "./client";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

// Manually load root .env file if it exists
try {
  const envPath = path.resolve(__dirname, "../../../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...values] = trimmed.split("=");
        process.env[key.trim()] = values.join("=").trim();
      }
    });
    console.log("[Diagnostics] Loaded environment variables from root .env");
  } else {
    console.log("[Diagnostics] No root .env file found at " + envPath);
  }
} catch (err: any) {
  console.warn("[Diagnostics] Error loading .env file:", err.message);
}

async function main() {
  console.log("Database URL configured:", process.env.DATABASE_URL ? "YES (masked)" : "NO");
  const db = createDb();
  
  const tables = {
    users: schema.users,
    profiles: schema.profiles,
    contentItems: schema.contentItems,
    mcqs: schema.mcqs,
    colleges: schema.colleges,
    streaks: schema.streaks,
    sources: schema.sources,
    subscriptions: schema.subscriptions,
    studyGroups: schema.studyGroups,
    studyGroupMembers: schema.studyGroupMembers,
    studyGroupMessages: schema.studyGroupMessages,
    mcqAttempts: schema.mcqAttempts,
    flashcardDecks: schema.flashcardDecks,
    flashcards: schema.flashcards,
    flashcardReviews: schema.flashcardReviews,
    quizSessions: schema.quizSessions,
    quizSessionQuestions: schema.quizSessionQuestions,
    leaderboardSnapshots: schema.leaderboardSnapshots,
    achievements: schema.achievements,
    userAchievements: schema.userAchievements,
    userXpLog: schema.userXpLog,
    announcements: schema.announcements,
    reports: schema.reports,
    waitlist: schema.waitlist,
    platformSettings: schema.platformSettings,
    mentorProfiles: schema.mentorProfiles,
    mentorshipSessions: schema.mentorshipSessions,
    jobListings: schema.jobListings,
    jobApplications: schema.jobApplications,
    researchProjects: schema.researchProjects,
    researchCollaborators: schema.researchCollaborators,
  };

  console.log("\n--- Table Count Audit ---");
  for (const [name, table] of Object.entries(tables)) {
    try {
      const nameInDb = (table as any)[Symbol.for("drizzle:Name")] || name;
      const countRes = await db.execute(`select count(*) as count from "${nameInDb}"`);
      const count = countRes[0]?.count || 0;
      console.log(`- ${name} ("${nameInDb}"): ${count} rows`);
    } catch (e: any) {
      console.log(`- ${name}: ERROR - ${e.message}`);
    }
  }
  
  // Also query if we are in Mock mode or Live mode
  const dbUrl = process.env.DATABASE_URL || "";
  const isMock = !dbUrl || dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl === "postgresql://user:password@localhost:5432/mediverse";
  console.log(`\nDatabase mode: ${isMock ? "Mock JSON File Fallback" : "Live Postgres Server"}`);

  process.exit(0);
}

main().catch(e => {
  console.error("Diagnostic execution failed:", e);
  process.exit(1);
});
