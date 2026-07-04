import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { selectNextMcq } from "@/lib/mcq-selector";
import { cookies } from "next/headers";

/**
 * GET /api/mcq/next
 * Fetch the next adaptive MCQ for a user.
 */
export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Read parameters
    const url = new URL(req.url);
    const excludeStr = url.searchParams.get("exclude") || "";
    const excludeIds = excludeStr ? excludeStr.split(",") : [];

    // Read failed topic from session cookie
    const cookieStore = await cookies();
    const forcedTopic = cookieStore.get("mcq_failed_topic")?.value || null;

    // 3. Select next question
    const result = await selectNextMcq(session.userId, forcedTopic, excludeIds);

    if (!result) {
      return NextResponse.json({ completed: true });
    }

    return NextResponse.json({
      completed: false,
      mcq: {
        id: result.mcq.id,
        question: result.mcq.question,
        options: result.mcq.options,
        subject: result.mcq.subject,
        topicTags: result.mcq.topicTags,
        difficulty: result.mcq.difficulty,
      },
      adaptivityMessage: result.adaptivityMessage,
      selectedTopic: result.selectedTopic,
    });
  } catch (error: any) {
    console.error("[MCQ Next API] Error fetching next question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
