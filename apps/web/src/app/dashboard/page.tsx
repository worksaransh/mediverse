import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createDb, users, profiles, streaks } from "@mediverse/db";
import { eq } from "drizzle-orm";
import { Card, Button } from "@mediverse/ui";
import { DiscoverFeed } from "@/components/discover-feed";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Authenticate session
  const session = await getSession();
  if (!session || !session.userId) {
    redirect("/login");
  }

  // 2. Fetch DB Records
  const db = createDb();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    redirect("/login");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.userId),
  });

  // Redirect to onboarding if not complete
  if (!profile || !profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Fetch or init user streak
  let userStreak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, session.userId),
  });

  if (!userStreak) {
    const [newStreak] = await db
      .insert(streaks)
      .values({
        userId: session.userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date().toISOString().split("T")[0],
      })
      .returning();
    userStreak = newStreak;
  }

  // Parse AI Profile JSON
  const aiProfile: any = profile.aiProfile || {
    strengths_summary: "Study plan not generated yet.",
    study_strategy: "Update onboarding weak subjects to trigger AI recommendations.",
    weekly_goals: [],
    recommended_resources: [],
  };

  return (
    <div className="min-h-screen bg-[#0f1513] text-[#dee4e0] font-sans pb-20">
      {/* ─── Navigation ─── */}
      <nav className="border-b border-[#3d4946]/30 bg-[#0f1513]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5cdbc2] to-[#0fa891] flex items-center justify-center shadow-lg shadow-[#5cdbc2]/20">
              <span className="text-[#00201a] font-bold text-lg">M</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Mediverse</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-semibold">
              <span>🔥</span>
              <span id="streak-count">{userStreak?.currentStreak || 0} Day Streak</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5cdbc2]/10 border border-[#5cdbc2]/20 flex items-center justify-center text-[#5cdbc2] font-semibold text-sm">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden md:inline">{user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Layout ─── */}
      <main className="max-w-7xl mx-auto px-6 pt-12 grid lg:grid-cols-3 gap-8">
        {/* Left Side: Student Info */}
        <div className="space-y-6">
          <Card className="border-[#3d4946] bg-[#171d1b]">
            <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Preparation Scope</h2>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[#bccac4] block">Goal</span>
                <span id="exam-target" className="text-lg font-bold text-white">{profile.careerStage.toUpperCase()} ({profile.examTargetYear} Prep)</span>
              </div>
              <div>
                <span className="text-xs text-[#bccac4] block">Timeline Target</span>
                <span className="text-sm font-medium text-slate-300">Exam year: {profile.examTargetYear}</span>
              </div>
              <div>
                <span className="text-xs text-[#bccac4] block font-semibold mb-2">Target Stage</span>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[#5cdbc2] text-xs font-semibold rounded-md w-fit">
                  NEET PG Preparation
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-[#3d4946] bg-[#171d1b]">
            <h2 className="text-xs uppercase tracking-wider text-[#86948f] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/mcq" className="block w-full">
                <Button variant="primary" className="w-full justify-center">
                  📚 Start Practice MCQs
                </Button>
              </a>
              <a href="/mentor" className="block w-full" id="start-chat-btn">
                <Button variant="secondary" className="w-full justify-center">
                  💬 Chat with AI Mentor
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Right Side: AI Generated Profile (takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-[#171d1b] to-[#122822] border border-[#5cdbc2]/20 shadow-xl shadow-emerald-950/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h2 className="text-xl font-bold text-white">AI study plan ready</h2>
                <p className="text-xs text-[#5cdbc2] font-semibold uppercase tracking-wider">Powered by Claude 3.5 Haiku</p>
              </div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-[#5cdbc2]/30 to-transparent my-4" />
            <p className="text-[#dee4e0] text-sm leading-relaxed" id="strengths-summary">
              {aiProfile.strengths_summary}
            </p>
          </div>

          {/* Strategic Focus */}
          <Card className="border-[#3d4946] bg-[#171d1b] p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#86948f] mb-4">
              🎯 AI study strategy
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed" id="study-strategy">
              {aiProfile.study_strategy}
            </p>
          </Card>

          {/* Weekly Goals & Resources Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Goals */}
            <Card className="border-[#3d4946] bg-[#171d1b]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#86948f] mb-4">
                📅 Weekly Action Items
              </h3>
              <ul className="space-y-3" id="weekly-goals">
                {aiProfile.weekly_goals && aiProfile.weekly_goals.map((goal: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300 items-start">
                    <span className="text-[#5cdbc2] font-bold mt-0.5">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
                {(!aiProfile.weekly_goals || aiProfile.weekly_goals.length === 0) && (
                  <li className="text-sm text-slate-500 italic">No specific goals set.</li>
                )}
              </ul>
            </Card>

            {/* Recommended Resources */}
            <Card className="border-[#3d4946] bg-[#171d1b]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#86948f] mb-4">
                📖 Recommended Resources
              </h3>
              <ul className="space-y-3" id="recommended-resources">
                {aiProfile.recommended_resources && aiProfile.recommended_resources.map((resource: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300 items-start">
                    <span className="text-[#5cdbc2] font-bold mt-0.5">✔</span>
                    <span>{resource}</span>
                  </li>
                ))}
                {(!aiProfile.recommended_resources || aiProfile.recommended_resources.length === 0) && (
                  <li className="text-sm text-slate-500 italic">No resources recommended.</li>
                )}
              </ul>
            </Card>
          </div>

          {/* Recommended Discover Feed */}
          <div className="mt-8 border-t border-[#3d4946]/40 pt-8">
            <h4 className="font-semibold text-xs tracking-widest text-[#86948f] uppercase mb-6">
              Recommended for you
            </h4>
            <DiscoverFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
