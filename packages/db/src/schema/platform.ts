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

/* ═══════════════════════════════════════════
   ANNOUNCEMENTS — Platform-wide or targeted
   announcements from admins.
   ═══════════════════════════════════════════ */

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body").notNull(),
    type: varchar("type", { length: 30 }).default("info").notNull(), // info | warning | update | promo
    targetAudience: text("target_audience")
      .array()
      .default(sql`'{}'::text[]`), // career stages / exam targets; empty = all
    priority: integer("priority").default(0).notNull(), // 0 = normal, 1 = high, 2 = critical
    actionUrl: text("action_url"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    active: boolean("active").default(true).notNull(),
    authorId: uuid("author_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    activeIdx: index("idx_announcements_active").on(table.active, table.publishedAt),
    typeIdx: index("idx_announcements_type").on(table.type),
    priorityIdx: index("idx_announcements_priority").on(table.priority),
  }),
);

/* ═══════════════════════════════════════════
   REPORTS — User-generated content reports
   for moderation.
   ═══════════════════════════════════════════ */

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(), // content | message | user | mcq
    targetId: uuid("target_id").notNull(),
    reason: varchar("reason", { length: 100 }).notNull(), // inappropriate | incorrect | spam | other
    description: text("description"),
    status: varchar("status", { length: 30 }).default("pending").notNull(), // pending | reviewed | resolved | dismissed
    reviewedBy: uuid("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    resolution: text("resolution"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    reporterIdx: index("idx_reports_reporter").on(table.reporterId),
    targetIdx: index("idx_reports_target").on(table.targetType, table.targetId),
    statusIdx: index("idx_reports_status").on(table.status),
  }),
);

/* ═══════════════════════════════════════════
   WAITLIST — Pre-launch waitlist signups
   ═══════════════════════════════════════════ */

export const waitlist = pgTable(
  "waitlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    examTarget: varchar("exam_target", { length: 100 }),
    referralCode: varchar("referral_code", { length: 50 }),
    referredBy: uuid("referred_by"),
    convertedToUserId: uuid("converted_to_user_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("idx_waitlist_email").on(table.email),
    referralIdx: index("idx_waitlist_referral").on(table.referralCode),
    createdIdx: index("idx_waitlist_created").on(table.createdAt),
  }),
);

/* ═══════════════════════════════════════════
   PLATFORM_SETTINGS — Dynamic configurations
   ═══════════════════════════════════════════ */

export const platformSettings = pgTable(
  "platform_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 100 }).unique().notNull(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    keyIdx: index("idx_platform_settings_key").on(table.key),
  }),
);

