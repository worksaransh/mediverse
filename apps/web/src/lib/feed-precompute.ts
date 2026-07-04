import { createDb, users, profiles, contentItems } from "@mediverse/db";
import { eq } from "drizzle-orm";
import { redis } from "./redis";

export interface OnboardingData {
  examTarget: string;
  currentYear: string;
  examTargetYear: number;
  examDate: string;
  weakSubjects: string[];
}

/**
 * Computes the cosine similarity between two numeric vectors.
 */
export function cosineSimilarity(a: number[] | null, b: number[] | null): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Precomputes and re-ranks the top 200 content item candidates for a user,
 * caching the resulting item ID array in Redis.
 */
export async function precomputeUserFeed(userId: string): Promise<string[]> {
  const db = createDb();

  // 1. Fetch user profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile) {
    console.warn(`[Feed Precompute] No profile found for user ${userId}. Returning empty.`);
    return [];
  }

  // Retrieve user weak subjects from the generated AI profile if available
  const aiProfile = profile.aiProfile as any;
  const userWeakSubjects: string[] = Array.isArray(aiProfile?.weak_subjects)
    ? aiProfile.weak_subjects
    : [];

  const userInterestVector = profile.interestVector;

  // 2. Fetch all published content items
  const allItems = await db.query.contentItems.findMany({
    where: eq(contentItems.status, "published"),
  });

  // 3. Score and rank each item
  const scoredItems = allItems.map((item: any) => {
    // A. Cosine Similarity (Vector Match)
    let vectorScore = 0;
    if (userInterestVector && item.embedding) {
      vectorScore = cosineSimilarity(userInterestVector, item.embedding);
    }

    // B. Recency decay (exponential decay over 30 days)
    const publishedAt = item.publishedAt ? new Date(item.publishedAt) : new Date(item.createdAt);
    const diffTime = Math.max(0, Date.now() - publishedAt.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.exp(-diffDays / 30);

    // C. Quality Score
    const metadata = item.metadata as any;
    const qualityScore = typeof metadata?.qualityScore === "number" ? metadata.qualityScore : 0.5;

    // D. Cold-Start / Tag Overlap matching
    let tagMatchScore = 0;
    const itemTopics = item.topicTags || [];
    const itemSpecialties = item.specialtyTags || [];
    
    // Check overlap with user's weak subjects or interests
    const matches = [...itemTopics, ...itemSpecialties].filter((tag) =>
      userWeakSubjects.some((ws) => ws.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(ws.toLowerCase()))
    );
    if (matches.length > 0) {
      tagMatchScore = matches.length / Math.max(1, itemTopics.length + itemSpecialties.length);
    }

    // Combined Score Weighting
    // If interestVector exists, use it. Otherwise, use Tag Match + Quality Score.
    let finalScore = 0;
    if (userInterestVector && userInterestVector.some((v: number) => v !== 0)) {
      finalScore = (vectorScore * 0.5) + (recencyWeight * 0.3) + (qualityScore * 0.2);
    } else {
      // Cold-start fallback
      finalScore = (tagMatchScore * 0.5) + (recencyWeight * 0.3) + (qualityScore * 0.2);
    }

    return {
      id: item.id,
      score: finalScore,
    };
  });

  // Sort by score descending and take top 200 candidates
  scoredItems.sort((a: any, b: any) => b.score - a.score);
  const topCandidates = scoredItems.slice(0, 200).map((item: any) => item.id);

  // 4. Cache in Redis
  const redisKey = `user:feed:${userId}`;
  await redis.set(redisKey, JSON.stringify(topCandidates), 24 * 60 * 60); // cache for 24h

  console.log(`[Feed Precompute] Cached ${topCandidates.length} candidate IDs in Redis for user ${userId}.`);
  return topCandidates;
}
