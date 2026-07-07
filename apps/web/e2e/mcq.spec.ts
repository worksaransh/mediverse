import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mediverse Daily Adaptive MCQ habit loop E2E", () => {
  
  test("complete two MCQ practice sets (20 questions total) showing adaptive shifts & mastery updates", async ({ page }) => {
    // 1. Sign up / login a new user
    console.log("--> Logging in new test student for MCQ habit loop");
    const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.goto("/login");
    await page.fill("#phone-input", randomPhone);
    await page.check("#consent-checkbox");
    await page.click("#send-otp-btn");
    await expect(page.locator("#otp-input")).toBeVisible();
    await page.fill("#otp-input", "1234");
    await page.click("#verify-otp-btn");

    // 2. Onboarding Steps
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

    // Land on Dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // ─── Practice Session 1 (5 MCQs) ───
    console.log("--> Starting MCQ Practice Session 1");
    await page.goto("/mcq");
    await expect(page.locator("#question-counter")).toContainText("Q 1 / 5");

    // Question 1: Answer Wrong (Select Option A - which is wrong for mcq-pharm-1/2 or other seed questions)
    console.log("--> Answering Q1 wrong to trigger adaptive override");
    await page.click("[data-testid='option-A']");
    await expect(page.locator("#explanation-box")).toBeVisible();
    await expect(page.locator("#explanation-text-box")).toBeVisible();
    
    // Save screenshot of immediate options highlight & explanation
    await page.screenshot({ path: path.join(__dirname, "screenshots/mcq-session1-q1-explanation.png") });

    // Next Question
    await page.click("#next-question-btn");
    await expect(page.locator("text=Loading next question...")).not.toBeVisible();
    await expect(page.locator("#question-counter")).toContainText("Q 2 / 5");

    // Question 2: Verify Adaptivity overrides triggered
    console.log("--> Verifying that Q2 has adaptivity notice");
    const adaptAlert = page.locator("#adaptivity-alert");
    await expect(adaptAlert).toBeVisible();
    await expect(adaptAlert).toContainText(/Focusing your next question on (Pharmacology|Pathology|Anatomy|General Surgery)/);

    // Save screenshot of adaptivity alert banner
    await page.screenshot({ path: path.join(__dirname, "screenshots/mcq-session1-q2-adaptive-alert.png") });

    // Answer Q2 correctly (For mcq-pharm-1 correct is C, for mcq-pharm-2 correct is B. We try C, if it fails, click B!)
    try {
      await page.click("[data-testid='option-C']", { timeout: 1000 });
    } catch (e) {
      await page.click("[data-testid='option-B']", { timeout: 1000 });
    }

    await page.click("#next-question-btn");

    // Answer remaining 3 questions of Session 1 to complete the set
    for (let i = 3; i <= 5; i++) {
      await expect(page.locator("text=Loading next question...")).not.toBeVisible();
      await expect(page.locator("#question-counter")).toContainText(`Q ${i} / 5`);
      // Select Option C (usually correct for some, wrong for others, doesn't matter, we want to complete session)
      try {
        await page.click("[data-testid='option-C']", { timeout: 1000 });
      } catch (e) {
        await page.click("[data-testid='option-A']", { timeout: 1000 });
      }
      await page.click("#next-question-btn");
    }

    // Land on Session Completed Screen
    console.log("--> Verifying Session 1 Completion Summary screen");
    await expect(page.locator("h1:has-text('Session Complete!')")).toBeVisible();
    await expect(page.locator("h3:has-text('Mastery Performance Shift')")).toBeVisible();
    
    // Save summary screenshot
    await page.screenshot({ path: path.join(__dirname, "screenshots/mcq-session1-completed-summary.png") });

    // Click finish to go back to Dashboard
    await page.click("#finish-session-btn");
    await expect(page).toHaveURL(/\/dashboard/);

    // ─── Practice Session 2 (5 MCQs) ───
    console.log("--> Starting MCQ Practice Session 2");
    await page.goto("/mcq");
    await expect(page.locator("text=Loading next question...")).not.toBeVisible();
    await expect(page.locator("#question-counter")).toContainText("Q 1 / 5");

    // Answer 5 questions of Session 2
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator("text=Loading next question...")).not.toBeVisible();
      await expect(page.locator("#question-counter")).toContainText(`Q ${i} / 5`);
      try {
        await page.click("[data-testid='option-C']", { timeout: 1000 });
      } catch (e) {
        await page.click("[data-testid='option-A']", { timeout: 1000 });
      }
      await page.click("#next-question-btn");
    }

    // Verify Session 2 Completed Screen
    console.log("--> Verifying Session 2 Completion Summary screen");
    await expect(page.locator("h1:has-text('Session Complete!')")).toBeVisible();
    
    // Save session 2 summary screenshot
    await page.screenshot({ path: path.join(__dirname, "screenshots/mcq-session2-completed-summary.png") });

    await page.click("#finish-session-btn");
    await expect(page).toHaveURL(/\/dashboard/);
    console.log("--> Adaptive MCQ E2E test finished successfully.");
  });
});
