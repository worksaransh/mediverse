import { CandidateFact, PipelineConfig } from "./types";
import { PHARMACOLOGY_FACTS } from "./pharmacology-facts";

const FACT_SOURCE: Record<string, CandidateFact[]> = {
  Pharmacology: PHARMACOLOGY_FACTS,
};

export class FinderAgent {
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async findFacts(): Promise<{ facts: CandidateFact[]; errors: string[] }> {
    const errors: string[] = [];
    const facts: CandidateFact[] = [];

    // In live mode, we would use web search + LLM to find facts from trusted sources
    // In default mode, use the curated fact bank
    if (this.config.useLiveLLM) {
      errors.push("Live LLM mode not yet implemented for Finder; using curated fact bank.");
    }

    const sourceFacts = FACT_SOURCE[this.config.specialty];
    if (!sourceFacts || sourceFacts.length === 0) {
      errors.push(`No fact source found for specialty: ${this.config.specialty}`);
      return { facts: [], errors };
    }

    for (const fact of sourceFacts) {
      if (fact.specialty === this.config.specialty && fact.careerStage === this.config.careerStage) {
        facts.push({
          ...fact,
          verificationStatus: "unverified",
          foundBy: "finder",
        });
      }
    }

    console.log(`[FINDER] Found ${facts.length} candidate facts for ${this.config.specialty}`);
    return { facts, errors };
  }
}
