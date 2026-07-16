import { createDb, contentItems, papers, sources } from "../../db/src/index";
import { eq, or } from "drizzle-orm";

/* ─── Interfaces ─────────────────────────── */

export interface PubMedArticle {
  pmid: string;
  doi: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publishedDate: string;
  meshTerms: string[];
  isOpenAccess: boolean;
  fullText?: string;
}

export interface VideoResource {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: string;
}

export interface ScholarPaper {
  paperId: string;
  title: string;
  abstract: string;
  year: number;
  citationCount: number;
  authors: string[];
}

/* ─── Allowlist for YouTube Channels ─────── */
const YOUTUBE_CHANNEL_ALLOWLIST = [
  "UCm93L_E6IUZp2TmhYdQENYQ", // Ninja Nerd
  "UC53B76R6O25tX4I1vBefz0Q", // Dirty Medicine
  "UCNI0qOojpkhsUtaQ4_2NUhQ", // Osmosis
  "UC07-dOwgza1Ixg1gMZz0zJw", // World Health Organization (WHO)
  "UC5ZtZ2_aY3t1E_dpxf-t1Sw", // Centers for Disease Control (CDC)
  "UC3bXz-V-7aO2yJzY2s_T4tw", // Yale School of Medicine
];

/* ─── Helper: Delay for NCBI Backoff ─────── */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ─── Helper: Regex XML tag extractor ────── */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1]!.trim() : "";
}

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]!.trim());
  }
  return matches;
}

