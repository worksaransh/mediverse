import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { mcqs } from "./mcqs";

/* ═══════════════════════════════════════════
   QUIZ_SESSIONS — Timed quiz / mock test
   A session groups multiple MCQ attempts
   with timer metadata and scoring.
   ═══════════════════════════════════════════ */

export const quizSessions = pgTable(
  "quiz_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    mode: varchar("mode", { length: 30 }).default("practice").notNull(), // practice | timed | mock_exam
    subject: varchar("subject", { length: 255 }),
    totalQuestions: integer("total_questions").default(0).notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    skippedQuestions: integer("skipped_questions").default(0).notNull(),
    timeLimitSeconds: integer("time_limit_seconds"),
    timeTakenSeconds: integer("time_taken_seconds"),
    scorePercent: integer("score_percent"),
    status: varchar("status", { length: 30 }).default("in_progress").notNull(), // in_progress | completed | abandoned
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: jsonb("metadata"), // difficulty distribution, topic breakdown
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_quiz_sessions_user").on(table.userId),
    statusIdx: index("idx_quiz_sessions_status").on(table.status),
    modeIdx: index("idx_quiz_sessions_mode").on(table.mode),
    startedIdx: index("idx_quiz_sessions_started").on(table.startedAt),
  }),
);

/* ═══════════════════════════════════════════
   QUIZ_SESSION_QUESTIONS — Links a session
   to individual MCQ attempts with ordering.
   ═══════════════════════════════════════════ */

export const quizSessionQuestions = pgTable(
  "quiz_session_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .references(() => quizSessions.id, { onDelete: "cascade" })
      .notNull(),
    mcqId: uuid("mcq_id")
      .references(() => mcqs.id, { onDelete: "cascade" })
      .notNull(),
    questionOrder: integer("question_order").notNull(),
    selectedOption: varchar("selected_option", { length: 10 }),
    isCorrect: integer("is_correct"), // null = not answered, 0 = wrong, 1 = correct
    timeTakenMs: integer("time_taken_ms"),
    flagged: integer("flagged").default(0).notNull(), // 0 = not flagged, 1 = flagged for review
    answeredAt: timestamp("answered_at", { withTimezone: true }),
  },
  (table) => ({
    sessionIdx: index("idx_quiz_session_q_session").on(table.sessionId),
    mcqIdx: index("idx_quiz_session_q_mcq").on(table.mcqId),
    orderIdx: index("idx_quiz_session_q_order").on(table.sessionId, table.questionOrder),
  }),
);
