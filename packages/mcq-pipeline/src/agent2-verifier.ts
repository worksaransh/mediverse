import { CandidateFact, SourceReference, PipelineConfig } from "./types";

export class VerifierAgent {
  private config: PipelineConfig;

  constructor(config: PipelineConfig) {
    this.config = config;
  }

  async verifyFacts(candidateFacts: CandidateFact[]): Promise<{
    verified: CandidateFact[];
    rejected: CandidateFact[];
    log: string[];
  }> {
    const verified: CandidateFact[] = [];
    const rejected: CandidateFact[] = [];
    const log: string[] = [];

    for (const fact of candidateFacts) {
      const sources = fact.sources;

      // Two-source rule: needs at least 1 Tier-1 source OR 2 corroborating sources
      const tier1Sources = sources.filter((s) => s.tier === 1);
      const tier2Sources = sources.filter((s) => s.tier === 2);

      let passes = false;
      let reason = "";

      if (tier1Sources.length >= 2) {
        passes = true;
      } else if (tier1Sources.length === 1 && tier2Sources.length >= 1) {
        passes = true;
      } else if (tier1Sources.length === 1) {
        // Single Tier-1 source — acceptable for authoritative guidelines
        passes = true;
        log.push(`[VERIFIER] ${fact.id}: Single Tier-1 source (${tier1Sources[0].type}: ${tier1Sources[0].title}) — accepted as authoritative`);
      } else if (tier2Sources.length >= 2) {
        passes = true;
      } else {
        reason = `Insufficient sources: ${sources.length} source(s) found, need ≥1 Tier-1 or ≥2 total trusted sources`;
      }

      if (passes) {
        verified.push({
          ...fact,
          verificationStatus: "verified",
          verifiedBy: "verifier",
          verifiedAt: new Date().toISOString(),
        });
        log.push(`[VERIFIER] ✅ ${fact.id}: "${fact.fact.substring(0, 60)}..." — VERIFIED (${sources.length} sources)`);
      } else {
        rejected.push({
          ...fact,
          verificationStatus: "rejected",
          rejectionReason: reason,
        });
        log.push(`[VERIFIER] ❌ ${fact.id}: REJECTED — ${reason}`);
      }
    }

    console.log(`[VERIFIER] Verified: ${verified.length}, Rejected: ${rejected.length}`);
    return { verified, rejected, log };
  }
}
