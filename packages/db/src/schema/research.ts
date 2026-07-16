import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/* ═══════════════════════════════════════════
   RESEARCH_PROJECTS — Student/faculty-led
   research collaborations students can browse
   and request to join.
   ═══════════════════════════════════════════ */

export const researchProjects = pgTable(
  "research_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    abstract: text("abstract").notNull(),
    status: varchar("status", { length: 30 }).default("recruiting").notNull(), // recruiting | in_progress | completed | archived
    tags: text("tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    maxCollaborators: integer("max_collaborators").default(5).notNull(),
    collaboratorCount: integer("collaborator_count").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("idx_research_projects_owner").on(table.ownerId),
    statusIdx: index("idx_research_projects_status").on(table.status),
    tagsIdx: index("idx_research_projects_tags").using("gin", table.tags),
  }),
);

/* ═══════════════════════════════════════════
   RESEARCH_COLLABORATORS — Many-to-many
   membership on a research project.
   ═══════════════════════════════════════════ */

export const researchCollaborators = pgTable(
  "research_collaborators",
  {
    projectId: uuid("project_id")
      .references(() => researchProjects.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).default("collaborator").notNull(), // owner | collaborator
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
    projectIdx: index("idx_research_collaborators_project").on(table.projectId),
    userIdx: index("idx_research_collaborators_user").on(table.userId),
  }),
);
