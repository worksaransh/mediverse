import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mediverse End-to-End Publishing Pipeline", () => {

  test("ingest draft -> admin edit & approve -> discover published item in user feed", async ({ page }) => {
    // 1. Sign up / login a student user on the main site (port 3000)
    console.log("--> Logging in student user to establish feed vector context");
    const randomPhone = `989${Math.floor(1000000 + Math.random() * 9000000)}`;
    await page.goto("http://127.0.0.1:3000/login");
    await page.fill("#phone-input", randomPhone);
    await page.check("#consent-checkbox");
    await page.click("#send-otp-btn");
    await expect(page.locator("#otp-input")).toBeVisible();
    await page.fill("#otp-input", "1234");
    await page.click("#verify-otp-btn");

    // Onboarding steps
    await expect(page.locator("h1:has-text('preparing for')")).toBeVisible();
    await page.click("#exam-neet-pg");
    await page.click("#continue-btn");

    await expect(page.locator("h1:has-text('Timeline details')")).toBeVisible();
    await page.selectOption("#stage-select", "Intern");
    await page.fill("#target-year-input", "2027");
    await page.fill("#target-date-input", "2027-03-05");
    await page.click("#continue-btn");

    await expect(page.locator("h1:has-text('weak areas')")).toBeVisible();
    await page.click("#subject-pharmacology");
    await page.click("#continue-btn");

    // Land on Student Dashboard
    await expect(page).toHaveURL(/http:\/\/127.0.0.1:3000\/dashboard/);
    console.log("--> Student successfully logged in.");

    // 2. Go to the Admin Portal (port 3001)
    console.log("--> Accessing Admin Portal (port 3001)");
    await page.goto("http://127.0.0.1:3001/");
    await expect(page.locator("h1:has-text('System Moderation & Publishing')")).toBeVisible();

    // 3. Simulate ingestion of a new draft item
    console.log("--> Simulating draft ingestion task");
    await page.fill("#ingest-title", "Ingested Article: Mechanism of SGLT2 Inhibitors");
    await page.selectOption("#ingest-specialty", "Pharmacology");
    await page.fill("#ingest-body", "This is a high-yield breakdown of SGLT2 and proximal tubule glucosuria mechanics.");
    
    // Take screenshot of ingestion form before submission
    await page.screenshot({ path: path.join(__dirname, "screenshots/admin-before-ingestion.png") });
    
    await page.click("#ingest-submit-btn");

    // 4. Verify draft appears in the Content Review Queue
    console.log("--> Verifying new draft in Review Queue");
    const draftCard = page.locator(".data-draft-item:has-text('Ingested Article: Mechanism of SGLT2 Inhibitors')");
    await expect(draftCard).toBeVisible();

    // Take screenshot of pending draft in queue
    await page.screenshot({ path: path.join(__dirname, "screenshots/admin-pending-draft.png") });

    // 5. Approve & Publish the draft
    console.log("--> Approving and publishing draft item");
    const approveBtn = draftCard.locator(".btn-approve");
    await approveBtn.click();

    // Verify it is published and live in feed
    await expect(draftCard).not.toBeVisible(); // Gone from drafts
    const publishedList = page.locator("#published-list");
    await expect(publishedList).toContainText("Ingested Article: Mechanism of SGLT2 Inhibitors");

    // Take screenshot of dashboard after approval
    await page.screenshot({ path: path.join(__dirname, "screenshots/admin-after-publish.png") });

    // 6. Navigate back to Student Dashboard and verify it appears in their Personalized Discover Feed
    console.log("--> Returning to Student Dashboard (port 3000) to verify feed update");
    await page.goto("http://127.0.0.1:3000/dashboard");

    // Since a new item was published, let's wait a moment for the feed list query
    const feedItem = page.locator(".feed-card:has-text('Ingested Article: Mechanism of SGLT2 Inhibitors')").first();
    await expect(feedItem).toBeVisible({ timeout: 10000 });
    await expect(feedItem).toContainText("Pharmacology");

    // Save final E2E verification screenshot
    await page.screenshot({ path: path.join(__dirname, "screenshots/student-feed-with-published-item.png") });
    console.log("--> End-to-end publishing pipeline verified successfully!");
  });
});
