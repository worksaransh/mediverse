import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const globalAny = globalThis as any;
const dbFilePath = path.resolve(process.cwd(), "../mock-db.json");

function readDbFile() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

function writeDbFile(state: any) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    // Ignore error
  }
}

// Initial initialization
let state = globalAny.mockDbState;
const fileState = readDbFile();
if (fileState) {
  state = fileState;
  globalAny.mockDbState = state;
} else {
  state = {
    users: [] as any[],
    profiles: [] as any[],
    streaks: [] as any[],
    colleges: [] as any[],
    sources: [] as any[],
    contentItems: [] as any[],
    mcqs: [] as any[],
    subscriptions: [] as any[],
  };
  globalAny.mockDbState = state;
}

function initializeMockData(state: any) {
  if (state.contentItems && state.contentItems.length > 0) return;
  
  const createMockEmbedding = (subject: string): number[] => {
    const vec = new Array(768).fill(0.01);
    if (subject === "Pharmacology") {
      for (let i = 0; i < 150; i++) vec[i] = 0.8;
    } else if (subject === "Pathology") {
      for (let i = 150; i < 300; i++) vec[i] = 0.8;
    } else if (subject === "Anatomy") {
      for (let i = 300; i < 450; i++) vec[i] = 0.8;
    } else if (subject === "Biochemistry") {
      for (let i = 450; i < 600; i++) vec[i] = 0.8;
    } else if (subject === "General Surgery") {
      for (let i = 600; i < 750; i++) vec[i] = 0.8;
    }
    return vec;
  };

  state.contentItems = [
    {
      id: "feed-item-1",
      type: "video",
      title: "Mechanism of Action: SGLT2 Inhibitors",
      body: "Detailed review of renal glucose transport pathways.",
      summary: "Understanding renal glucose reabsorption pathways and cardiovascular benefits in diabetic patients.",
      sourceUrl: "https://youtube.com/example-sglt2",
      audienceTags: ["pg_prep"],
      specialtyTags: ["Pharmacology"],
      topicTags: ["SGLT2", "Diabetes"],
      embedding: createMockEmbedding("Pharmacology"),
      metadata: {
        qualityScore: 0.95,
        duration: "8:42",
        thumbnailUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-2",
      type: "article",
      title: "Adverse Effects of Beta-Blockers",
      body: "Reviewing bronchoconstriction, bradycardia, and hypoglycemia mask.",
      summary: "High-yield review of autonomic pharmacology side effects.",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example-beta",
      audienceTags: ["pg_prep"],
      specialtyTags: ["Pharmacology"],
      topicTags: ["Beta-Blockers", "Autonomics"],
      embedding: createMockEmbedding("Pharmacology"),
      metadata: {
        source: "pubmed",
        qualityScore: 0.88,
        readTime: "4 min",
        coverUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=400"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-3",
      type: "article",
      title: "Neoplastic Transformations in Breast Tissue",
      body: "Examines genetic alterations, HER2 overexpression, and histological features.",
      summary: "Histopathology overview of ductal and lobular carcinomas.",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example-breast",
      audienceTags: ["pg_prep"],
      specialtyTags: ["Pathology"],
      topicTags: ["Breast Cancer", "Neoplasia"],
      embedding: createMockEmbedding("Pathology"),
      metadata: {
        source: "pubmed",
        qualityScore: 0.92,
        readTime: "7 min",
        coverUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-4",
      type: "video",
      title: "Pathological Presentation of Acute Glomerulonephritis",
      body: "Review of subepithelial humps, post-streptococcal renal lesions, and microscopy.",
      summary: "Renal pathology masterclass for PG aspirants.",
      sourceUrl: "https://youtube.com/example-renal",
      audienceTags: ["pg_prep"],
      specialtyTags: ["Pathology"],
      topicTags: ["Glomerulonephritis", "Renal"],
      embedding: createMockEmbedding("Pathology"),
      metadata: {
        qualityScore: 0.90,
        duration: "12:15",
        thumbnailUrl: "https://images.unsplash.com/photo-1576091160244-445dfe97e363?w=800"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-5",
      type: "article",
      title: "Anatomy of the Brachial Plexus",
      body: "Detailed review of roots, trunks, divisions, cords, and terminal branches.",
      summary: "Brachial plexus mapping and clinical nerve injury syndromes.",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example-brachial",
      audienceTags: ["pg_prep"],
      specialtyTags: ["Anatomy"],
      topicTags: ["Brachial Plexus", "Neuroanatomy"],
      embedding: createMockEmbedding("Anatomy"),
      metadata: {
        source: "pubmed",
        qualityScore: 0.97,
        readTime: "6 min",
        coverUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-6",
      type: "video",
      title: "Circle of Willis: Vascular Dissection",
      body: "Demonstrates anterior and posterior cerebral circulation pathways.",
      summary: "3D dissection video mapping the vascular base of the brain.",
      sourceUrl: "https://youtube.com/example-circle",
      audienceTags: ["pg_prep"],
      specialtyTags: ["Anatomy"],
      topicTags: ["Circle of Willis", "Anatomy"],
      embedding: createMockEmbedding("Anatomy"),
      metadata: {
        qualityScore: 0.85,
        duration: "9:30",
        thumbnailUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-7",
      type: "video",
      title: "Laparoscopic Cholecystectomy Techniques",
      body: "Demonstrates hepatobiliary triangle identification and clip placement.",
      summary: "Step-by-step surgical techniques for gallbladder excision.",
      sourceUrl: "https://youtube.com/example-chole",
      audienceTags: ["pg_prep"],
      specialtyTags: ["General Surgery"],
      topicTags: ["Laparoscopy", "Cholecystectomy"],
      embedding: createMockEmbedding("General Surgery"),
      metadata: {
        qualityScore: 0.94,
        duration: "15:20",
        thumbnailUrl: "https://images.unsplash.com/photo-1579684389782-64d84b5e905d?w=800"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    },
    {
      id: "feed-item-8",
      type: "article",
      title: "Principles of Wound Healing and Closures",
      body: "First vs second intention, collagen synthesis timelines, and suture select guides.",
      summary: "Clinical review of surgical wound repair pathways.",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example-wound",
      audienceTags: ["pg_prep"],
      specialtyTags: ["General Surgery"],
      topicTags: ["Wound Healing", "Suturing"],
      embedding: createMockEmbedding("General Surgery"),
      metadata: {
        source: "pubmed",
        qualityScore: 0.89,
        readTime: "8 min",
        coverUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400"
      },
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    }
  ];

  state.mcqs = [
    {
      id: "mcq-pharm-1",
      question: "Which of the following describes the mechanism of action of SGLT2 inhibitors in managing type 2 diabetes?",
      options: [
        { key: "A", text: "Stimulation of insulin release from pancreatic beta cells" },
        { key: "B", text: "Inhibition of glucose absorption in the small intestine" },
        { key: "C", text: "Inhibition of sodium-glucose cotransporter 2 in the renal proximal tubules, leading to glucosuria" },
        { key: "D", text: "Decreasing hepatic glucose production through AMPK activation" }
      ],
      correctOption: "C",
      explanation: "SGLT2 inhibitors (e.g., empagliflozin, dapagliflozin) block the sodium-glucose cotransporter 2 in the renal proximal convoluted tubule, which prevents glucose reabsorption and promotes urinary excretion.",
      difficulty: 2,
      subject: "Pharmacology",
      topicTags: ["Pharmacology", "SGLT2", "Diabetes"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-pharm-2",
      question: "A patient on beta-blockers presents with hypoglycemia. Which symptom of hypoglycemia would be masked by this medication?",
      options: [
        { key: "A", text: "Sweating (diaphoresis)" },
        { key: "B", text: "Tachycardia (heart rate elevation)" },
        { key: "C", text: "Confusion" },
        { key: "D", text: "Extreme hunger" }
      ],
      correctOption: "B",
      explanation: "Beta-blockers block adrenergic receptors and thus mask the sympathetic warning signs of hypoglycemia, most notably tachycardia and palpitations. Sweating is mediated by cholinergic pathway and is not masked.",
      difficulty: 3,
      subject: "Pharmacology",
      topicTags: ["Pharmacology", "Beta-Blockers", "Autonomics"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-path-1",
      question: "Histopathology of a breast biopsy shows neoplastic cells filling the ducts without invading the basement membrane. What is the diagnosis?",
      options: [
        { key: "A", text: "Invasive ductal carcinoma" },
        { key: "B", text: "Lobular carcinoma in situ" },
        { key: "C", text: "Ductal carcinoma in situ (DCIS)" },
        { key: "D", text: "Fibroadenoma" }
      ],
      correctOption: "C",
      explanation: "Ductal Carcinoma In Situ (DCIS) is characterized by neoplastic cells filling the lumens of ducts without invasion beyond the basement membrane.",
      difficulty: 3,
      subject: "Pathology",
      topicTags: ["Pathology", "Breast Cancer", "Neoplasia"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-path-2",
      question: "Which histological finding is characteristic of Post-Streptococcal Acute Glomerulonephritis (PSGN) under electron microscopy?",
      options: [
        { key: "A", text: "Subendothelial deposits" },
        { key: "B", text: "Subepithelial humps" },
        { key: "C", text: "Linear IgG deposition" },
        { key: "D", text: "Mesangial IgA deposits" }
      ],
      correctOption: "B",
      explanation: "Electron microscopy in PSGN classicially reveals subepithelial immune complex deposits, described as 'humps' on the epithelial side of the basement membrane.",
      difficulty: 4,
      subject: "Pathology",
      topicTags: ["Pathology", "Glomerulonephritis", "Renal"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-anat-1",
      question: "A patient presents with 'claw hand' deformity after an upper extremity trauma. Which part of the brachial plexus is most likely injured?",
      options: [
        { key: "A", text: "Upper trunk" },
        { key: "B", text: "Lateral cord" },
        { key: "C", text: "Lower trunk (C8-T1 fibers)" },
        { key: "D", text: "Posterior cord" }
      ],
      correctOption: "C",
      explanation: "Injury to the lower trunk (C8-T1) of the brachial plexus (e.g., Klumpke's palsy) affects the ulnar nerve fibers, leading to a claw hand deformity.",
      difficulty: 3,
      subject: "Anatomy",
      topicTags: ["Anatomy", "Brachial Plexus", "Neuroanatomy"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-anat-2",
      question: "Which artery connects the anterior cerebral circulation to the posterior cerebral circulation in the Circle of Willis?",
      options: [
        { key: "A", text: "Anterior communicating artery" },
        { key: "B", text: "Posterior communicating artery" },
        { key: "C", text: "Middle cerebral artery" },
        { key: "D", text: "Basilar artery" }
      ],
      correctOption: "B",
      explanation: "The posterior communicating artery (PCoA) connects the internal carotid system (anterior) with the posterior cerebral artery (posterior circulation).",
      difficulty: 2,
      subject: "Anatomy",
      topicTags: ["Anatomy", "Circle of Willis", "Anatomy"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-surg-1",
      question: "During a laparoscopic cholecystectomy, which boundaries define the Calot's (hepatobiliary) triangle?",
      options: [
        { key: "A", text: "Cystic duct, common hepatic duct, and inferior border of the liver" },
        { key: "B", text: "Common bile duct, cystic artery, and portal vein" },
        { key: "C", text: "Cystic duct, common bile duct, and duodenum" },
        { key: "D", text: "Right hepatic artery, left hepatic artery, and gallbladder bed" }
      ],
      correctOption: "A",
      explanation: "Calot's triangle boundaries are: the cystic duct inferiorly, the common hepatic duct medially, and the inferior edge of the liver (or cystic artery) superiorly.",
      difficulty: 3,
      subject: "General Surgery",
      topicTags: ["General Surgery", "Laparoscopy", "Cholecystectomy"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "mcq-surg-2",
      question: "Which phase of wound healing is characterized by collagen deposition and peak tensile strength acquisition?",
      options: [
        { key: "A", text: "Inflammatory phase" },
        { key: "B", text: "Hemostasis phase" },
        { key: "C", text: "Proliferative/Granulation phase" },
        { key: "D", text: "Maturation/Remodeling phase" }
      ],
      correctOption: "D",
      explanation: "During the maturation/remodeling phase (starting from 3 weeks and continuing for months), type III collagen is replaced by type I collagen, and wound tensile strength peaks.",
      difficulty: 3,
      subject: "General Surgery",
      topicTags: ["General Surgery", "Wound Healing", "Suturing"],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
}

state = globalAny.mockDbState;
initializeMockData(state);
if (!fs.existsSync(dbFilePath)) {
  writeDbFile(state);
}

/**
 * Helper to recursively extract literal values (IDs, emails, phones) from Drizzle's SQL AST.
 */
function extractValues(obj: any, visited = new Set<any>()): any[] {
  const results: any[] = [];
  if (!obj || typeof obj !== "object") return results;
  if (visited.has(obj)) return results;
  visited.add(obj);
  
  for (const key of Object.keys(obj)) {
    try {
      const val = obj[key];
      if (typeof val === "string" || typeof val === "number") {
        results.push(val);
      } else if (typeof val === "object") {
        results.push(...extractValues(val, visited));
      }
    } catch (e) {
      // Ignore security/getter errors on system properties
    }
  }
  return results;
}

function createMockDb(): any {
  const getTableStateByName = (tableName: string): any[] => {
    // Sync mock state from filesystem
    const fileState = readDbFile() || globalAny.mockDbState;
    globalAny.mockDbState = fileState;

    const lower = tableName.toLowerCase();
    let tableArray: any[];
    if (lower === "users") tableArray = fileState.users;
    else if (lower === "profiles") tableArray = fileState.profiles;
    else if (lower === "streaks") tableArray = fileState.streaks;
    else if (lower === "colleges") tableArray = fileState.colleges;
    else if (lower === "sources") tableArray = fileState.sources;
    else if (lower === "contentitems" || lower === "content_items") tableArray = fileState.contentItems;
    else if (lower === "mcqs") tableArray = fileState.mcqs;
    else if (lower === "subscriptions") tableArray = fileState.subscriptions;
    else {
      if (!fileState[tableName]) {
        fileState[tableName] = [];
      }
      tableArray = fileState[tableName];
    }
    return tableArray;
  };

  const getTableState = (tableObj: any): any[] => {
    const name = tableObj?.[Symbol.for("drizzle:Name")] || "";
    return getTableStateByName(name);
  };

  return {
    query: new Proxy({}, {
      get(target, tableName: string) {
        return {
          findFirst: async (options: any) => {
            const dbTable = getTableStateByName(tableName);
            const queryParams = extractValues(options?.where);
            if (queryParams.length === 0) return dbTable[0] || null;
            return dbTable.find((item: any) => {
              return queryParams.some(
                (param) =>
                  item.id === param ||
                  item.userId === param ||
                  item.email === param ||
                  item.phone === param
              );
            }) || null;
          },
          findMany: async (options: any) => {
            const dbTable = getTableStateByName(tableName);
            const queryParams = extractValues(options?.where);
            if (queryParams.length === 0) return dbTable;
            return dbTable.filter((item: any) => {
              return queryParams.some((param) => {
                if (item.id === param || item.status === param || item.userId === param) return true;
                if (Array.isArray(item.specialtyTags) && item.specialtyTags.includes(param)) return true;
                if (Array.isArray(item.topicTags) && item.topicTags.includes(param)) return true;
                return false;
              });
            });
          }
        };
      }
    }),

    insert: (table: any) => {
      const name = table?.[Symbol.for("drizzle:Name")] || "";
      return {
        values: (data: any) => {
          getTableStateByName(name); // syncs fresh state
          const dbTable = getTableStateByName(name);
          const records = Array.isArray(data) ? data : [data];
          const inserted = records.map((r: any) => {
            const newRec = {
              id: r.id || crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              ...r,
            };
            dbTable.push(newRec);
            return newRec;
          });

          writeDbFile(globalAny.mockDbState);

          return {
            returning: async () => inserted,
            then: async (resolve: any) => resolve(inserted),
          };
        },
      };
    },

    update: (table: any) => {
      const name = table?.[Symbol.for("drizzle:Name")] || "";
      return {
        set: (updateData: any) => {
          return {
            where: async (whereClause: any) => {
              getTableStateByName(name); // syncs fresh state
              const dbTable = getTableStateByName(name);
              const queryParams = extractValues(whereClause);
              dbTable.forEach((item: any, idx: number) => {
                const match = queryParams.some(
                  (param) => item.id === param || item.userId === param
                );
                if (match) {
                  dbTable[idx] = {
                    ...item,
                    ...updateData,
                    updatedAt: new Date(),
                  };
                }
              });

              writeDbFile(globalAny.mockDbState);
              return true;
            },
          };
        },
      };
    },

    delete: (table: any) => {
      const name = table?.[Symbol.for("drizzle:Name")] || "";
      return {
        where: async (whereClause: any) => {
          getTableStateByName(name); // syncs fresh state
          const dbTable = getTableStateByName(name);
          const queryParams = extractValues(whereClause);
          const filtered = dbTable.filter((item: any) => {
            const match = queryParams.some(
              (param) => item.id === param || item.userId === param
            );
            return !match;
          });
          dbTable.length = 0;
          dbTable.push(...filtered);

          writeDbFile(globalAny.mockDbState);
          return true;
        }
      };
    },
  };
}

export function createDb(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url || url.includes("localhost") || url.includes("127.0.0.1") || url === "postgresql://user:password@localhost:5432/mediverse") {
    console.log("[DB] DATABASE_URL not set to a remote server. Falling back to in-memory mock database.");
    return createMockDb();
  }

  try {
    const client = postgres(url);
    return drizzle(client, { schema });
  } catch (error) {
    console.warn("[DB] Failed to connect to real PostgreSQL. Falling back to in-memory mock:", error);
    return createMockDb();
  }
}

export type Database = ReturnType<typeof createDb>;
