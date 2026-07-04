import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mediverse Personalized Discover Feed E2E", () => {
  
  // Helper function to execute signup and onboarding for a given user
  async function runUserOnboarding(page: any, phone: string, subjectId: string) {
    // 1. Login
    await page.goto("/login");
    await page.fill("#phone-input", phone);
    await page.click("#send-otp-btn");
    await expect(page.locator("#otp-input")).toBeVisible();
    await page.fill("#otp-input", "1234");
    await page.click("#verify-otp-btn");

    // 2. Onboarding Step 1: Exam Goal
    await expect(page.locator("h1:has-text('preparing for')")).toBeVisible();
    await page.click("#exam-neet-pg");
    await page.click("#continue-btn");

    // 3. Onboarding Step 2: Timeline
    await expect(page.locator("h1:has-text('Timeline details')")).toBeVisible();
    await page.selectOption("#stage-select", "Intern");
    await page.fill("#target-year-input", "2027");
    await page.fill("#target-date-input", "2027-03-05");
    await page.click("#continue-btn");

    // 4. Onboarding Step 3: Weak Subjects
    await expect(page.locator("h1:has-text('weak areas')")).toBeVisible();
    await page.click(subjectId);
    await page.click("#continue-btn");

    // 5. Land on Dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("#streak-count")).toContainText("Streak");
  }

  test("User 1 (Pharmacology focus) receives Pharmacology recommendations first", async ({ page }) => {
    console.log("--> Starting User 1 (Pharmacology Focus) flow");
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await runUserOnboarding(page, phone, "#subject-pharmacology");

    // Verify first card in feed is a Pharmacology item (MOA SGLT2 or Beta-blockers)
    const firstCard = page.locator(".feed-card").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText("Pharmacology");
    await expect(firstCard).toContainText(/Inhibitors|Beta-Blockers|SGLT2/);

    await page.screenshot({ path: path.join(__dirname, "screenshots/user-1-pharmacology-feed.png") });
    console.log("--> Verified User 1 Pharmacology feed successfully.");
  });

  test("User 2 (Pathology focus) receives Pathology recommendations first", async ({ page }) => {
    console.log("--> Starting User 2 (Pathology Focus) flow");
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await runUserOnboarding(page, phone, "#subject-pathology");

    // Verify first card is a Pathology item (Breast Tissue or Glomerulonephritis)
    const firstCard = page.locator(".feed-card").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText("Pathology");
    await expect(firstCard).toContainText(/Neoplastic|Glomerulonephritis|Breast/);

    await page.screenshot({ path: path.join(__dirname, "screenshots/user-2-pathology-feed.png") });
    console.log("--> Verified User 2 Pathology feed successfully.");
  });

  test("User 3 (General Surgery focus) receives General Surgery recommendations first", async ({ page }) => {
    console.log("--> Starting User 3 (General Surgery Focus) flow");
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await runUserOnboarding(page, phone, "#subject-general-surgery");

    // Verify first card is a General Surgery item (Cholecystectomy or Wound Healing)
    const firstCard = page.locator(".feed-card").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toContainText("General Surgery");
    await expect(firstCard).toContainText(/Cholecystectomy|Wound Healing/);

    // Trigger Impression & Dwell tracking by scrolling the card into view and waiting
    console.log("--> Intercepting feed event tracking requests");
    const eventPromise = page.waitForRequest(
      (request) =>
        request.url().includes("/api/feed/event") &&
        request.method() === "POST"
    );

    // Scroll first card to trigger impression
    await firstCard.scrollIntoViewIfNeeded();
    const eventRequest = await eventPromise;
    const postData = JSON.parse(eventRequest.postData() || "{}");
    expect(postData.eventType).toBe("content_viewed");
    console.log("--> Event tracking validation passed: Impression logged.", postData);

    await page.screenshot({ path: path.join(__dirname, "screenshots/user-3-surgery-feed.png") });
    console.log("--> Verified User 3 General Surgery feed successfully.");
  });
});
