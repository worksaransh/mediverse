import { NextResponse } from "next/server";
import { createDb, platformSettings } from "@mediverse/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = createDb();
    const settings = await db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, "community_links"),
    });

    const defaultLinks = {
      whatsappChannel: "https://whatsapp.com/channel/mock-channel",
      whatsappCommunity: "https://chat.whatsapp.com/mock-community-link",
      telegramChannel: "https://t.me/mock-channel-link",
      telegramGroup: "https://t.me/mock-group-link",
      discord: "https://discord.gg/mock-invite",
      instagram: "https://instagram.com/mediverse_mock",
      linkedin: "https://linkedin.com/company/mediverse-mock",
      youtube: "https://youtube.com/@mediverse_mock"
    };

    return NextResponse.json({
      success: true,
      links: settings?.value || defaultLinks,
    });
  } catch (error: any) {
    console.error("[Settings API] Error fetching community links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
