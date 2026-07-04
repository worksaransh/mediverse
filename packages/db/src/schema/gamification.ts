import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  real,
  date,
  index,
  jsonb,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/* ═══════════════════════════════════════════
   LEADERBOARD_SNAPSHOTS — Weekly/monthly
   leaderboard rankings computed by the worker.
   ═══════════════════════════════════════════ */

export const leaderboardSnapshots = pgTable(
  "leaderboard_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    period: varchar("period", { length: 20 }).notNull(), // weekly | monthly | all_time
    periodStart: date("period_start").notNull(),
    rank: integer("rank").notNull(),
    score: integer("score").notNull(), // XP or composite metric
    questionsAttempted: integer("questions_attempted").default(0).notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    streakDays: integer("streak_days").default(0).notNull(),
    studyMinutes: integer("study_minutes").default(0).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userPeriodIdx: uniqueIndex("idx_leaderboard_user_period").on(
      table.userId,
      table.period,
      table.periodStart,
    ),
    rankIdx: index("idx_leaderboard_rank").on(table.period, table.periodStart, table.rank),
    scoreIdx: index("idx_leaderboard_score").on(table.period, table.periodStart, table.score),
  }),
);

/* ═══════════════════════════════════════════
   ACHIEVEMENTS / BADGES — Gamification
   ═══════════════════════════════════════════ */

export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    iconUrl: text("icon_url"),
    category: varchar("category", { length: 50 }).notNull(), // study | quiz | streak | social | content
    xpReward: integer("xp_reward").default(0).notNull(),
    requirement: jsonb("requirement").notNull(), // { type: "streak", value: 7 } etc.
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("idx_achievements_slug").on(table.slug),
    categoryIdx: index("idx_achievements_category").on(table.category),
  }),
);

/* ═══════════════════════════════════════════
   USER_ACHIEVEMENTS — Earned badges
   ═══════════════════════════════════════════ */

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    achievementId: uuid("achievement_id")
      .references(() => achievements.id, { onDelete: "cascade" })
      .notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb("metadata"), // context: which quiz, which streak, etc.
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.achievementId] }),
    userIdx: index("idx_user_achievements_user").on(table.userId),
    achievementIdx: index("idx_user_achievements_ach").on(table.achievementId),
    earnedIdx: index("idx_user_achievements_earned").on(table.earnedAt),
  }),
);

/* ═══════════════════════════════════════════
   USER_XP_LOG — XP gain history
   ═══════════════════════════════════════════ */

export const userXpLog = pgTable(
  "user_xp_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    amount: integer("amount").notNull(),
    source: varchar("source", { length: 50 }).notNull(), // quiz | flashcard | streak | achievement | daily_login
    sourceId: uuid("source_id"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_xp_log_user").on(table.userId),
    sourceIdx: index("idx_xp_log_source").on(table.source),
    createdIdx: index("idx_xp_log_created").on(table.createdAt),
  }),
);
