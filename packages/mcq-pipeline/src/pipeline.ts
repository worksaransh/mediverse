import { PipelineConfig, PipelineReport, GeneratedMCQ, CandidateFact } from "./types";
import { FinderAgent } from "./agent1-finder";
import { VerifierAgent } from "./agent2-verifier";
import { MCQWriterAgent } from "./agent3-writer";
import { FactCheckerAgent } from "./agent4-factchecker";
import { OrganizerAgent } from "./agent5-organizer";

export class MCQPipeline {
  private config: PipelineConfig;
  private report: PipelineReport;

  constructor(config: PipelineConfig) {
    this.config = config;
    this.report = {
      pipelineStartTime: "",
      pipelineEndTime: "",
      config,
      factsFound: 0,
      factsVerified: 0,
      factsRejected: 0,
      mcqsGenerated: 0,
      mcqsApproved: 0,
      mcqsRejected: 0,
      mcqsWritten: 0,
      coverage: {},
      sampleMCQs: [],
      rejectionReasons: [],
      errors: [],
    };
  }

  async run(): Promise<PipelineReport> {
    this.report.pipelineStartTime = new Date().toISOString();
    console.log("\n" + "=".repeat(60));
    console.log(`🏥 MEDIVERSE MCQ PIPELINE — ${this.config.specialty} (${this.config.careerStage})`);
    console.log("=".repeat(60));

    // === AGENT 1: FINDER ===
    console.log("\n🔍 AGENT 1: FINDER — Sourcing facts from trusted references");
    const finder = new FinderAgent(this.config);
    const { facts: candidateFacts, errors: finderErrors } = await finder.findFacts();
    this.report.errors.push(...finderErrors);
    this.report.factsFound = candidateFacts.length;
    
    if (candidateFacts.length === 0) {
      const errMsg = "No candidate facts found. Pipeline aborted.";
      this.report.errors.push(errMsg);
      this.report.pipelineEndTime = new Date().toISOString();
      console.error(`[PIPELINE] ❌ ${errMsg}`);
      return this.report;
    }

    // === AGENT 2: VERIFIER ===
    console.log("\n✅ AGENT 2: VERIFIER — Cross-checking facts against trusted sources");
    const verifier = new VerifierAgent(this.config);
    const { verified, rejected: rejectedFacts, log: verifierLog } = await verifier.verifyFacts(candidateFacts);
    this.report.factsVerified = verified.length;
    this.report.factsRejected = rejectedFacts.length;
    verifierLog.forEach((l) => console.log(l));

    if (verified.length === 0) {
      const errMsg = "No facts passed verification. Pipeline aborted.";
      this.report.errors.push(errMsg);
      this.report.pipelineEndTime = new Date().toISOString();
      console.error(`[PIPELINE] ❌ ${errMsg}`);
      return this.report;
    }

    // === AGENT 3: MCQ WRITER ===
    console.log("\n✍️  AGENT 3: MCQ WRITER — Generating original MCQs from verified facts");
    const writer = new MCQWriterAgent(this.config);
    const { mcqs: generatedMCQs, errors: writerErrors } = await writer.generateMCQs(verified);
    this.report.errors.push(...writerErrors);
    this.report.mcqsGenerated = generatedMCQs.length;

    if (generatedMCQs.length === 0) {
      const errMsg = "No MCQs could be generated. Pipeline aborted.";
      this.report.errors.push(errMsg);
      this.report.pipelineEndTime = new Date().toISOString();
      console.error(`[PIPELINE] ❌ ${errMsg}`);
      return this.report;
    }
    console.log(`[PIPELINE] 📝 Generated ${generatedMCQs.length} MCQs`);

    // === AGENT 4: FACT-CHECKER ===
    console.log("\n🔬 AGENT 4: FACT-CHECKER — Independent verification of every MCQ");
    const factChecker = new FactCheckerAgent(this.config);
    const { approved, rejected: rejectedMCQs, log: fcLog } = await factChecker.factCheckMCQs(generatedMCQs);
    fcLog.forEach((l) => console.log(l));
    this.report.mcqsApproved = approved.length;
    this.report.mcqsRejected = rejectedMCQs.length;
    this.report.rejectionReasons.push(
      ...rejectedMCQs.map((m) => `${m.id}: ${m.rejectionReason || "Unknown"}`)
    );

    if (approved.length === 0) {
      const errMsg = "No MCQs passed fact-checking. Pipeline aborted.";
      this.report.errors.push(errMsg);
      this.report.pipelineEndTime = new Date().toISOString();
      console.error(`[PIPELINE] ❌ ${errMsg}`);
      return this.report;
    }

    // === AGENT 5: ORGANIZER ===
    console.log("\n📦 AGENT 5: ORGANIZER — Deduplicating, balancing, writing to DB");
    const organizer = new OrganizerAgent(this.config);
    const { written, skipped, log: orgLog } = await organizer.writeToDB(approved);
    orgLog.forEach((l) => console.log(l));
    this.report.mcqsWritten = written;

    // Build coverage
    const coverage: Record<string, number> = {};
    for (const mcq of approved) {
      const topic = mcq.topicTags[1] || mcq.subject;
      coverage[topic] = (coverage[topic] || 0) + 1;
    }
    this.report.coverage = coverage;

    // Store sample MCQs (first 20 for review)
    this.report.sampleMCQs = approved.slice(0, 20);

    this.report.pipelineEndTime = new Date().toISOString();

    console.log("\n" + "=".repeat(60));
    console.log("✅ PIPELINE COMPLETE");
    console.log("=".repeat(60));
    console.log(`   Facts found:      ${this.report.factsFound}`);
    console.log(`   Facts verified:   ${this.report.factsVerified}`);
    console.log(`   Facts rejected:   ${this.report.factsRejected}`);
    console.log(`   MCQs generated:   ${this.report.mcqsGenerated}`);
    console.log(`   MCQs approved:    ${this.report.mcqsApproved}`);
    console.log(`   MCQs rejected:    ${this.report.mcqsRejected}`);
    console.log(`   MCQs written:     ${this.report.mcqsWritten}`);
    console.log("=".repeat(60));

    return this.report;
  }
}
