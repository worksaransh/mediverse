import { createDb } from "./client";
import { contentItems, papers, sources, users } from "./schema";
import { eq } from "drizzle-orm";

const verbs = [
  "Efficacy and Safety of",
  "Association of",
  "Impact of",
  "Long-term Outcomes of",
  "Comparative Effectiveness of",
  "Evaluation of",
  "Therapeutic Potential of",
  "Clinical Significance of"
];

const subjects = [
  { text: "Empagliflozin in patients with chronic heart failure", tags: ["SGLT2", "Heart Failure", "Cardiology"], specialty: "Cardiology" },
  { text: "Semaglutide therapy in adult obesity and diabetes mellitus", tags: ["Semaglutide", "Obesity", "Diabetes"], specialty: "Endocrinology" },
  { text: "Pembrolizumab versus chemotherapy in advanced lung adenocarcinoma", tags: ["Immunotherapy", "Lung Cancer", "Oncology"], specialty: "Oncology" },
  { text: "Apixaban for stroke prevention in non-valvular atrial fibrillation", tags: ["Anticoagulant", "Apixaban", "Stroke"], specialty: "Cardiology" },
  { text: "High-dose statin therapy in acute coronary syndrome patients", tags: ["Statin", "ACS", "Cardiology"], specialty: "Cardiology" },
  { text: "Vedolizumab induction therapy in moderate-to-severe Crohn's disease", tags: ["Vedolizumab", "Crohns Disease", "Gastroenterology"], specialty: "Gastroenterology" },
  { text: "Donepezil administration in early-stage Alzheimer's dementia", tags: ["Donepezil", "Alzheimers", "Neurology"], specialty: "Neurology" },
  { text: "Rituximab maintenance in refractory rheumatoid arthritis", tags: ["Rituximab", "Rheumatoid Arthritis", "Immunology"], specialty: "Infectious Diseases" },
  { text: "Tenofovir disoproxil fumarate in chronic hepatitis B infection", tags: ["Tenofovir", "Hepatitis B", "Infectious Diseases"], specialty: "Infectious Diseases" },
  { text: "Dapagliflozin in patients with chronic kidney disease", tags: ["Dapagliflozin", "CKD", "Nephrology"], specialty: "Nephrology" },
  { text: "CAR-T cell infusion in relapsed B-cell acute lymphoblastic leukemia", tags: ["CAR-T", "Leukemia", "Oncology"], specialty: "Oncology" },
  { text: "High-flow nasal cannula oxygen therapy in acute hypoxemic respiratory failure", tags: ["Nasal Cannula", "Respiratory Failure", "Pulmonology"], specialty: "Pulmonology" }
];

const journals = [
  "The New England Journal of Medicine (NEJM)",
  "The Lancet",
  "JAMA",
  "British Medical Journal (BMJ)",
  "Annals of Internal Medicine",
  "Journal of Clinical Investigation",
  "Circulation",
  "Gastroenterology",
  "Journal of Clinical Oncology"
];

async function seed() {
  const db = createDb();

  console.log("🌱  Starting custom database ingestion for 100 research papers...\n");

  // 1. Resolve PubMed source
  let pubmedSource = await db.query.sources.findFirst({
    where: eq(sources.type, "pubmed"),
  });
  if (!pubmedSource) {
    const inserted = await db.insert(sources).values({
      name: "PubMed",
      type: "pubmed",
      baseUrl: "https://pubmed.ncbi.nlm.nih.gov",
      active: true,
    }).returning();
    pubmedSource = inserted[0];
  }
  const sourceId = pubmedSource.id;

  // 2. Resolve User as Author
  let author = await db.query.users.findFirst();
  if (!author) {
    const inserted = await db.insert(users).values({
      name: "System Ingestion",
      email: "system@mediverse.in",
      role: "admin",
      emailVerified: true,
      phoneVerified: true,
    }).returning();
    author = inserted[0];
  }
  const authorId = author.id;

  console.log("📝  Generating paper data...");
  let count = 0;
  for (let i = 0; i < 100; i++) {
    const subject = subjects[i % subjects.length]!;
    const verb = verbs[i % verbs.length]!;
    const journal = journals[i % journals.length]!;

    const title = `${verb} ${subject.text} (Cohort Trial Group ${i + 1})`;
    const summary = `Detailed clinical trial review regarding ${subject.text} for ${subject.specialty} PG prep candidates.`;
    const abstract = `This clinical study evaluates the efficacy and safety profiles of ${subject.text}. We conducted a randomized, double-blind, multi-center trial involving cohort group ${i + 1}. The primary endpoint was clinical progression and safety limits. Statistical analysis showed key improvements (p < 0.05). Findings support the inclusion of this intervention in standard guidelines for ${subject.specialty}.`;
    const body = `Introduction: ${subject.text} represents a high-yield topic for clinical research. Methods: Standard diagnostic criteria and cohort selection. Results: Clinical indicators show statistical significance. Discussion: Relevance to contemporary PG preparation databases. Conclusion: This study updates current evidence for ${subject.specialty}.`;

    const pmid = `20260711${100 + i}`;
    const doi = `10.1016/j.mediverse.2026.07.${100 + i}`;
    const publishedDate = new Date(2025, i % 12, (i % 28) + 1).toISOString().split("T")[0]!;

    try {
      // Check if paper already exists (to avoid duplicate key violations)
      const existingPaper = await db.query.papers.findFirst({
        where: eq(papers.pmid, pmid),
      });

      if (existingPaper) {
        continue;
      }

      // Insert Content Item
      const [insertedItem] = await db.insert(contentItems).values({
        type: "article",
        title,
        body,
        summary,
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`,
        sourceId,
        authorId,
        audienceTags: ["pg_prep"],
        specialtyTags: [subject.specialty.toLowerCase()],
        topicTags: subject.tags.map(t => t.toLowerCase()),
        embedding: new Array(768).fill(0.01),
        status: "published",
        publishedAt: new Date(),
      }).returning();

      if (insertedItem) {
        // Insert Paper Detail
        await db.insert(papers).values({
          pmid,
          doi,
          title,
          abstract,
          authors: ["Smith J.", "Patel R.", "Kumar S.", "Davis K."],
          journal,
          publishedDate,
          meshTerms: [...subject.tags, "Clinical Trial", "Cohort Study"],
          contentItemId: insertedItem.id,
        });
        count++;
      }
    } catch (err) {
      console.warn(`⚠️  Failed to insert paper ${i + 1}:`, err);
    }
  }

  console.log(`\n🎉  Success! Ingested ${count} new research papers into content_items & papers tables.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Custom ingestion failed:", err);
  process.exit(1);
});
