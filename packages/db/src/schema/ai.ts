import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  date,
  index,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { contentItems } from "./content";
import { aiMessageRoleEnum } from "./enums";

/* ═══════════════════════════════════════════
   AI_CONVERSATIONS
   ═══════════════════════════════════════════ */

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }),
    subject: varchar("subject", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("idx_ai_conversations_user").on(table.userId),
    createdIdx: index("idx_ai_conversations_created").on(table.createdAt),
  }),
);

/* ═══════════════════════════════════════════
   AI_MESSAGES
   cited_content_ids: uuid[] for referencing content
   flagged: boolean for moderation
   ═══════════════════════════════════════════ */

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => aiConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: aiMessageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    citedContentIds: uuid("cited_content_ids").array(),
    flagged: boolean("flagged").default(false).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("idx_ai_messages_conversation").on(table.conversationId),
    flaggedIdx: index("idx_ai_messages_flagged").on(table.flagged),
  }),
);

/* ═══════════════════════════════════════════
   AI_USAGE_DAILY
   Tracks per-user daily AI usage for rate limiting.
   ═══════════════════════════════════════════ */

export const aiUsageDaily = pgTable(
  "ai_usage_daily",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(),
    messagesCount: integer("messages_count").default(0).notNull(),
    tokensUsed: integer("tokens_used").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateUnique: unique("uq_ai_usage_user_date").on(table.userId, table.date),
    userIdx: index("idx_ai_usage_user").on(table.userId),
  }),
);
