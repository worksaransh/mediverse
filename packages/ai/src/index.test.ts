import { describe, it, expect, beforeEach } from "vitest";
import { routeIntent, generateMentorResponse, generateFlashcards } from "./index";

// These tests deliberately never reach a real network call. `routeIntent`'s
// keyword buckets (clinical/research/news/plan/help) all return synchronously
// before any API client is constructed, and `generateMentorResponse` returns
// immediately for `intent === "unsafe_clinical"` before touching Anthropic/Gemini.
// We also blank out the API key env vars so that if a query genuinely falls
// through to the LLM-fallback branch, `callGemini`/Anthropic are skipped via
// the code's own placeholder-key checks rather than us trying to network-mock them.

beforeEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
});

describe("routeIntent — unsafe clinical keyword veto", () => {
  it.each([
    "Can you diagnose me based on these symptoms?",
    "What is the treatment for a UTI?",
    "I have chest pain radiating to my left arm, what should I take?",
    "Is this cancer? There's a rash on my arm.",
  ])("classifies %j as unsafe_clinical", async (prompt) => {
    expect(await routeIntent(prompt)).toBe("unsafe_clinical");
  });

  it("does not flag an ordinary study question as unsafe_clinical", async () => {
    const result = await routeIntent("Can you explain the mechanism of action of beta blockers?");
    expect(result).not.toBe("unsafe_clinical");
  });
});

describe("routeIntent — other keyword buckets", () => {
  it("classifies research-related queries as research_query", async () => {
    expect(await routeIntent("Can you summarize this recent PubMed study?")).toBe("research_query");
  });

  it("classifies news-related queries as news_query", async () => {
    expect(await routeIntent("What's the latest FDA approval news?")).toBe("news_query");
  });

  it("classifies planning queries as study_plan", async () => {
    // Deliberately avoids the word "study" here — routeIntent checks the research-keyword
    // bucket (which includes "study") before the plan-keyword bucket, so a prompt containing
    // both would be classified as research_query first. This exercises the plan bucket in
    // isolation.
    expect(await routeIntent("Help me build a weekly revision timeline for next month")).toBe("study_plan");
  });

  it("classifies support queries as platform_help", async () => {
    expect(await routeIntent("I found a bug, who do I contact for support?")).toBe("platform_help");
  });

  it("checks clinical override takes priority over other keyword buckets", async () => {
    // Contains both a "plan" keyword and a clinical keyword — clinical must win,
    // since the safety check runs first in the function.
    expect(await routeIntent("What's the treatment for my chest pain, and what's my study plan?")).toBe(
      "unsafe_clinical",
    );
  });

  it("falls back to study_help for an unmatched query with no AI keys configured", async () => {
    // No keyword bucket matches, and both ANTHROPIC_API_KEY and GEMINI_API_KEY/GOOGLE_API_KEY
    // are unset (see beforeEach), so this exercises the safe default path with zero network calls.
    const result = await routeIntent("Tell me an interesting fact about mitochondria.");
    expect(result).toBe("study_help");
  });
});

describe("generateMentorResponse — safety veto", () => {
  it("returns a fixed safety disclaimer and flagged:true immediately when intent is unsafe_clinical, without calling any AI provider", async () => {
    const result = await generateMentorResponse({
      userId: "test-user",
      prompt: "Diagnose my symptoms please",
      intent: "unsafe_clinical",
    });

    expect(result.flagged).toBe(true);
    expect(result.citedContentIds).toEqual([]);
    expect(result.answer).toContain("not a doctor");
    expect(result.answer).toContain("consult a licensed physician");
  });

  it("does not apply the safety veto for a non-clinical intent", async () => {
    const result = await generateMentorResponse({
      userId: "test-user",
      prompt: "What's a good weekly study plan for Pharmacology?",
      intent: "study_plan",
    });

    // With no API keys configured this resolves via the mock fallback path,
    // not the safety veto — flagged must stay false and the canned safety
    // disclaimer text must not appear.
    expect(result.flagged).toBe(false);
    expect(result.answer).not.toContain("not a doctor");
  });
});

describe("generateFlashcards — mock fallback (no AI keys configured)", () => {
  it("returns the requested number of cards, each with front and back text", async () => {
    const cards = await generateFlashcards({ subject: "Biology", topic: "Cell Membrane", count: 5 });
    expect(cards).toHaveLength(5);
    cards.forEach((card) => {
      expect(typeof card.front).toBe("string");
      expect(card.front.length).toBeGreaterThan(0);
      expect(typeof card.back).toBe("string");
      expect(card.back.length).toBeGreaterThan(0);
    });
  });

  it("clamps the requested count to a maximum of 25", async () => {
    const cards = await generateFlashcards({ subject: "Chemistry", topic: "Chemical Bonding", count: 999 });
    expect(cards).toHaveLength(25);
  });

  it("clamps the requested count to a minimum of 1", async () => {
    const cards = await generateFlashcards({ subject: "Physics", topic: "Laws of Motion", count: 0 });
    expect(cards).toHaveLength(1);
  });

  it("defaults to 10 cards when no count is specified", async () => {
    const cards = await generateFlashcards({ subject: "Mathematics", topic: "Calculus" });
    expect(cards).toHaveLength(10);
  });
});
