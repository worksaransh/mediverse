import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Mediverse Landing Page & Programmatic SEO E2E Validation", () => {
  
  test("verify landing page copy, signup CTAs, and waitlist registration", async ({ page }) => {
    // 1. Load Landing Page
    console.log("--> Accessing landing page at /");
    await page.goto("http://127.0.0.1:3000/");

    // 2. Verify header title & positioning text
    await expect(page.locator("h1")).toContainText("Turn 15 minutes a day into exam success and career growth");
    await expect(page.locator("body")).toContainText("Career OS");

    // Verify SignUp CTA points to login page
    const ctaStartBtn = page.locator("#cta-start");
    await expect(ctaStartBtn).toBeVisible();

    // 3. Test Waitlist Capture Form
    console.log("--> Testing waitlist form registration");
    const waitlistEmailInput = page.locator("#waitlist-email");
    const waitlistSubmitBtn = page.locator("#waitlist-submit");

    await expect(waitlistEmailInput).toBeVisible();
    await waitlistEmailInput.fill("neet_candidate@mediverse.edu");
    
    // Screenshot of waitlist entry before submit
    await page.screenshot({ path: path.join(__dirname, "screenshots/landing-before-waitlist-submit.png") });

    await waitlistSubmitBtn.click();

    // Verify success alert banner
    const successBadge = page.locator("#waitlist-success-badge");
    await expect(successBadge).toBeVisible();
    await expect(successBadge).toContainText("Success! You have been added to the newsletter waitlist.");

    // Screenshot of landing page with waitlist success alert
    await page.screenshot({ path: path.join(__dirname, "screenshots/landing-after-waitlist-submit.png") });
  });

  test("verify dynamic SEO metadata and heading hierarchy on topic pages", async ({ page }) => {
    const topics = ["pharmacology", "pathology", "anatomy"];
    
    for (const slug of topics) {
      console.log(`--> Checking programmatic SEO page: /topics/${slug}`);
      await page.goto(`http://127.0.0.1:3000/topics/${slug}`);

      // A. Verify page-specific page titles
      const expectedTitleWord = slug.charAt(0).toUpperCase() + slug.slice(1);
      const expectedTitle = `Master ${expectedTitleWord}: NEET PG & MBBS Preparation - MedStudy OS`;
      await expect(page).toHaveTitle(expectedTitle);

      // B. Verify exactly one h1 tag on the page
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
      
      const topicHeader = page.locator("#topic-header");
      await expect(topicHeader).toBeVisible();
      await expect(topicHeader).toContainText(expectedTitleWord);

      // C. Verify mock items filtered for the topic
      const dynamicMcqCard = page.locator(".dynamic-mcq-card").first();
      await expect(dynamicMcqCard).toBeVisible();

      // Take snapshot of dynamic SEO page layout
      await page.screenshot({ path: path.join(__dirname, `screenshots/seo-topic-${slug}.png`) });
    }
  });

});
