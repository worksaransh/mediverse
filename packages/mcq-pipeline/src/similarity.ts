/**
 * Bigram-based string similarity (Jaccard index over character 2-grams).
 *
 * Extracted from `OrganizerAgent`'s private `stringSimilarity` method so it can be
 * unit tested directly. Behavior is unchanged from the original implementation —
 * this is a pure, side-effect-free function used by the MCQ dedup logic in
 * `OrganizerAgent.writeToDB` (duplicates are anything scoring > 0.8).
 */
export function stringSimilarity(s1: string, s2: string): number {
  if (s1.length === 0 && s2.length === 0) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Bigram-based similarity
  const pairs1 = new Set<string>();
  const pairs2 = new Set<string>();

  for (let i = 0; i < s1.length - 1; i++) {
    pairs1.add(s1.substring(i, i + 2));
  }
  for (let i = 0; i < s2.length - 1; i++) {
    pairs2.add(s2.substring(i, i + 2));
  }

  const intersection = new Set([...pairs1].filter((x) => pairs2.has(x)));
  const union = new Set([...pairs1, ...pairs2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
