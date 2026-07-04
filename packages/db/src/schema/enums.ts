import { pgEnum } from "drizzle-orm/pg-core";

/* ─── User & Profile ─────────────────────── */

export const careerStageEnum = pgEnum("career_stage", [
  "preclinical",
  "pg_prep",
  "resident",
  "doctor",
]);

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "admin",
  "content_creator",
]);

/* ─── Content ────────────────────────────── */

export const contentTypeEnum = pgEnum("content_type", [
  "article",
  "video",
  "note",
  "flashcard",
  "diagram",
  "case_study",
  "guideline",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "in_review",
  "published",
  "archived",
]);

/* ─── Subscriptions ──────────────────────── */

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "cancelled",
  "expired",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "pro_monthly",
  "pro_yearly",
]);

/* ─── Organizations ──────────────────────── */

export const orgRoleEnum = pgEnum("org_role", [
  "owner",
  "admin",
  "member",
]);

/* ─── AI ─────────────────────────────────── */

export const aiMessageRoleEnum = pgEnum("ai_message_role", [
  "user",
  "assistant",
  "system",
]);

/* ─── Feed ───────────────────────────────── */

export const feedEventTypeEnum = pgEnum("feed_event_type", [
  "content_viewed",
  "content_completed",
  "quiz_started",
  "quiz_completed",
  "streak_updated",
  "bookmark_added",
  "ai_query",
]);

/* ─── Notifications ──────────────────────── */

export const notificationTypeEnum = pgEnum("notification_type", [
  "streak_reminder",
  "new_content",
  "quiz_result",
  "ai_response",
  "system",
]);
