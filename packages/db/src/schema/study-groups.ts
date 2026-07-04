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
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/* ═══════════════════════════════════════════
   STUDY_GROUPS — Collaborative learning circles
   ═══════════════════════════════════════════ */

export const studyGroups = pgTable(
  "study_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    examTarget: varchar("exam_target", { length: 100 }),
    avatarUrl: text("avatar_url"),
    ownerId: uuid("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    inviteCode: varchar("invite_code", { length: 20 }).unique(),
    isPublic: boolean("is_public").default(true).notNull(),
    maxMembers: integer("max_members").default(50).notNull(),
    memberCount: integer("member_count").default(1).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("idx_study_groups_owner").on(table.ownerId),
    inviteIdx: index("idx_study_groups_invite").on(table.inviteCode),
    publicIdx: index("idx_study_groups_public").on(table.isPublic),
  }),
);

/* ═══════════════════════════════════════════
   STUDY_GROUP_MEMBERS — Many-to-many
   ═══════════════════════════════════════════ */

export const studyGroupMembers = pgTable(
  "study_group_members",
  {
    groupId: uuid("group_id")
      .references(() => studyGroups.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).default("member").notNull(), // owner | admin | member
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.userId] }),
    groupIdx: index("idx_sgm_group").on(table.groupId),
    userIdx: index("idx_sgm_user").on(table.userId),
  }),
);

/* ═══════════════════════════════════════════
   STUDY_GROUP_MESSAGES — In-group discussions
   ═══════════════════════════════════════════ */

export const studyGroupMessages = pgTable(
  "study_group_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .references(() => studyGroups.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    replyToId: uuid("reply_to_id"),
    attachments: jsonb("attachments"), // Array<{ type, url, name }>
    pinned: boolean("pinned").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    groupIdx: index("idx_sgm_msg_group").on(table.groupId),
    userIdx: index("idx_sgm_msg_user").on(table.userId),
    createdIdx: index("idx_sgm_msg_created").on(table.groupId, table.createdAt),
    pinnedIdx: index("idx_sgm_msg_pinned").on(table.groupId, table.pinned),
  }),
);
