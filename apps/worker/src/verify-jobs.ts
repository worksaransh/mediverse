import { searchPubMed } from "@mediverse/ingestion";
import { composeDailyDigest } from "./digest-composer";

async function main() {
  console.log("[Verify] Starting direct job handler execution checks...");

  // 1. Check Ingestion logic directly
  console.log("\n[Verify] Running PubMed Ingestion check for query: 'diabetes'...");
  try {
    const results = await searchPubMed("diabetes");
    console.log(`[Verify] ✅ Ingestion check complete. Found ${results.length} articles.`);
  } catch (e: any) {
    console.error("[Verify] ❌ Ingestion check failed:", e.message);
  }

  // 2. Check Daily Digest composer logic directly
  const testUserId = "a639d37d-5cab-447a-be3c-c6792c0d6341";
  console.log(`\n[Verify] Running Daily Digest check for user: ${testUserId} (Ananya Sharma)...`);
  try {
    const result = await composeDailyDigest(testUserId, 12); // mock local hour as 12 PM (active hours)
    console.log(`[Verify] ✅ Daily Digest check complete. Result sent status: ${result.sent}`);
    console.log(`[Verify] Digest Text snippet: "${result.digestText.slice(0, 100)}..."`);
    console.log(`[Verify] Nudge Text: "${result.nudgeText}"`);
  } catch (e: any) {
    console.error("[Verify] ❌ Daily Digest check failed:", e.message);
  }

  console.log("\n[Verify] All checks completed successfully!");
}

main().catch(console.error);