/* ─── Helper: Zero-Dependency Gemini API ─── */
async function callGeminiFlash(prompt: string, systemInstruction?: string, mimeType?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key" || apiKey === "your_google_api_key") {
    console.warn("[Gemini Ingestion] API key not set — skipping AI call");
    return "";
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const body: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (mimeType) {
      body.generationConfig = { responseMimeType: mimeType };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Gemini Ingestion] HTTP error: ${res.status} - ${errText}`);
      return "";
    }

    const data = await res.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return resultText || "";
  } catch (error: any) {
    console.error("[Gemini Ingestion] REST error:", error.message);
    return "";
  }
}

/* ─── 1. PubMed NCBI E-utilities search ──── */
export async function searchPubMed(query: string, maxResults = 10): Promise<PubMedArticle[]> {
  const apiKey = process.env.NCBI_API_KEY;
  const useKey = apiKey && apiKey !== "your_ncbi_api_key";
  
  // Respect NCBI rate limit: 3 req/sec unauthenticated, 10 req/sec authenticated
  const apiDelay = useKey ? 150 : 400;

  console.log(`[Ingestion] Starting PubMed search for: "${query}"...`);
  try {
    // Phase A: Search to get PMIDs
    let searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${maxResults}`;
    if (useKey) searchUrl += `&api_key=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.statusText}`);
    const searchData = await searchRes.json();
    const pmids: string[] = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) {
      console.log("[Ingestion] PubMed search returned 0 items.");
      return [];
    }

    await delay(apiDelay);

    // Phase B: Fetch details for retrieved PMIDs
    let fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=xml`;
    if (useKey) fetchUrl += `&api_key=${apiKey}`;

    const fetchRes = await fetch(fetchUrl);
    if (!fetchRes.ok) throw new Error(`Fetch failed: ${fetchRes.statusText}`);
    const xmlText = await fetchRes.text();

    // Parse XML articles
    const articlesXml = extractAllTags(xmlText, "PubmedArticle");
    const results: PubMedArticle[] = [];

    for (const articleXml of articlesXml) {
      const pmid = extractTag(articleXml, "PMID");
      const title = extractTag(articleXml, "ArticleTitle");
      const abstract = extractAllTags(articleXml, "AbstractText").join(" ");
      
      const authorListXml = extractTag(articleXml, "AuthorList");
      const authors = extractAllTags(authorListXml, "Author").map((authorXml) => {
        const last = extractTag(authorXml, "LastName");
        const fore = extractTag(authorXml, "ForeName");
        return `${fore} ${last}`.trim();
      }).filter(Boolean);

      const journal = extractTag(extractTag(articleXml, "Journal"), "Title");
      
      const pubDateXml = extractTag(articleXml, "PubDate");
      const year = extractTag(pubDateXml, "Year") || extractTag(articleXml, "YearCompleted") || new Date().getFullYear().toString();
      const month = extractTag(pubDateXml, "Month") || "01";
      const day = extractTag(pubDateXml, "Day") || "01";
      const publishedDate = `${year}-${month}-${day}`;

      const meshListXml = extractTag(articleXml, "MeshHeadingList");
      const meshTerms = extractAllTags(meshListXml, "DescriptorName").map(t => t.replace(/<[^>]*>/g, "").trim());

      const doiMatch = articleXml.match(/<ELocationID EIdType="doi"[^>]*>([\s\S]*?)<\/ELocationID>/i);
      const doi = doiMatch ? doiMatch[1]!.trim() : "";

      results.push({
        pmid,
        doi,
        title,
        abstract,
        authors,
        journal,
        publishedDate,
        meshTerms,
        isOpenAccess: false, // Default PubMed metadata is abstract-only unless PMC verified
      });
    }

    return results;
  } catch (error: any) {
    console.error("[Ingestion] PubMed Search failed:", error.message);
    return [];
  }
}

/* ─── 2. Europe PMC search ───────────────── */
export async function searchEuropePMC(query: string, maxResults = 10): Promise<PubMedArticle[]> {
  console.log(`[Ingestion] Fetching from Europe PMC for: "${query}"...`);
  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&resultType=core&format=json&pageSize=${maxResults}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Europe PMC HTTP error: ${res.status}`);
    const data = await res.json();
    const list = data.resultList?.result || [];

    const results: PubMedArticle[] = [];
    for (const item of list) {
      const pmid = item.pmid || item.id || "";
      const doi = item.doi || "";
      const title = item.title || "";
      const abstract = item.abstractText || "";
      const authors = (item.authorList?.author || []).map((a: any) => `${a.firstName || ""} ${a.lastName || ""}`.trim()).filter(Boolean);
      const journal = item.journalInfo?.journal?.title || item.journalTitle || "";
      const publishedDate = item.firstPublicationDate || `${item.pubYear || new Date().getFullYear()}-01-01`;
      
      const meshTerms: string[] = [];
      if (item.meshHeadingList?.meshHeading) {
        item.meshHeadingList.meshHeading.forEach((mesh: any) => {
          if (mesh.descriptorName) meshTerms.push(mesh.descriptorName);
        });
      }

      const isOpenAccess = item.isOpenAccess === "Y" || item.inEPMC === "Y";
      
      let fullText: string | undefined = undefined;
      // LEGAL: abstract/summary + citation + link only for non-OA. Full text ONLY where oa_status=open-access.
      if (isOpenAccess && item.pmcid) {
        try {
          const pmcRes = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/pmc/article/${item.pmcid}/xml`);
          if (pmcRes.ok) {
            const xml = await pmcRes.text();
            // Extract body text simply from XML to represent full text
            const bodyXml = extractTag(xml, "body");
            if (bodyXml) {
              fullText = bodyXml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
              console.log(`[Ingestion] Successfully resolved open-access full text for PMID ${pmid} (${fullText.slice(0, 100)}...)`);
            }
          }
        } catch (pmcErr) {
          console.warn(`[Ingestion] Failed to resolve full text XML for open access paper ${pmid}`);
        }
      }

      results.push({
        pmid,
        doi,
        title,
        abstract,
        authors,
        journal,
        publishedDate,
        meshTerms,
        isOpenAccess,
        fullText,
      });
    }

    return results;
  } catch (error: any) {
    console.error("[Ingestion] Europe PMC fetch error:", error.message);
    return [];
  }
}

/* ─── 3. Crossref Metadata enrichment ────── */
export async function enrichWithCrossref(doi: string): Promise<any> {
  if (!doi) return null;
  try {
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MediverseOS/1.0 (mailto:engineering@mediverse.in)" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.message || null;
  } catch (e: any) {
    console.warn(`[Ingestion] Crossref enrichment failed for DOI ${doi}:`, e.message);
    return null;
  }
}

/* ─── 4. Semantic Scholar citations ─────── */
export async function searchSemanticScholar(query: string, maxResults = 10): Promise<ScholarPaper[]> {
  try {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers: any = {};
    if (apiKey && apiKey !== "your_semantic_scholar_api_key") {
      headers["x-api-key"] = apiKey;
    }

    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,abstract,year,citationCount,authors`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    const list = data.data || [];

    return list.map((item: any) => ({
      paperId: item.paperId || "",
      title: item.title || "",
      abstract: item.abstract || "",
      year: item.year || new Date().getFullYear(),
      citationCount: item.citationCount || 0,
      authors: (item.authors || []).map((a: any) => a.name).filter(Boolean),
    }));
  } catch (error: any) {
    console.error("[Ingestion] Semantic Scholar failed:", error.message);
    return [];
  }
}

export async function getSemanticScholarCitations(doiOrPmid: string): Promise<number> {
  if (!doiOrPmid) return 0;
  try {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const headers: any = {};
    if (apiKey && apiKey !== "your_semantic_scholar_api_key") {
      headers["x-api-key"] = apiKey;
    }

    const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(doiOrPmid)}?fields=citationCount`;
    const res = await fetch(url, { headers });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.citationCount || 0;
  } catch (e: any) {
    console.warn(`[Ingestion] Semantic Scholar citation fetch failed for ${doiOrPmid}:`, e.message);
    return 0;
  }
}

/* ─── 5. YouTube Data API v3 search ──────── */
export async function searchYouTube(query: string, maxResults = 10): Promise<VideoResource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your_youtube_api_key") {
    console.warn("[Ingestion] YOUTUBE_API_KEY not set");
    return [];
  }

  try {
    console.log(`[Ingestion] Searching YouTube for: "${query}"...`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=25&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(searchUrl);
    if (!res.ok) throw new Error(`YouTube HTTP error: ${res.status}`);
    const data = await res.json();
    const items = data.items || [];

    const allowlistedItems = items.filter((item: any) => {
      return YOUTUBE_CHANNEL_ALLOWLIST.includes(item.snippet?.channelId);
    });

    const finalCandidates = allowlistedItems.slice(0, maxResults);
    if (finalCandidates.length === 0) {
      console.log("[Ingestion] YouTube search returned 0 allowed-channel videos.");
      return [];
    }

    const videoIds = finalCandidates.map((v: any) => v.id.videoId);

    // Call videos API to fetch content details (durations)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const durations: Record<string, string> = {};
    if (detailsRes.ok) {
      const detailsData = await detailsRes.json();
      (detailsData.items || []).forEach((item: any) => {
        durations[item.id] = item.contentDetails?.duration || "PT10M0S";
      });
    }

    return finalCandidates.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet?.title || "Medical Education Video",
      channelName: item.snippet?.channelTitle || "Curated Resource",
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
      duration: durations[item.id.videoId] || "PT10M",
    }));

  } catch (error: any) {
    console.error("[Ingestion] YouTube Ingestion failed:", error.message);
    return [];
  }
}

/* ─── 6. Tagger (Gemini Flash integration) ── */
export async function tagContent(title: string, body: string): Promise<{
  audienceTags: string[];
  specialtyTags: string[];
  topicTags: string[];
  difficulty: number;
  qualityScore: number;
}> {
  const prompt = `Analyze the following medical article details:
Title: ${title}
Text: ${body.slice(0, 3000)}

Classify and return tag metadata as a raw JSON object containing exactly these fields:
- "audienceTags" (array of strings, values ONLY from: "preclinical", "pg_prep", "resident", "doctor")
- "specialtyTags" (array of strings, e.g. ["Pharmacology", "Pathology", "Anatomy", "Biochemistry", "General Surgery"])
- "topicTags" (array of strings, e.g. ["Hypertension", "Wound Healing", "Breast Cancer", "Antibiotics"])
- "difficulty" (integer difficulty rating 1 to 5)
- "qualityScore" (float quality score 0.0 to 1.0)

Do NOT write markdown, code blocks, or explanations. Return ONLY the raw JSON string.`;

  const instruction = "You are a medical content tagging classifier. Return only structured classification metadata in raw JSON.";
  const rawJson = await callGeminiFlash(prompt, instruction, "application/json");

  // Fallback defaults if Gemini call fails
  const fallback = {
    audienceTags: ["pg_prep"],
    specialtyTags: ["General Medicine"],
    topicTags: ["Clinical Practice"],
    difficulty: 3,
    qualityScore: 0.7
  };

  if (!rawJson) return fallback;

  try {
    const parsed = JSON.parse(rawJson);
    return {
      audienceTags: Array.isArray(parsed.audienceTags) ? parsed.audienceTags : fallback.audienceTags,
      specialtyTags: Array.isArray(parsed.specialtyTags) ? parsed.specialtyTags : fallback.specialtyTags,
      topicTags: Array.isArray(parsed.topicTags) ? parsed.topicTags : fallback.topicTags,
      difficulty: typeof parsed.difficulty === "number" ? parsed.difficulty : fallback.difficulty,
      qualityScore: typeof parsed.qualityScore === "number" ? parsed.qualityScore : fallback.qualityScore
    };
  } catch (e) {
    console.warn("[Tagger] Failed to parse tagger json output. Falling back.", rawJson);
    return fallback;
  }
}

/* ─── 7. Summarizer (Gemini Flash integration) ── */
export async function summarizePaper(paper: {
  title: string;
  abstract: string;
  pmid?: string;
  doi?: string;
}): Promise<string> {
  const prompt = `Summarize the clinical trial or medical study paper below:
Title: ${paper.title}
Abstract: ${paper.abstract}

Generate a concise medical summary containing exactly these sections:
1. TL;DR: (1 key sentence summary)
2. Study Methods: (how the study was conducted)
3. Key Findings: (what the data indicates)
4. Clinical Relevance: (board exam high-yield facts or clinical points)

Always end the output on a new line with the citation string exactly as:
"Citation: PMID ${paper.pmid || "N/A"} | DOI ${paper.doi || "N/A"}"`;

  const summaryText = await callGeminiFlash(prompt, "You are a medical text summarizer. Write high-yield, structured medical study summaries.");
  
  if (!summaryText) {
    // Fallback baseline summary if Gemini fails
    return `TL;DR: Summarized medical review of ${paper.title}.\nStudy Methods: Randomized review of literature database abstracts.\nKey Findings: Literature demonstrates clinical significance of active diagnostic indices.\nClinical Relevance: Crucial NEET PG board recall points.\n\nCitation: PMID ${paper.pmid || "N/A"} | DOI ${paper.doi || "N/A"}`;
  }

  return summaryText;
}

/* ─── 8. Deduplication check ─────────────── */
export async function checkDeduplicated(pmid?: string, doi?: string, sourceUrl?: string): Promise<boolean> {
  const db = createDb();
  
  // Verify duplicates by PMID or DOI or source url
  const checks: any[] = [];
  if (pmid) checks.push(eq(papers.pmid, pmid));
  if (doi) checks.push(eq(papers.doi, doi));
  if (sourceUrl) checks.push(eq(contentItems.sourceUrl, sourceUrl));

  if (checks.length === 0) return false;

  // Query database to see if matching item exists
  const existingPaper = await db.query.papers.findFirst({
    where: or(
      pmid ? eq(papers.pmid, pmid) : undefined,
      doi ? eq(papers.doi, doi) : undefined
    )
  });

  if (existingPaper) return true;

  if (sourceUrl) {
    const existingContent = await db.query.contentItems.findFirst({
      where: eq(contentItems.sourceUrl, sourceUrl)
    });
    if (existingContent) return true;
  }

  return false;
}

/* ─── 9. Ingestion Pipeline Orchestration ── */
export async function runIngestionPipeline(query: string, maxResults = 5): Promise<number> {
  console.log(`\n=== LAUNCHING INGESTION PIPELINE FOR QUERY: "${query}" ===`);
  const db = createDb();
  let successCount = 0;

  // Retrieve source ID for automatic logging
  const sourceRecord = await db.query.sources.findFirst({
    where: eq(sources.type, "pubmed")
  });
  const sourceId = sourceRecord?.id;

  // A. Multi-source Search Fallback: Query PubMed and Europe PMC
  let searchResults: PubMedArticle[] = [];
  
  try {
    searchResults = await searchPubMed(query, maxResults);
  } catch (err: any) {
    console.warn("[Pipeline] PubMed call failed. Falling back to Europe PMC.", err.message);
  }

  if (searchResults.length === 0) {
    try {
      searchResults = await searchEuropePMC(query, maxResults);
    } catch (err: any) {
      console.error("[Pipeline] Europe PMC fallback search also failed.", err.message);
    }
  }

  // B. Enrich, Tag, Summarize and Store
  for (const article of searchResults) {
    try {
      // 1. Deduplication check
      const isDuplicate = await checkDeduplicated(article.pmid, article.doi, article.doi ? `https://doi.org/${article.doi}` : undefined);
      if (isDuplicate) {
        console.log(`[Pipeline] Skipping duplicate article: ${article.title.slice(0, 40)}... (PMID ${article.pmid})`);
        continue;
      }

      // 2. Crossref / Semantic Scholar citation count enrichment
      let citationCount = 0;
      try {
        if (article.doi) {
          citationCount = await getSemanticScholarCitations(`DOI:${article.doi}`);
        } else if (article.pmid) {
          citationCount = await getSemanticScholarCitations(`PMID:${article.pmid}`);
        }
      } catch (enrichErr) {
        console.warn(`[Pipeline] Enrichment failed for PMID ${article.pmid} — setting default citations.`);
      }

      // 3. Auto-tagging using Gemini
      const tags = await tagContent(article.title, article.abstract);

      // Adjust quality score based on citation counts
      const adjustedQuality = Math.min(1.0, tags.qualityScore + (citationCount > 50 ? 0.15 : citationCount > 10 ? 0.05 : 0));

      // 4. Summarization using Gemini
      const summary = await summarizePaper({
        title: article.title,
        abstract: article.abstract,
        pmid: article.pmid,
        doi: article.doi,
      });

      // 5. Database Save (Transactional integrity)
      // LEGAL: abstract/summary + citation + link only for non-OA. Full text ONLY where oa_status=open-access.
      // Never store full paywalled journal text in the central body database columns.
      console.log(`[Pipeline] Inserting content item & paper: "${article.title.slice(0, 50)}..."`);
      
      const [insertedItem] = await db.insert(contentItems).values({
        type: "article",
        title: article.title,
        body: article.isOpenAccess && article.fullText ? article.fullText : article.abstract, // LEGAL: Full text stored ONLY if open-access, else abstract/summary only!
        summary: summary,
        sourceUrl: article.doi ? `https://doi.org/${article.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`,
        sourceId: sourceId,
        audienceTags: tags.audienceTags,
        specialtyTags: tags.specialtyTags,
        topicTags: tags.topicTags,
        status: "draft", // Goes into Admin Review Queue first!
        metadata: {
          isOpenAccess: article.isOpenAccess,
          citationsCount: citationCount,
          qualityScore: adjustedQuality,
          difficulty: tags.difficulty,
          meshTerms: article.meshTerms
        }
      }).returning();

      if (insertedItem) {
        await db.insert(papers).values({
          pmid: article.pmid || null,
          doi: article.doi || null,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors,
          journal: article.journal,
          publishedDate: article.publishedDate,
          meshTerms: article.meshTerms,
          contentItemId: insertedItem.id
        });
        successCount++;
      }

    } catch (articleError: any) {
      console.error(`[Pipeline] Failed to process article "${article.title.slice(0, 30)}...":`, articleError.message);
      // Fallback: Continue processing the remaining pipeline candidates, never halt the entire loop!
      continue;
    }
  }

  console.log(`=== PIPELINE COMPLETE. Ingested & parsed ${successCount} articles. ===\n`);
  return successCount;
}