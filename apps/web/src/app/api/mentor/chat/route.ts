import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDb, aiConversations, aiMessages, aiUsageDaily, contentItems, profiles, userTopicMastery } from "@mediverse/db";
import { eq, and } from "drizzle-orm";
import { routeIntent, generateMentorResponse } from "@mediverse/ai";

/**
 * POST /api/mentor/chat
 * Handles incoming chat messages to the AI Mentor.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const db = createDb();
    const userId = session.userId;

    // 2. Check and enforce daily AI usage quota
    const todayStr = new Date().toISOString().split("T")[0]!;
    let usage = await db.query.aiUsageDaily.findFirst({
      where: and(
        eq(aiUsageDaily.userId, userId),
        eq(aiUsageDaily.date, todayStr)
      ),
    });

    if (usage && usage.messagesCount >= 20) {
      return NextResponse.json(
        { error: "Daily AI message quota (20) exceeded." },
        { status: 429 }
      );
    }

    // 3. Resolve or create active conversation
    let conversation = await db.query.aiConversations.findFirst({
      where: eq(aiConversations.userId, userId),
    });

    if (!conversation) {
      const inserted = await db.insert(aiConversations).values({
        userId,
        title: "AI Mentor Chat Session",
        subject: "General Medicine",
      }).returning();
      
      conversation = inserted[0] || { id: "conv-fallback-id" };
    }

    // 4. Retrieve user profile and performance mastery
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    const masteryList = await db.query.userTopicMastery.findMany({
      where: eq(userTopicMastery.userId, userId),
    });

    // 5. Route Intent via classifier
    const intent = await routeIntent(prompt);

    // 6. Resolve RAG Literature context if query targets news or research
    let context = "";
    if (intent === "research_query" || intent === "news_query") {
      const allItems = await db.query.contentItems.findMany({
        where: eq(contentItems.status, "published"),
      });

      // Filter/rank items containing relevant clinical keywords
      const matched = allItems.filter((item: any) => {
        const title = (item.title || "").toLowerCase();
        const body = (item.body || "").toLowerCase();
        const tags = (item.topicTags || []).map((t: string) => t.toLowerCase());
        const query = prompt.toLowerCase();

        return (
          title.includes("wound") || body.includes("wound") ||
          title.includes("breast") || body.includes("breast") ||
          title.includes("cancer") || body.includes("cancer") ||
          title.includes("sglt2") || body.includes("sglt2") ||
          title.includes("pathology") || body.includes("pathology") ||
          tags.some((tag: string) => query.includes(tag))
        );
      });

      if (matched.length > 0) {
        context = matched
          .slice(0, 3)
          .map((item: any) => `[ID: ${item.id}] Subject: ${item.subject}. Title: ${item.title}. Body: ${item.body}`)
          .join("\n\n");
      }
    }

    // 7. Generate Response using AI model or mock fallback
    const result = await generateMentorResponse({
      userId,
      prompt,
      intent,
      context,
      userProfile: userProfile ? {
        name: "Doctor Candidate",
        careerStage: userProfile.careerStage || "pg_prep",
        examTargetYear: userProfile.examTargetYear || 2027,
        aiProfile: userProfile.aiProfile,
      } : undefined,
      masteryList: masteryList.map((m: any) => ({
        topicTag: m.topicTag,
        accuracyEma: m.accuracyEma,
      })),
    });

    // 8. Log messages in the database
    // Log user message
    await db.insert(aiMessages).values({
      conversationId: conversation.id,
      role: "user",
      content: prompt,
      flagged: false,
    });

    // Log assistant message
    await db.insert(aiMessages).values({
      conversationId: conversation.id,
      role: "assistant",
      content: result.answer,
      citedContentIds: result.citedContentIds,
      flagged: result.flagged,
    });

    // 9. Increment daily usage tracking
    if (usage) {
      await db
        .update(aiUsageDaily)
        .set({
          messagesCount: usage.messagesCount + 1,
        })
        .where(eq(aiUsageDaily.id, usage.id));
    } else {
      await db.insert(aiUsageDaily).values({
        userId,
        date: todayStr,
        messagesCount: 1,
      });
    }

    return NextResponse.json({
      answer: result.answer,
      citedContentIds: result.citedContentIds,
      flagged: result.flagged,
    });

  } catch (error: any) {
    console.error("[Mentor Chat Route] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
