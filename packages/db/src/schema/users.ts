import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userRoleEnum, careerStageEnum, examTargetEnum, academicStreamEnum } from "./enums";
import { colleges } from "./orgs";
import { customVector } from "./helpers";

/* ═══════════════════════════════════════════
   USERS
   ═══════════════════════════════════════════ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).unique(),
    passwordHash: text("password_hash"),
    name: varchar("name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").default("student").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    googleId: varchar("google_id", { length: 255 }).unique(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    phoneIdx: index("idx_users_phone").on(table.phone),
    googleIdx: index("idx_users_google_id").on(table.googleId),
  }),
);

/* ═══════════════════════════════════════════
   PROFILES
   ═══════════════════════════════════════════ */

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    careerStage: careerStageEnum("career_stage").default("pg_prep").notNull(),
    examTarget: examTargetEnum("exam_target").default("none").notNull(),
    academicStream: academicStreamEnum("academic_stream").default("not_applicable").notNull(),
    examTargetYear: integer("exam_target_year"),
    collegeId: uuid("college_id").references(() => colleges.id),
    specialization: varchar("specialization", { length: 255 }),
    interestVector: customVector("interest_vector", { dimensions: 768 }),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    aiProfile: jsonb("ai_profile"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updat