/**
 * SM-2 spaced-repetition scheduling algorithm.
 *
 * Extracted as a pure, side-effect-free function so both the flashcard review
 * flow (`flashcardReviews`) and the MCQ mastery-tracking flow
 * (`userTopicMastery`, previously duplicated inline in
 * `apps/web/src/app/api/mcq/attempt/route.ts`) can share one tested
 * implementation instead of two hand-copied versions that could silently
 * drift apart.
 *
 * Quality scale (matches the standard SM-2 definition):
 *   0 - complete blackout
 *   1 - incorrect, but remembered on seeing the answer
 *   2 - incorrect, but felt close
 *   3 - correct, with serious difficulty
 *   4 - correct, with some hesitation
 *   5 - correct, perfect recall
 *
 * Quality < 3 resets the repetition count and easiness factor decays;
 * quality >= 3 advances the repetition count and grows the interval.
 */

export interface Sm2State {
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface Sm2Result extends Sm2State {
  nextReviewAt: Date;
}

const MIN_EASINESS_FACTOR = 1.3;

export function computeSm2Update(
  quality: number,
  prev: Sm2State,
  now: Date = new Date(),
): Sm2Result {
  if (quality < 0 || quality > 5) {
    throw new Error(`SM-2 quality must be between 0 and 5, received ${quality}`);
  }

  let { easinessFactor, intervalDays, repetitions } = prev;

  // Easiness factor update applies regardless of pass/fail.
  easinessFactor =
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < MIN_EASINESS_FACTOR) {
    easinessFactor = MIN_EASINESS_FACTOR;
  }

  if (quality < 3) {
    // Failed recall: restart the repetition ladder, review again tomorrow.
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easinessFactor);
    }
    repetitions += 1;
  }

  const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return { easinessFactor, intervalDays, repetitions, nextReviewAt };
}

/** The starting state for a card/topic that has never been reviewed. */
export const SM2_INITIAL_STATE: Sm2State = {
  easinessFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};
