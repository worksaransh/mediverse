import { describe, it, expect } from "vitest";
import { stringSimilarity } from "./similarity";

// Mirrors the normalization the organizer agent applies before comparing
// questions: lowercase + strip everything that isn't a-z0-9.
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

describe("stringSimilarity", () => {
  it("returns 1 for identical strings", () => {
    expect(stringSimilarity("hyperkalemia", "hyperkalemia")).toBe(1);
  });

  it("returns 1 for two empty strings", () => {
    expect(stringSimilarity("", "")).toBe(1);
  });

  it("returns 0 when only one string is empty", () => {
    expect(stringSimilarity("hyperkalemia", "")).toBe(0);
    expect(stringSimilarity("", "hyperkalemia")).toBe(0);
  });

  it("returns a low similarity score for completely different strings", () => {
    const s1 = normalize("What is the mechanism of action of beta blockers?");
    const s2 = normalize("Which vitamin deficiency causes scurvy in sailors?");
    const score = stringSimilarity(s1, s2);
    expect(score).toBeLessThan(0.3);
  });

  it("scores near-duplicate MCQ questions (minor wording/punctuation diffs) above the 0.8 dedup threshold", () => {
    const original = normalize(
      "A 45-year-old male presents with crushing chest pain radiating to the left arm. What is the most likely diagnosis?"
    );
    const nearDuplicate = normalize(
      "A 45 year old male presents with crushing chest pain, radiating to the left arm — what is the most likely diagnosis?"
    );
    const score = stringSimilarity(original, nearDuplicate);
    expect(score).toBeGreaterThan(0.8);
  });

  it("scores a genuinely different question about a similar topic below the dedup threshold", () => {
    const original = normalize(
      "A 45-year-old male presents with crushing chest pain radiating to the left arm. What is the most likely diagnosis?"
    );
    const differentQuestion = normalize(
      "A 62-year-old woman with a history of diabetes presents with blurred vision and numbness in her feet. What is the most likely diagnosis?"
    );
    const score = stringSimilarity(original, differentQuestion);
    expect(score).toBeLessThan(0.8);
  });

  it("is symmetric: similarity(a, b) === similarity(b, a)", () => {
    const a = normalize("Beta blockers reduce heart rate and myocardial oxygen demand.");
    const b = normalize("Beta-blockers reduce heart rate & myocardial oxygen demand!");
    expect(stringSimilarity(a, b)).toBe(stringSimilarity(b, a));
  });

  it("treats single-character strings as having no bigrams (similarity 0 unless identical single chars, still 0 per bigram definition)", () => {
    // A single character produces zero bigrams, so union of bigram sets is empty -> 0
    expect(stringSimilarity("a", "a")).toBe(0);
    expect(stringSimilarity("a", "b")).toBe(0);
  });
});
