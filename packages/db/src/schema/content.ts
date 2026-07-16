import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { contentTypeEnum, contentStatusEnum } from "./enums";
import { users } from "./users";
import { customVector } from "./helpers";
import { topics } from "./curriculum";

/* ═══════════════════════════════════════════
   SOURCES — where content originates
   ═══════════════════════════════════════════ */

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // pubmed | youtube | semantic_scholar | manual
  baseUrl: text("base_url"),
  apiKeyRef: varchar("api_key_ref", { length: 255 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/* ═══════════════════════════════════════════
   CONTENT_ITEMS — central content table
   Tags are text[] with GIN indexes.
   Embedding is vector(768) with IVFFlat index.
   ═══════════════════════════════════════════ */

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: contentTypeEnum("type").notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body"),
    summary: text("summary"),
    sourceUrl: text("source_url"),
    sourceId: uuid("source_id").references(() => sources.id),
    authorId: uuid("author_id").references(() => users.id),
    audienceTags: text("audience_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    specialtyTags: text("specialty_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    topicTags: text("topic_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    topicId: uuid("topic_id").references(() => topics.id),
    embedding: customVector("embedding", { dimensions: 768 }),
    status: contentStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // GIN indexes on tag arrays for fast containment queries (@>, &&)
    audienceTagsIdx: index("idx_content_audience_tags").using("gin", table.audienceTags),
    specialtyTagsIdx: index("idx_content_specialty_tags").using("gin", table.specialtyTags),
    topicTagsIdx: index("idx_content_topic_tags").using("gin", table.topicTags),
    topicIdx: index("idx_content_topic_id").on(table.topicId),
    // B-tree composite for status + published_at queries
    statusPublishedIdx: index("idx_content_status_published").on(
      table.status,
      table.publishedAt,
    ),
    // IVFFlat on embedding created via custom migration (see drizzle/0000_enable_pgvector.sql)
    // because Drizzle can't express operator class or WITH parameters
  }),
);

/* ═══════════════════════════════════════════
   PAPERS — academic papers from PubMed / Scholar
   ═══════════════════════════════════════════ */

export const papers = pgTable(
  "papers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pmid: varchar("pmid", { length: 50 }).unique(),
    doi: varchar("doi", { length: 255 }),
    title: text("title").notNull(),
    abstract: text("abstract"),
    authors: jsonb("authors"), // string[]
    journal: varchar("journal", { length: 500 }),
    publishedDate: date("published_date"),
    meshTerms: text("mesh_terms")
      .array()
      .default(sql`'{}'::text[]`),
    contentItemId: uuid("content_item_id").references(() => contentItems.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pmidIdx: index("idx_pape