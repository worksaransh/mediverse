import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  real,
  date,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/* ═══════════════════════════════════════════
   USER_TOPIC_MASTERY
   Composite PK: (user_id, topic_tag)
   Tracks accuracy via exponential moving average.
   ═══════════════════════════════════════════ */

export const userTopicMastery = pgTable(
  "user_topic_mastery",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    topicTag: varchar("topic_tag", { length: 255 }).notNull(),
    attemptsCount: integer("attempts_count").default(0).notNull(),
    correctCount: integer("correct_count").default(0).notNull(),
    accuracyEma: real("accuracy_ema").default(0).notNull(), // exponential moving average
    easinessFactor: real("easiness_factor").default(2.5).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    intervalDays: integer("interval_days").default(0).notNull(),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.topicTag] }),
    userIdx: index("idx_mastery_user").on(table.userId),
    accuracyIdx: index("idx_mastery_accuracy").on(table.accuracyEma),
  }),
);

/* ═══════════════════════════════════════════
   STREAKS — Daily study streaks
   ═══════════════════════════════════════════ */

export const streaks = pgTable(
  "streaks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    lastActivityDate: date("last_activity_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("idx_streaks_user").on(table.userId),
  }),
);
