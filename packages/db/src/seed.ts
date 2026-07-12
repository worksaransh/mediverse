/**
 * Seed script — populates a fresh Mediverse DB with test data.
 *
 * Run: pnpm db:seed
 * Requires DATABASE_URL in environment.
 */

import { sql } from "drizzle-orm";
import { createDb } from "./client";
import {
  users,
  profiles,
  colleges,
  streaks,
  sources,
  contentItems,
  mcqs,
  subscriptions,
  studyGroups,
  studyGroupMembers,
  studyGroupMessages,
} from "./schema";

async function seed() {
  const db = createDb();

  console.log("🌱  Seeding Mediverse database…\n");

  console.log("🧹  Cleaning up existing test data…");
  try {
    await db.execute(sql`TRUNCATE TABLE users, colleges, sources, achievements, organizations CASCADE;`);
    console.log("🧹  Cleanup complete.\n");
  } catch (cleanError) {
    console.warn("⚠️  Cleanup warning (some tables may not exist or be empty):", cleanError);
  }

  /* ─── Colleges ──────────────────────────── */

  const [aiims, cmc, grant, maulana, kem] = await db
    .insert(colleges)
    .values([
      { name: "AIIMS New Delhi", city: "New Delhi", state: "Delhi", university: "AIIMS", tier: "tier_1" },
      { name: "Christian Medical College", city: "Vellore", state: "Tamil Nadu", university: "CMC Vellore", tier: "tier_1" },
      { name: "Grant Medical College", city: "Mumbai", state: "Maharashtra", university: "MUHS", tier: "tier_1" },
      { name: "Maulana Azad Medical College", city: "New Delhi", state: "Delhi", university: "Delhi University", tier: "tier_1" },
      { name: "KEM Hospital", city: "Mumbai", state: "Maharashtra", university: "MUHS", tier: "tier_1" },
    ])
    .returning();

  console.log(`  ✅ ${5} colleges inserted`);

  /* ─── Users ─────────────────────────────── */

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Dr. Ananya Sharma",
        email: "ananya@test.mediverse.in",
        phone: "+919876543210",
        role: "student",
        emailVerified: true,
        phoneVerified: true,
      },
      {
        name: "Rahul Verma",
        email: "rahul@test.mediverse.in",
        phone: "+919876543211",
        role: "student",
        emailVerified: true,
        phoneVerified: false,
      },
      {
        name: "Priya Patel",
        email: "priya@test.mediverse.in",
        phone: "+919876543212",
        role: "student",
        emailVerified: false,
        phoneVerified: true,
      },
      {
        name: "Amit Kumar",
        email: "amit@test.mediverse.in",
        phone: "+919876543213",
        role: "content_creator",
        emailVerified: true,
        phoneVerified: true,
      },
      {
        name: "Neha Gupta",
        email: "neha@test.mediverse.in",
        phone: "+919876543214",
        role: "admin",
        emailVerified: true,
        phoneVerified: true,
      },
    ])
    .returning();

  console.log(`  ✅ ${insertedUsers.length} users inserted`);

  /* ─── Profiles (varied career stages — V1 uses pg_prep) ─── */

  const careerStages = ["pg_prep", "pg_prep", "pg_prep", "pg_prep", "pg_prep"] as const;
  const specializations = [
    "General Medicine",
    "Surgery",
    "Pediatrics",
    "Radiology",
    null,
  ];
  const collegeIds = [aiims!.id, cmc!.id, grant!.id, maulana!.id, kem!.id];
  const examYears = [2027, 2027, 2028, 2027, null];

  for (let i = 0; i < insertedUsers.length; i++) {
    await db.insert(profiles).values({
      userId: insertedUsers[i]!.id,
      careerStage: careerStages[i],
      examTargetYear: examYears[i] ?? undefined,
      collegeId: collegeIds[i],
      specialization: specializations[i] ?? undefined,
      onboardingCompleted: true,
    });
  }

  console.log(`  ✅ ${insertedUsers.length} profiles inserted`);

  /* ─── Streaks ───────────────────────────── */

  for (let i = 0; i < insertedUsers.length; i++) {
    await db.insert(streaks).values({
      userId: insertedUsers[i]!.id,
      currentStreak: Math.floor(Math.random() * 30) + 1,
      longestStreak: Math.floor(Math.random() * 90) + 10,
      lastActivityDate: new Date().toISOString().split("T")[0],
    });
  }

  console.log(`  ✅ ${insertedUsers.length} streaks inserted`);

  /* ─── Sources ───────────────────────────── */

  const [pubmedSrc, ytSrc] = await db
    .insert(sources)
    .values([
      { name: "PubMed", type: "pubmed", baseUrl: "https://pubmed.ncbi.nlm.nih.gov", active: true },
      { name: "YouTube Medical", type: "youtube", baseUrl: "https://www.youtube.com", active: true },
      { name: "Semantic Scholar", type: "semantic_scholar", baseUrl: "https://www.semanticscholar.org", active: true },
      { name: "Manual Entry", type: "manual", active: true },
    ])
    .returning();

  console.log(`  ✅ 4 sources inserted`);

  /* ─── Sample Content Items ──────────────── */

  const insertedContent = await db
    .insert(contentItems)
    .values([
      {
        type: "article",
        title: "Pathophysiology of Diabetic Ketoacidosis",
        body: "DKA is a serious complication of diabetes mellitus…",
        summary: "Comprehensive review of DKA pathophysiology for NEET PG.",
        sourceId: pubmedSrc!.id,
        authorId: insertedUsers[3]!.id,
        audienceTags: ["pg_prep"],
        specialtyTags: ["general_medicine", "endocrinology"],
        topicTags: ["diabetes", "dka", "metabolic_emergencies"],
        status: "published",
        publishedAt: new Date(),
      },
      {
        type: "video",
        title: "Cardiac Auscultation Masterclass",
        summary: "Step-by-step guide to heart sounds for clinical exams.",
        sourceUrl: "https://youtube.com/example",
        sourceId: ytSrc!.id,
        audienceTags: ["pg_prep", "preclinical"],
        specialtyTags: ["cardiology"],
        topicTags: ["auscultation", "heart_sounds", "clinical_skills"],
        status: "published",
        publishedAt: new Date(),
      },
      {
        type: "note",
        title: "Pharmacology Quick Review: Antihypertensives",
        body: "ACE inhibitors, ARBs, CCBs, Beta-blockers, Diuretics…",
        audienceTags: ["pg_prep"],
        specialtyTags: ["pharmacology"],
        topicTags: ["antihypertensives", "pharmacology", "cvs_drugs"],
        status: "published",
        publishedAt: new Date(),
      },
    ])
    .returning();

  console.log(`  ✅ ${insertedContent.length} content items inserted`);

  /* ─── Sample MCQs ───────────────────────── */

  await db.insert(mcqs).values([
    {
      contentItemId: insertedContent[0]!.id,
      question: "Which of the following is the most common precipitating factor for DKA?",
      options: JSON.stringify([
        { key: "A", text: "Infection" },
        { key: "B", text: "Non-compliance with insulin" },
        { key: "C", text: "Myocardial infarction" },
        { key: "D", text: "Pancreatitis" },
      ]),
      correctOption: "A",
      explanation: "Infections are the most common precipitating factor for DKA, followed by non-compliance with insulin therapy.",
      difficulty: 2,
      subject: "General Medicine",
      topicTags: ["diabetes", "dka"],
      verified: true,
    },
    {
      question: "Austin Flint murmur is associated with which valvular lesion?",
      options: JSON.stringify([
        { key: "A", text: "Mitral stenosis" },
        { key: "B", text: "Aortic regurgitation" },
        { key: "C", text: "Tricuspid stenosis" },
        { key: "D", text: "Pulmonary stenosis" },
      ]),
      correctOption: "B",
      explanation: "Austin Flint murmur is a mid-diastolic rumble heard in severe aortic regurgitation due to the regurgitant jet impinging on the anterior mitral leaflet.",
      difficulty: 3,
      subject: "Cardiology",
      topicTags: ["auscultation", "heart_sounds", "valvular_disease"],
      verified: true,
    },
  ]);

  console.log(`  ✅ 2 MCQs inserted`);

  /* ─── Subscriptions (free tier for all) ─── */

  for (const u of insertedUsers) {
    await db.insert(subscriptions).values({
      userId: u.id,
      plan: "free",
      status: "active",
    });
  }

  console.log(`  ✅ ${insertedUsers.length} subscriptions inserted`);

  /* ─── Study Groups ──────────────────────── */

  const [group1, group2] = await db
    .insert(studyGroups)
    .values([
      {
        name: "NEET PG Cardiology Prep",
        description: "A collaborative circle focusing on cardiology high-yield topics, ECG revisions, and clinical questions.",
        examTarget: "NEET PG",
        ownerId: insertedUsers[0]!.id,
        inviteCode: "CARDIO-PG",
        isPublic: true,
        maxMembers: 50,
        memberCount: 2,
      },
      {
        name: "AIIMS Pharmacology Study Circle",
        description: "Daily drug cards, mechanisms of action, and receptor interactions study group.",
        examTarget: "AIIMS",
        ownerId: insertedUsers[1]!.id,
        inviteCode: "PHARM-AIIMS",
        isPublic: true,
        maxMembers: 30,
        memberCount: 2,
      },
    ])
    .returning();

  console.log(`  ✅ 2 study groups inserted`);

  /* ─── Study Group Members ─────────────────── */

  await db.insert(studyGroupMembers).values([
    {
      groupId: group1!.id,
      userId: insertedUsers[0]!.id,
      role: "owner",
    },
    {
      groupId: group1!.id,
      userId: insertedUsers[1]!.id,
      role: "member",
    },
    {
      groupId: group2!.id,
      userId: insertedUsers[1]!.id,
      role: "owner",
    },
    {
      groupId: group2!.id,
      userId: insertedUsers[2]!.id,
      role: "member",
    },
  ]);

  console.log(`  ✅ study group memberships inserted`);

  /* ─── Study Group Messages ────────────────── */

  await db.insert(studyGroupMessages).values([
    {
      groupId: group1!.id,
      userId: insertedUsers[0]!.id,
      content: "Welcome everyone! Let's start with ECG changes in acute myocardial infarction.",
    },
    {
      groupId: group1!.id,
      userId: insertedUsers[1]!.id,
      content: "Great idea! Hyperacute T waves are the earliest sign, followed by ST elevation.",
    },
    {
      groupId: group2!.id,
      userId: insertedUsers[1]!.id,
      content: "Hey Priya, did you review the G-protein coupled receptor pathways?",
    },
    {
      groupId: group2!.id,
      userId: insertedUsers[2]!.id,
      content: "Yes, Gs stimulates adenylyl cyclase, whereas Gi inhibits it. Let's list some examples.",
    },
  ]);

  console.log(`  ✅ study group messages inserted`);

  /* ─── Done ──────────────────────────────── */

  console.log("\n🎉  Seed complete! All test data inserted.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
