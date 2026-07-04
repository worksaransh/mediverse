/* ─── Types ──────────────────────────────── */

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publishedDate: string;
  meshTerms: string[];
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

/* ─── PubMed / NCBI E-Utilities ──────────── */

export async function searchPubMed(
  query: string,
  _maxResults = 20,
): Promise<PubMedArticle[]> {
  const apiKey = process.env.NCBI_API_KEY;
  if (!apiKey || apiKey === "your_ncbi_api_key") {
    console.warn("[Ingestion] NCBI_API_KEY not set");
    return [];
  }
  // TODO: Implement NCBI E-utilities API integration
  console.log(`[Ingestion] PubMed search: "${query}"`);
  return [];
}

/* ─── YouTube Data API v3 ────────────────── */

export async function searchYouTube(
  query: string,
  _maxResults = 10,
): Promise<VideoResource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your_youtube_api_key") {
    console.warn("[Ingestion] YOUTUBE_API_KEY not set");
    return [];
  }
  // TODO: Implement YouTube Data API v3 integration
  console.log(`[Ingestion] YouTube search: "${query}"`);
  return [];
}

/* ─── Semantic Scholar API ───────────────── */

export async function searchSemanticScholar(
  query: string,
  _maxResults = 20,
): Promise<ScholarPaper[]> {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey || apiKey === "your_semantic_scholar_api_key") {
    console.warn("[Ingestion] SEMANTIC_SCHOLAR_API_KEY not set");
    return [];
  }
  // TODO: Implement Semantic Scholar API integration
  console.log(`[Ingestion] Semantic Scholar search: "${query}"`);
  return [];
}
