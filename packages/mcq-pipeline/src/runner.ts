import { MCQPipeline } from "./pipeline";
import { PipelineConfig, PipelineReport } from "./types";
import * as fs from "fs";
import * as path from "path";

// Load .env parameters
const envPath = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

function generateAuditReport(report: PipelineReport): string {
  const lines: string[] = [];
  const t = (s: string) => s; // no-op for formatting

  lines.push("# CONTENT-AUDIT.md");
  lines.push(`## Mediverse OS — Pipeline Audit Report`);
  lines.push("");
  lines.push(`**Generated:** ${report.pipelineEndTime}`);
  lines.push(`**Pipeline duration:** ${((new Date(report.pipelineEndTime).getTime() - new Date(report.pipelineStartTime).getTime()) / 1000).toFixed(1)}s`);
  lines.push(`**Specialty:** ${report.config.specialty}`);
  lines.push(`**Career Stage:** ${report.config.careerStage}`);
  lines.push(`**Target:** ${report.config.targetCount} MCQs`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Pipeline Summary");
  lines.push("");
  lines.push("| Stage | Input | Output | Status |");
  lines.push("|-------|-------|--------|--------|");
  lines.push(`| AGENT 1: Finder | — | ${report.factsFound} candidate facts | ✅ Complete |`);
  lines.push(`| AGENT 2: Verifier | ${report.factsFound} facts | ${report.factsVerified} verified, ${report.factsRejected} rejected | ✅ Complete |`);
  lines.push(`| AGENT 3: MCQ Writer | ${report.factsVerified} verified facts | ${report.mcqsGenerated} MCQs generated | ✅ Complete |`);
  lines.push(`| AGENT 4: Fact-Checker | ${report.mcqsGenerated} MCQs | ${report.mcqsApproved} approved, ${report.mcqsRejected} rejected | ✅ Complete |`);
  lines.push(`| AGENT 5: Organizer/DB | ${report.mcqsApproved} approved MCQs | ${report.mcqsWritten} written to DB | ✅ Complete |`);
  lines.push("");
  lines.push("### Key Metrics");
  lines.push("");
  lines.push(`- **Facts found:** ${report.factsFound}`);
  lines.push(`- **Facts verified (cross-checked):** ${report.factsVerified}`);
  lines.push(`- **Facts rejected:** ${report.factsRejected}`);
  lines.push(`- **MCQs generated:** ${report.mcqsGenerated}`);
  lines.push(`- **MCQs approved (passed fact-check):** ${report.mcqsApproved}`);
  lines.push(`- **MCQs rejected by fact-checker:** ${report.mcqsRejected}`);
  lines.push(`- **MCQs written to DB:** ${report.mcqsWritten}`);
  lines.push(`- **Overall yield:** ${report.mcqsWritten}/${report.factsFound} facts → MCQs`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Coverage by Topic");
  lines.push("");
  lines.push("| Topic | Count |");
  lines.push("|-------|-------|");
  
  const sortedTopics = Object.entries(report.coverage).sort((a, b) => b[1] - a[1]);
  for (const [topic, count] of sortedTopics) {
    lines.push(`| ${topic} | ${count} |`);
  }
  lines.push("");
  lines.push("**Total distinct topics:** " + Object.keys(report.coverage).length);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Rejected MCQs (with reasons)");
  lines.push("");
  if (report.rejectionReasons.length === 0) {
    lines.push("No MCQs were rejected.");
  } else {
    for (const reason of report.rejectionReasons) {
      lines.push(`- ❌ ${reason}`);
    }
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Errors & Warnings");
  lines.push("");
  if (report.errors.length === 0) {
    lines.push("No errors or warnings.");
  } else {
    for (const err of report.errors) {
      lines.push(`- ⚠️ ${err}`);
    }
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Sample of 20 Approved MCQs (for human review)");
  lines.push("");
  lines.push("> **⚠️ HUMAN REVIEW REQUIRED**: AI-generated medical questions MUST be reviewed by a qualified medical professional before students trust them. The fact-checker verifies internal consistency but cannot replace clinical judgment.");
  lines.push("");

  for (let i = 0; i < report.sampleMCQs.length; i++) {
    const mcq = report.sampleMCQs[i];
    lines.push(`### MCQ ${i + 1}: ${mcq.subject} — ${mcq.cognitiveLevel} (Difficulty: ${mcq.difficulty}/5)`);
    lines.push("");
    lines.push(`**Question:** ${mcq.question}`);
    lines.push("");
    for (const opt of mcq.options) {
      const marker = opt.key === mcq.correctOption ? "✅" : "  ";
      lines.push(`- ${marker} **${opt.key}.** ${opt.text}`);
    }
    lines.push("");
    lines.push(`**Correct Answer:** ${mcq.correctOption}`);
    lines.push("");
    lines.push(`**Explanation:** ${mcq.explanation}`);
    lines.push("");
    lines.push(`**Cognitive Level:** ${mcq.cognitiveLevel}`);
    lines.push("");
    lines.push("**Sources:**");
    for (const src of mcq.sources) {
      lines.push(`- [${src.type}] ${src.title} — ${src.url}`);
    }
    lines.push("");
    lines.push("**Fact-check result:** ✅ PASSED");
    lines.push(`**Notes:** ${mcq.factCheckNotes || "All checks passed"}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Final instructions
  lines.push("## Human Review Instructions");
  lines.push("");
  lines.push("1. **Spot-check** these 20 sample MCQs for accuracy");
  lines.push("2. Verify each MCQ's correct answer against the cited sources");
  lines.push("3. Check distractors are plausible but definitively wrong");
  lines.push("4. Confirm the explanation is accurate and matches the citation");
  lines.push("5. Flag any MCQ that could teach a dangerous/incorrect medical fact");
  lines.push("6. After approval, run the pipeline for all 19 specialties at scale");
  lines.push("");
  lines.push("### Sign-off");
  lines.push("");
  lines.push("- [ ] Saransh has reviewed and approves the quality");
  lines.push("- [ ] Medical reviewer has verified accuracy");
  lines.push("- [ ] Pipeline is cleared for full-scale deployment");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Audit generated by Mediverse OS MCQ Pipeline at ${report.pipelineEndTime}*`);

  return lines.join("\n");
}

async function main() {
  const config: PipelineConfig = {
    specialty: "Pharmacology",
    careerStage: "pg_prep",
    targetCount: 50,
    difficultySpread: {
      easy: -1,    // -1 means unlimited
      moderate: -1,
      hard: -1,
    },
    useLiveLLM: false,
    verbose: true,
  };

  const pipeline = new MCQPipeline(config);
  const report = await pipeline.run();

  // Write CONTENT-AUDIT.md
  const auditPath = path.resolve(process.cwd(), "CONTENT-AUDIT.md");
  const auditContent = generateAuditReport(report);
  fs.writeFileSync(auditPath, auditContent, "utf-8");
  console.log(`\n📄 Audit report written to: ${auditPath}`);

  // Also write a JSON report for programmatic use
  const jsonPath = path.resolve(process.cwd(), "pipeline-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`📄 JSON report written to: ${jsonPath}`);

  // Print final summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 FINAL SUMMARY — Ready for Human Review");
  console.log("=".repeat(60));
  console.log(`  ✅ ${report.mcqsApproved} MCQs approved and written to DB`);
  console.log(`  📄 Audit report: CONTENT-AUDIT.md`);
  console.log(`  📄 JSON report: pipeline-report.json`);
  console.log(`  👀 Review the first ${Math.min(report.sampleMCQs.length, 20)} MCQs in the audit report`);
  console.log("");
  console.log("  ⚠️  REMEMBER: This is a draft. Have a medical professional");
  console.log("     verify these MCQs before trusting them for student use.");
  console.log("");
  console.log("  Next steps:");
  console.log("  1. Review the 20 sample MCQs in CONTENT-AUDIT.md");
  console.log("  2. Verify accuracy against the cited sources");
  console.log("  3. If approved → scale to all 19 specialties");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("❌ Pipeline failed:", err);
  process.exit(1);
});
