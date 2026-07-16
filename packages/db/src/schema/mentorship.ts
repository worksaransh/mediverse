import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/* ═══════════════════════════════════════════
   MENTOR_PROFILES — Extends a user with mentor
   capabilities. A user applies to become a
   mentor; admins may later gate isActive.
   ═══════════════════════════════════════════ */

export const mentorProfiles = pgTable(
  "mentor_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    specialization: varchar("specialization", { length: 255 }).notNull(), // e.g. "NEET Biology Coaching", "Cardiology"
    bio: text("bio"),
    yearsExperience: integer("years_experience").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sessionCount: integer("session_count").default(0).notNull(),
    ratingSum: integer("rating_sum").default(0).notNull(),
    ratingCount: integer("rating_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("idx_mentor_profiles_user").on(table.userId),
    specializationIdx: index("idx_mentor_profiles_specialization").on(table.specialization),
    activeIdx: index("idx_mentor_profiles_active").on(table.isActive),
  }),
);

/* ═══════════════════════════════════════════
   MENTORSHIP_SESSIONS — A student's request
   for (and eventual outcome of) a mentoring
   session with a mentor.
   ═══════════════════════════════════════════ */

export const mentorshipSessions = pgTable(
  "mentorship_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mentorId: uuid("mentor_id")
      .references(() => mentorProfiles.id, { onDelete: "cascade" })
      .notNull(),
    studentId: uuid("student_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    topic: varchar("topic", { length: 500 }),
    message: text("message"), // the student's initial request message
    status: varchar("status", { length: 30 }).default("requested").notNull(), // requested | confirmed | declined | completed | cancelled
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    durationMinutes: integer("duration_minutes").default(30).notNull(),
    studentRating: integer("student_rating"), // 1-5, set once status = completed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    mentorIdx: index("idx_mentorship_sessions_mentor").on(table.mentorId),
    studentIdx: index("idx_mentorship_sessions_student").on(table.studentId),
    statusIdx: index("idx_mentorship_sessions_status").on(table.status),
  }),
);
