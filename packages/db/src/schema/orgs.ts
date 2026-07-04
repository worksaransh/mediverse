import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { orgRoleEnum } from "./enums";

/* ═══════════════════════════════════════════
   COLLEGES — Medical colleges in India
   ═══════════════════════════════════════════ */

export const colleges = pgTable(
  "colleges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 255 }),
    university: varchar("university", { length: 500 }),
    tier: varchar("tier", { length: 50 }), // tier_1 | tier_2 | tier_3
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameIdx: index("idx_colleges_name").on(table.name),
    stateIdx: index("idx_colleges_state").on(table.state),
  }),
);

/* ═══════════════════════════════════════════
   ORGANIZATIONS
   ═══════════════════════════════════════════ */

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index("idx_orgs_slug").on(table.slug),
  }),
);

/* ═══════════════════════════════════════════
   ORG_MEMBERSHIPS
   ═══════════════════════════════════════════ */

export const orgMemberships = pgTable(
  "org_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: orgRoleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orgUserUnique: unique("uq_org_user").on(table.orgId, table.userId),
    orgIdx: index("idx_org_memberships_org").on(table.orgId),
    userIdx: index("idx_org_memberships_user").on(table.userId),
  }),
);
