import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { contentItems } from "./content";
import { feedEventTypeEnum, notificationTypeEnum } from "./enums";

/* ═══════════════════════════════════════════
   FEED_EVENTS — Monthly partitioned
   Base table; partition DDL in custom migration.
   ═══════════════════════════════════════════ */

export const feedEvents = pgTable(
  "feed_events",
  {
    id: uuid("id").defaultRandom().notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    eventType: feedEventTypeEnum("event_type").notNull(),
    contentItemId: uuid("content_item_id").references(() => contentItems.id),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_feed_events_user").on(table.userId),
    eventTypeIdx: index("idx_feed_events_type").on(table.eventType),
    createdAtIdx: index("idx_feed_events_created").on(table.createdAt),
  }),
);

/* ═══════════════════════════════════════════
   BOOKMARKS
   ═══════════════════════════════════════════ */

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    contentItemId: uuid("content_item_id")
      .references(() => contentItems.id, { onDelete: "cascade" })
      .notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_bookmarks_user").on(table.userId),
    contentIdx: index("idx_bookmarks_content").on(table.contentItemId),
    userContentIdx: index("idx_bookmarks_user_content").on(
      table.userId,
      table.contentItemId,
    ),
  }),
);

/* ═══════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════ */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body"),
    read: boolean("read").default(false).notNull(),
    actionUrl: text("action_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_notifications_user").on(table.userId),
    userUnreadIdx: index("idx_notifications_user_unread").on(
      table.userId,
      table.read,
    ),
  }),
);
