/**
 * Curriculum seed script — populates a fresh Mediverse DB with sample
 * Subject > Chapter > Topic hierarchy data for NEET UG and JEE aspirants.
 *
 * Run: pnpm db:seed-curriculum
 * Requires DATABASE_URL in environment.
 *
 * This is additive and independent of seed.ts — it only touches the
 * curriculum tables (subjects, chapters, topics) and does not truncate
 * or otherwise modify any other data.
 */

import { createDb } from "./client";
import { subjects, chapters, topics } from "./schema";

async function seedCurriculum() {
  const db = createDb();

  console.log("🌱  Seeding Mediverse curriculum data…\n");

  /* ─── Subjects ──────────────────────────── */

  const [
    neetPhysics,
    neetChemistry,
    neetBiology,
    jeePhysics,
    jeeChemistry,
    jeeMathematics,
  ] = await db
    .insert(subjects)
    .values([
      {
        name: "Physics",
        code: "PHY",
        examTags: ["neet_ug"],
        description: "NEET UG Physics syllabus covering mechanics, optics, and modern physics.",
        sortOrder: 1,
      },
      {
        name: "Chemistry",
        code: "CHEM",
        examTags: ["neet_ug"],
        description: "NEET UG Chemistry syllabus covering physical, organic, and inorganic chemistry.",
        sortOrder: 2,
      },
      {
        name: "Biology",
        code: "BIO",
        examTags: ["neet_ug"],
        description: "NEET UG Biology syllabus covering botany and zoology.",
        sortOrder: 3,
      },
      {
        name: "Physics",
        code: "PHY-JEE",
        examTags: ["jee_main", "jee_advanced"],
        description: "JEE Physics syllabus covering mechanics, electromagnetism, and modern physics.",
        sortOrder: 4,
      },
      {
        name: "Chemistry",
        code: "CHEM-JEE",
        examTags: ["jee_main", "jee_advanced"],
        description: "JEE Chemistry syllabus covering physical, organic, and inorganic chemistry.",
        sortOrder: 5,
      },
      {
        name: "Mathematics",
        code: "MATH",
        examTags: ["jee_main", "jee_advanced"],
        description: "JEE Mathematics syllabus covering algebra, calculus, and coordinate geometry.",
        sortOrder: 6,
      },
    ])
    .returning();

  console.log(`  ✅ 6 subjects inserted`);

  /* ─── Chapters ──────────────────────────── */

  const [
    cellStructure,
    humanPhysiology,
    neetPhysicsLaws,
    neetPhysicsThermo,
    neetChemBonding,
    neetChemOrganic,
    jeePhysicsLaws,
    jeePhysicsThermo,
    jeeChemBonding,
    jeeChemOrganic,
    mathCalculus,
    mathCoordinateGeometry,
  ] = await db
    .insert(chapters)
    .values([
      // Biology (NEET)
      {
        subjectId: neetBiology!.id,
        name: "Cell Structure and Function",
        classLevel: "11",
        description: "Cell theory, cell membrane, organelles, and cell division.",
        sortOrder: 1,
      },
      {
        subjectId: neetBiology!.id,
        name: "Human Physiology",
        classLevel: "11",
        description: "Digestion, breathing, circulation, and excretion in humans.",
        sortOrder: 2,
      },
      // Physics (NEET)
      {
        subjectId: neetPhysics!.id,
        name: "Laws of Motion",
        classLevel: "11",
        description: "Newton's laws, friction, and dynamics of particles.",
        sortOrder: 1,
      },
      {
        subjectId: neetPhysics!.id,
        name: "Thermodynamics",
        classLevel: "11",
        description: "Laws of thermodynamics, heat engines, and entropy.",
        sortOrder: 2,
      },
      // Chemistry (NEET)
      {
        subjectId: neetChemistry!.id,
        name: "Chemical Bonding",
        classLevel: "11",
        description: "Ionic, covalent bonding, and molecular structure.",
        sortOrder: 1,
      },
      {
        subjectId: neetChemistry!.id,
        name: "Organic Chemistry Basics",
        classLevel: "11",
        description: "Nomenclature, isomerism, and reaction mechanisms.",
        sortOrder: 2,
      },
      // Physics (JEE)
      {
        subjectId: jeePhysics!.id,
        name: "Laws of Motion",
        classLevel: "11",
        description: "Newton's laws, friction, and dynamics of particles.",
        sortOrder: 1,
      },
      {
        subjectId: jeePhysics!.id,
        name: "Thermodynamics",
        classLevel: "11",
        description: "Laws of thermodynamics, heat engines, and entropy.",
        sortOrder: 2,
      },
      // Chemistry (JEE)
      {
        subjectId: jeeChemistry!.id,
        name: "Chemical Bonding",
        classLevel: "11",
        description: "Ionic, covalent bonding, and molecular structure.",
        sortOrder: 1,
      },
      {
        subjectId: jeeChemistry!.id,
        name: "Organic Chemistry Basics",
        classLevel: "11",
        description: "Nomenclature, isomerism, and reaction mechanisms.",
        sortOrder: 2,
      },
      // Mathematics (JEE)
      {
        subjectId: jeeMathematics!.id,
        name: "Calculus",
        classLevel: "12",
        description: "Limits, continuity, differentiation, and integration.",
        sortOrder: 1,
      },
      {
        subjectId: jeeMathematics!.id,
        name: "Coordinate Geometry",
        classLevel: "11",
        description: "Straight lines, circles, and conic sections.",
        sortOrder: 2,
      },
    ])
    .returning();

  console.log(`  ✅ 12 chapters inserted`);

  /* ─── Topics ────────────────────────────── */

  await db.insert(topics).values([
    // Cell Structure and Function
    { chapterId: cellStructure!.id, name: "Cell Membrane", sortOrder: 1 },
    { chapterId: cellStructure!.id, name: "Cell Organelles", sortOrder: 2 },
    { chapterId: cellStructure!.id, name: "Cell Division", sortOrder: 3 },
    // Human Physiology
    { chapterId: humanPhysiology!.id, name: "Digestive System", sortOrder: 1 },
    { chapterId: humanPhysiology!.id, name: "Circulatory System", sortOrder: 2 },
    { chapterId: humanPhysiology!.id, name: "Excretory System", sortOrder: 3 },
    // Laws of Motion (NEET)
    { chapterId: neetPhysicsLaws!.id, name: "Newton's Laws", sortOrder: 1 },
    { chapterId: neetPhysicsLaws!.id, name: "Friction", sortOrder: 2 },
    { chapterId: neetPhysicsLaws!.id, name: "Circular Motion", sortOrder: 3 },
    // Thermodynamics (NEET)
    { chapterId: neetPhysicsThermo!.id, name: "First Law of Thermodynamics", sortOrder: 1 },
    { chapterId: neetPhysicsThermo!.id, name: "Second Law of Thermodynamics", sortOrder: 2 },
    // Chemical Bonding (NEET)
    { chapterId: neetChemBonding!.id, name: "Ionic Bonding", sortOrder: 1 },
    { chapterId: neetChemBonding!.id, name: "Covalent Bonding", sortOrder: 2 },
    { chapterId: neetChemBonding!.id, name: "VSEPR Theory", sortOrder: 3 },
    // Organic Chemistry Basics (NEET)
    { chapterId: neetChemOrganic!.id, name: "Nomenclature", sortOrder: 1 },
    { chapterId: neetChemOrganic!.id, name: "Isomerism", sortOrder: 2 },
    // Laws of Motion (JEE)
    { chapterId: jeePhysicsLaws!.id, name: "Newton's Laws", sortOrder: 1 },
    { chapterId: jeePhysicsLaws!.id, name: "Friction", sortOrder: 2 },
    { chapterId: jeePhysicsLaws!.id, name: "Circular Motion", sortOrder: 3 },
    // Thermodynamics (JEE)
    { chapterId: jeePhysicsThermo!.id, name: "First Law of Thermodynamics", sortOrder: 1 },
    { chapterId: jeePhysicsThermo!.id, name: "Second Law of Thermodynamics", sortOrder: 2 },
    // Chemical Bonding (JEE)
    { chapterId: jeeChemBonding!.id, name: "Ionic Bonding", sortOrder: 1 },
    { chapterId: jeeChemBonding!.id, name: "Covalent Bonding", sortOrder: 2 },
    { chapterId: jeeChemBonding!.id, name: "VSEPR Theory", sortOrder: 3 },
    // Organic Chemistry Basics (JEE)
    { chapterId: jeeChemOrganic!.id, name: "Nomenclature", sortOrder: 1 },
    { chapterId: jeeChemOrganic!.id, name: "Isomerism", sortOrder: 2 },
    // Calculus
    { chapterId: mathCalculus!.id, name: "Limits and Continuity", sortOrder: 1 },
    { chapterId: mathCalculus!.id, name: "Differentiation", sortOrder: 2 },
    { chapterId: mathCalculus!.id, name: "Integration", sortOrder: 3 },
    // Coordinate Geometry
    { chapterId: mathCoordinateGeometry!.id, name: "Straight Lines", sortOrder: 1 },
    { chapterId: mathCoordinateGeometry!.id, name: "Circles", sortOrder: 2 },
    { chapterId: mathCoordinateGeometry!.id, name: "Conic Sections", sortOrder: 3 },
  ]);

  console.log(`  ✅ 30 topics inserted`);

  /* ─── Done ──────────────────────────────── */

  console.log("\n🎉  Curriculum seed complete! All sample data inserted.\n");
  process.exit(0);
}

seedCurriculum().catch((err) => {
  console.error("❌  Curriculum seed failed:", err);
  process.exit(1);
});
