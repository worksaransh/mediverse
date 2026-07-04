import { createDb, mcqs, userTopicMastery, profiles } from "@mediverse/db";
import { eq, and, notInArray } from "drizzle-orm";

export interface SelectedMcq {
  mcq: any;
  adaptivityMessage?: string;
  selectedTopic: string;
}

const AVAILABLE_TOPICS = ["Pharmacology", "Pathology", "Anatomy", "General Surgery"];

/**
 * Chooses the next MCQ adaptively.
 * @param userId User requesting the MCQ
 * @param forcedTopic Recently failed topic to target (overrides random selection)
 * @param excludeMcqIds IDs of MCQs already attempted in this session to prevent repetition
 */
export async function selectNextMcq(
  userId: string,
  forcedTopic?: string | null,
  excludeMcqIds: string[] = []
): Promise<SelectedMcq | null> {
  const db = createDb();

  // 1. Check if there's a forced override due to a recent wrong answer
  if (forcedTopic && AVAILABLE_TOPICS.includes(forcedTopic)) {
    console.log(`[MCQ Selector] Forced override active: Select question from ${forcedTopic}`);
    
    // Find an MCQ for this topic that is not excluded
    const availableMcqs = await db.query.mcqs.findMany();
    const topicMcqs = availableMcqs.filter((m: any) => {
      const match = m.subject === forcedTopic || (m.topicTags && m.topicTags.includes(forcedTopic));
      return match && !excludeMcqIds.includes(m.id);
    });

    if (topicMcqs.length > 0) {
      // Pick one
      const index = Math.floor(Math.random() * topicMcqs.length);
      return {
        mcq: topicMcqs[index],
        selectedTopic: forcedTopic,
        adaptivityMessage: `Focusing your next question on ${forcedTopic} — your weak area`,
      };
    }
  }

  // 2. Fetch user profile onboarding weak subjects
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  const aiProfile = profile?.aiProfile as any;
  const onboardingWeak: string[] = Array.isArray(aiProfile?.weak_subjects)
    ? aiProfile.weak_subjects
    : [];

  // 3. Fetch user's topic mastery records
  const masteries = await db.query.userTopicMastery.findMany({
    where: eq(userTopicMastery.userId, userId),
  });

  // 4. Calculate selection weight for each topic
  const topicWeights: Record<string, number> = {};
  for (const topic of AVAILABLE_TOPICS) {
    // Default weights
    let weight = 0.3; // baseline for other topics

    // If marked weak in onboarding, baseline is higher
    const isWeak = onboardingWeak.some(w => w.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(w.toLowerCase()));
    if (isWeak) {
      weight = 1.0;
    }

    // Adjust based on active topic mastery accuracy EMA
    const mastery = masteries.find((m: any) => m.topicTag === topic);
    if (mastery) {
      // Weight is inversely proportional to accuracy EMA
      // Lower accuracy (weak mastery) -> higher weight
      // Math.max(0.1, 1.0 - accuracyEma)
      weight = Math.max(0.1, 1.0 - mastery.accuracyEma);
      // Give a boost if it's an onboarding weak subject
      if (isWeak && weight < 0.5) {
        weight = 0.5; // keep minimum weight higher for onboarding declared weaknesses
      }
    }

    topicWeights[topic] = weight;
  }

  console.log("[MCQ Selector] Topic Selection Weights:", topicWeights);

  // 5. Weighted random selection
  const totalWeight = Object.values(topicWeights).reduce((sum, w) => sum + w, 0);
  let randomVal = Math.random() * totalWeight;
  let selectedTopic = AVAILABLE_TOPICS[0]!;

  for (const topic of AVAILABLE_TOPICS) {
    randomVal -= topicWeights[topic] || 0;
    if (randomVal <= 0) {
      selectedTopic = topic;
      break;
    }
  }

  // 6. Fetch available MCQs for selected topic
  console.log(`[MCQ Selector] Selected topic: ${selectedTopic}`);
  const allMcqs = await db.query.mcqs.findMany();
  let candidateMcqs = allMcqs.filter((m: any) => {
    const isTopicMatch = m.subject === selectedTopic || (m.topicTags && m.topicTags.includes(selectedTopic));
    return isTopicMatch && !excludeMcqIds.includes(m.id);
  });

  // Fallback: If no MCQs left for selected topic, pick from any topic that is not excluded
  if (candidateMcqs.length === 0) {
    console.log(`[MCQ Selector] No unattempted MCQs for ${selectedTopic}. Falling back to general pool.`);
    candidateMcqs = allMcqs.filter((m: any) => !excludeMcqIds.includes(m.id));
  }

  if (candidateMcqs.length === 0) {
    return null; // All questions answered
  }

  const selectedMcq = candidateMcqs[Math.floor(Math.random() * candidateMcqs.length)];
  return {
    mcq: selectedMcq,
    selectedTopic,
    adaptivityMessage: onboardingWeak.some(w => selectedTopic.toLowerCase().includes(w.toLowerCase()))
      ? `Focusing on ${selectedTopic} — one of your onboarding focus areas`
      : undefined,
  };
}
