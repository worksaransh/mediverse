import { createDb, users, profiles, streaks, contentItems } from "@mediverse/db";
import { eq } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export interface DigestResult {
  success: boolean;
  userId: string;
  email: string;
  digestText: string;
  nudgeText?: string;
  sent: boolean;
  reason?: string;
}

/**
 * Compiles a personalized digest for a user, checking quiet hours.
 * @param userId Target user ID
 * @param overrideHour Optional mock current local hour (0-23) to test quiet hours
 */
export async function composeDailyDigest(
  userId: string,
  overrideHour?: number
): Promise<DigestResult> {
  const db = createDb();

  // 1. Fetch user & profile
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!user || !profile) {
    return {
      success: false,
      userId,
      email: user?.email || "unknown@mediverse.org",
      digestText: "",
      sent: false,
      reason: "User or profile not found",
    };
  }

  // 2. Quiet Hours Check (8:00 AM to 9:00 PM local time allowed)
  // Default offset: UTC + 5.5 hours (India Standard Time)
  const localDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const localHour = overrideHour !== undefined ? overrideHour : localDate.getUTCHours();

  console.log(`[Digest Composer] User local hour is ${localHour}:00. Checking quiet hours...`);
  if (localHour < 8 || localHour >= 21) {
    console.log(`[Digest Composer] Sending blocked: Quiet hours are active (8 AM to 9 PM only).`);
    return {
      success: true,
      userId,
      email: user.email || "recipient@mediverse.org",
      digestText: "Draft: Quiet hours active. Rescheduled.",
      sent: false,
      reason: "Quiet hours active",
    };
  }

  // 3. Streak & MCQ nudge check
  const streakRecord = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const completedToday = streakRecord?.lastActivityDate === todayStr;
  
  let nudgeText = "";
  if (!completedToday) {
    const currentStreak = streakRecord?.currentStreak || 0;
    nudgeText = currentStreak > 0
      ? `Don't break your ${currentStreak}-day streak! Complete your daily adaptive MCQ set now.`
      : "Start your study habit today! Complete a quick 5-question adaptive MCQ set.";
  }

  // 4. Fetch content items from last 24 hours (fallback to all published if none)
  const allContent = await db.query.contentItems.findMany({
    where: eq(contentItems.status, "published"),
  });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let recentContent = allContent.filter((item: any) => new Date(item.publishedAt || item.createdAt) >= oneDayAgo);
  
  if (recentContent.length === 0) {
    recentContent = allContent; // fallback
  }

  const aiProfile = profile.aiProfile as any;
  const weakSubjects = aiProfile?.weak_subjects || [];

  // Filter content matching weak subjects for hyper-personalization
  const personalContent = recentContent.filter((item: any) => {
    return weakSubjects.some((ws: string) => {
      const inSpecialty = (item.specialtyTags || []).some((s: string) => s.toLowerCase().includes(ws.toLowerCase()));
      const inTopics = (item.topicTags || []).some((t: string) => t.toLowerCase().includes(ws.toLowerCase()));
      return inSpecialty || inTopics;
    });
  });

  const finalCandidates = personalContent.length > 0 ? personalContent : recentContent;

  // 5. Generate personalized digest content using Claude (or mock fallback)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let digestText = "";

  if (!apiKey || apiKey === "sk-ant-xxxxx") {
    // Return high-quality profile-specific mock digest
    const subjectsStr = weakSubjects.join(", ") || "General Medicine";
    const titleSnippet = finalCandidates[0]?.title || "Clinical Guidelines Review";
    digestText = `[Mediverse Digest] Tailored high-yield review for your target weak areas (${subjectsStr}): We highlight the key mechanics of "${titleSnippet}". Focus on clinical correlations and diagnostic indicators.`;
  } else {
    try {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `You are a medical copywriter composing a daily personalized newsletter digest for an MBBS student.
Their focus areas are: ${weakSubjects.join(", ")}.
We have these new medical papers:
${finalCandidates.map((c: any) => `- [${c.specialtyTags?.join(", ") || "General"}] ${c.title}: ${c.body}`).join("\n")}

Synthesize a concise, 2-line daily high-yield digest highlighting exam points.
Keep it extremely professional and clinical.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      });
      digestText = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    } catch (e) {
      digestText = `Your daily personalized high-yield review is ready. Review highlights on ${weakSubjects.join(", ")}.`;
    }
  }

  // 6. Simulate Resend / SES and FCM Push dispatches
  console.log(`[Resend Email Dispatch] Sending to: ${user.email}`);
  console.log(`[Resend Email Body]\n${digestText}\n${nudgeText}`);
  console.log(`[FCM Push Alert] Sent to user ${userId} device: "${nudgeText || "Your daily digest is ready!"}"`);

  return {
    success: true,
    userId,
    email: user.email || "recipient@mediverse.org",
    digestText,
    nudgeText,
    sent: true,
  };
}
