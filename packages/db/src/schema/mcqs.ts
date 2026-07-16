import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { contentItems } from "./content";
import { topics } from "./curriculum";

/* ═══════════════════════════════════════════
   MCQs — Multiple Choice Questions
   ═══════════════════════════════════════════ */

export const mcqs = pgTable(
  "mcqs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contentItemId: uuid("content_item_id").references(() => contentItems.id),
    question: text("question").notNull(),
    options: jsonb("options").notNull(), // Array<{ key: string; text: string }>
    correctOption: varchar("correct_option", { length: 10 }).notNull(),
    explanation: text("explanation"),
    difficulty: integer("difficulty").default(3).notNull(), // 1-5
    subject: varchar("subject", { length: 255 }).notNull(),
    topicTags: text("topic_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    topicId: uuid("topic_id").references(() => topics.id),
    sourceReference: text("source_reference"),
    verified: boolean("verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    subjectIdx: index("idx_mcqs_subject").on(table.subject),
    topicTagsIdx: index("idx_mcqs_topic_tags").using("gin", table.topicTags),
    topicIdIdx: index("idx_mcqs_topic_id").on(table.topicId),
    difficultyIdx: index("idx_mcqs_difficulty").on(table.difficulty),
  }),
);

/* ═══════════════════════════════════════════
   MCQ_ATTEMPTS — Monthly partitioned
   Base table defined here; partition DDL in
   custom migration (drizzle/0000_enable_pgvector.sql).
   ═══════════════════════════════════════════ */

export const mcqAttempts = pgTable(
  "mcq_attempts",
  {
    id: uuid("id").defaultRandom().notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    mcqId: uuid("mcq_id")
      .references(() => mcqs.id, { onDelete: "cascade" })
      .notNull(),
    selectedOption: varchar("selected_option", { length: 10 }).notNull(),
    isCorrect: boolean("is_correct").notNull(),
    timeTakenMs: integer("time_taken_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_mcq_attempts_user")