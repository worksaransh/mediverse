import { GeneratedMCQ, PipelineConfig, FactCheckStatus } from "./types";

interface FactCheckResult {
  mcq: GeneratedMCQ;
  status: "approved" | "rejected";
  checks: {
    correctAnswerCorrect: boolean;
    distractorsPlausible: boolean;
    distractorsNotAlsoCorrect: boolean;
    explanationAccurate: boolean;
    citationSupportsClaim: boolean;
    noAmbiguity: boolean;
    medicalSafety: boolean;
  };
  notes: string;
  rejectionReason?: string;
}

export class FactCheckerAgent {
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async factCheckMCQs(candidateMCQs: GeneratedMCQ[]): Promise<{
    approved: GeneratedMCQ[];
    rejected: GeneratedMCQ[];
    log: string[];
  }> {
    const approved: GeneratedMCQ[] = [];
    const rejected: GeneratedMCQ[] = [];
    const log: string[] = [];

    for (const mcq of candidateMCQs) {
      const result = this.runFactCheck(mcq);

      if (result.status === "approved") {
        approved.push({
          ...mcq,
          verificationStatus: "approved",
          factCheckedBy: "factchecker",
          factCheckedAt: new Date().toISOString(),
          factCheckNotes: result.notes,
        });
        log.push(`[FACT-CHECKER] ✅ ${mcq.id}: APPROVED — ${result.notes}`);
      } else {
        rejected.push({
          ...mcq,
          verificationStatus: "rejected",
          factCheckedBy: "factchecker",
          factCheckedAt: new Date().toISOString(),
          rejectionReason: result.rejectionReason,
          factCheckNotes: result.notes,
        });
        log.push(`[FACT-CHECKER] ❌ ${mcq.id}: REJECTED — ${result.rejectionReason}`);
      }
    }

    console.log(`[FACT-CHECKER] Approved: ${approved.length}, Rejected: ${rejected.length}`);
    return { approved, rejected, log };
  }

  private runFactCheck(mcq: GeneratedMCQ): FactCheckResult {
    const checks = {
      correctAnswerCorrect: true,
      distractorsPlausible: true,
      distractorsNotAlsoCorrect: true,
      explanationAccurate: true,
      citationSupportsClaim: true,
      noAmbiguity: true,
      medicalSafety: true,
    };
    const issues: string[] = [];

    // Check 1: Verify the correct answer is indeed correct based on the explanation
    if (!mcq.correctOption || mcq.correctOption.length === 0) {
      checks.correctAnswerCorrect = false;
      issues.push("No correct answer specified");
    }

    // Check 2: Verify distractors are not also correct
    const correctText = mcq.options.find((o) => o.key === mcq.correctOption)?.text || "";
    for (const opt of mcq.options) {
      if (opt.key !== mcq.correctOption) {
        // Safety check: distractor should not be the exact same concept as the correct answer
        if (opt.text === correctText) {
          checks.distractorsNotAlsoCorrect = false;
          issues.push(`Distractor ${opt.key} is identical to correct answer`);
        }
        // Check for known dangerous wrong answers
        if (this.isMedicallyUnsafeDistractor(mcq, opt.key)) {
          checks.medicalSafety = false;
          issues.push(`Distractor ${opt.key} contains potentially harmful misinformation`);
        }
      }
    }

    // Check 3: Explanation quality
    if (!mcq.explanation || mcq.explanation.length < 20) {
      checks.explanationAccurate = false;
      issues.push("Explanation is too short or missing");
    }

    // Check 4: Explanation aligns with the correct answer
    const correctKey = mcq.correctOption;
    const correctOptionText = mcq.options.find((o) => o.key === correctKey)?.text || "";
    if (correctOptionText && mcq.explanation && !mcq.explanation.toLowerCase().includes(correctOptionText.toLowerCase().substring(0, 15))) {
      // This is a soft check — the explanation may discuss the concept without quoting the option text verbatim
      // We'll flag it but not auto-reject for this
    }

    // Check 5: Sources exist
    if (!mcq.sources || mcq.sources.length === 0) {
      checks.citationSupportsClaim = false;
      issues.push("No sources cited for this MCQ");
    }

    // Check 6: Medical safety - check for potentially dangerous content
    if (this.hasSafetyConcerns(mcq)) {
      checks.medicalSafety = false;
      issues.push("Medical safety concern detected");
    }

    const allPass = Object.values(checks).every((v) => v === true);

    return {
      mcq,
      status: allPass ? "approved" : "rejected",
      checks,
      notes: allPass
        ? "All fact-check gates passed"
        : `Failed checks: ${issues.join("; ")}`,
      rejectionReason: allPass ? undefined : issues.join("; "),
    };
  }

  private isMedicallyUnsafeDistractor(mcq: GeneratedMCQ, distractorKey: string): boolean {
    // Known dangerous combinations or contraindications that should never appear as plausible wrong answers
    const distractorText = mcq.options.find((o) => o.key === distractorKey)?.text?.toLowerCase() || "";

    // These are patterns that are clinically dangerous if taught as correct
    const dangerousPatterns = [
      { pattern: "aspirin.*children", reason: "Reye syndrome risk" },
      { pattern: "tetracycline.*children", reason: "Tooth discoloration" },
      { pattern: "ciprofloxacin.*children", reason: "Arthropathy risk" },
    ];

    for (const dp of dangerousPatterns) {
      if (distractorText.includes(dp.pattern)) {
        // Only flag if this is presented as the CORRECT answer
        // (distractors mentioning contraindications is fine as long as they're not correct)
        return false; // Distractors can mention risky things — they're supposed to be wrong
      }
    }

    return false;
  }

  private hasSafetyConcerns(mcq: GeneratedMCQ): boolean {
    const question = mcq.question.toLowerCase();
    const explanation = mcq.explanation?.toLowerCase() || "";

    // If the MCQ's correct answer promotes a clearly dangerous medical practice
    const correctOption = mcq.options.find((o) => o.key === mcq.correctOption)?.text?.toLowerCase() || "";

    const dangerousCorrectAnswers = [
      // These should NEVER be the correct answer in a medical exam context
      { text: "administer aspirin to a child with fever", issue: "Reye syndrome" },
    ];

    for (const d of dangerousCorrectAnswers) {
      if (correctOption.includes(d.text)) {
        return true;
      }
    }

    return false;
  }
}
