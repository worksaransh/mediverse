import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mediverse AI Mentor and Clinical Safety E2E", () => {
  
  test("chat with AI mentor, verify clinical safety redirects, RAG citations, and UI highlights", async ({ page }) => {
    // 1. Sign up / login a new user
    console.log("--> Logging in new test student for AI Mentor tests");
    const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.goto("/login");
    await page.fill("#phone-input", randomPhone);
    await page.click("#send-otp-btn");
    await expect(page.locator("#otp-input")).toBeVisible();
    await page.fill("#otp-input", "1234");
    await page.click("#verify-otp-btn");

    // Onboarding Steps
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

    // 2. Click start chat button to go to AI Mentor chat page
    await page.click("#start-chat-btn");
    await expect(page).toHaveURL(/\/mentor/);

    // 3. Trigger clinical safety disclaimer redirect
    console.log("--> Sending diagnostic clinical query to test safety filters");
    const chatInput = page.locator("#chat-input");
    await chatInput.click();
    await chatInput.pressSequentially("Can you diagnose my sudden chest pain radiating to neck?", { delay: 10 });
    await page.click("#chat-send-btn");

    // Wait for response and check disclaimer text
    const disclaimerBubble = page.locator("text=AI-generated Disclaimer: I am an AI Mentor study assistant, not a doctor");
    await expect(disclaimerBubble).toBeVisible();
    await expect(page.locator("text=Clinical Safety Redirect")).toBeVisible();

    // Save screenshot of safety warnings
    await page.screenshot({ path: path.join(__dirname, "screenshots/mentor-clinical-safety-alert.png") });

    // 4. Trigger RAG literature research queries with citations
    console.log("--> Sending research query to check vector RAG and citations");
    await chatInput.click();
    // Clear previous input
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await chatInput.pressSequentially("Show me recent research papers on SGLT2 inhibitors", { delay: 10 });
    await page.click("#chat-send-btn");

    // Wait for citations reference badge
    const citationBadge = page.locator("[data-testid^='citation-']").first();
    await expect(citationBadge).toBeVisible();
    await expect(citationBadge).toContainText("feed-item-3");

    // Save screenshot of citations
    await page.screenshot({ path: path.join(__dirname, "screenshots/mentor-rag-citations.png") });

    // 5. Send standard study help prompt
    console.log("--> Sending study scheduling query");
    await chatInput.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await chatInput.pressSequentially("Give me a high-yield study plan for Pharmacology", { delay: 10 });
    await page.click("#chat-send-btn");

    // Verify response
    await expect(page.locator("text=pharmacology review")).toBeVisible({ timeout: 10000 });

    console.log("--> AI Mentor E2E tests completed successfully.");
  });
});
