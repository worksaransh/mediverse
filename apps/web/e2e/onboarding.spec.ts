import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mediverse Signup, Onboarding & Dashboard E2E", () => {
  test("complete sign-up, Stitch onboarding steps, and land on personal study dashboard", async ({ page }) => {
    // 1. Visit Login Page
    console.log("--> Navigating to /login");
    await page.goto("/login");
    await expect(page).toHaveTitle(/MedStudy OS Onboarding|Mediverse/);
    await page.screenshot({ path: path.join(__dirname, "screenshots/1-login-page.png") });

    // 2. Input Phone Number & Request OTP
    console.log("--> Inputting phone number");
    const randomPhone = `98${Math.floor(100000 + Math.random() * 900000)}00`;
    await page.fill("#phone-input", randomPhone);
    await page.screenshot({ path: path.join(__dirname, "screenshots/2-phone-inputted.png") });
    await page.click("#send-otp-btn");

    // 3. Wait for OTP Verification Step & Submit code
    console.log("--> Waiting for OTP input screen");
    await expect(page.locator("#otp-input")).toBeVisible();
    await page.fill("#otp-input", "1234");
    await page.screenshot({ path: path.join(__dirname, "screenshots/3-otp-inputted.png") });
    await page.click("#verify-otp-btn");

    // 4. Onboarding Step 1: Exam Selection (Stitch design)
    console.log("--> Waiting for Onboarding Step 1");
    await expect(page.locator("h1:has-text('preparing for')")).toBeVisible();
    
    // Choose NEET PG
    await page.click("#exam-neet-pg");
    await page.screenshot({ path: path.join(__dirname, "screenshots/4-exam-selected.png") });
    await page.click("#continue-btn");

    // 5. Onboarding Step 2: Timeline Details
    console.log("--> Waiting for Onboarding Step 2");
    await expect(page.locator("h1:has-text('Timeline details')")).toBeVisible();
    
    // Fill form fields
    await page.selectOption("#stage-select", "Intern");
    await page.fill("#target-year-input", "2027");
    await page.fill("#target-date-input", "2027-03-05");
    await page.screenshot({ path: path.join(__dirname, "screenshots/5-timeline-details.png") });
    await page.click("#continue-btn");

    // 6. Onboarding Step 3: Weak Subjects Selection
    console.log("--> Waiting for Onboarding Step 3");
    await expect(page.locator("h1:has-text('weak areas')")).toBeVisible();
    
    // Choose Pharmacology and Pathology
    await page.click("#subject-pharmacology");
    await page.click("#subject-pathology");
    await page.screenshot({ path: path.join(__dirname, "screenshots/6-subjects-selected.png") });
    
    // Complete Onboarding
    await page.click("#continue-btn");

    // 7. Verify Dashboard redirect & display of personal AI study plan
    console.log("--> Waiting for Dashboard redirect");
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Validate custom items
    await expect(page.locator("#streak-count")).toContainText("Streak");
    await expect(page.locator("#exam-target")).toContainText("PG_PREP");
    await expect(page.locator("#strengths-summary")).toBeVisible();
    await expect(page.locator("#study-strategy")).toBeVisible();
    
    console.log("--> Verified AI Profile data displayed successfully.");
    await page.screenshot({ path: path.join(__dirname, "screenshots/7-dashboard-completed.png") });
  });
});
