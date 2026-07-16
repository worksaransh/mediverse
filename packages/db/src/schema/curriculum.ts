import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* ═══════════════════════════════════════════
   SUBJECTS — top-level curriculum subjects
   (e.g. Physics, Chemistry, Biology, Mathematics)
   Tagged with which exams/tracks they apply to.
   ═══════════════════════════════════════════ */

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 20 }).notNull(), // e.g. "PHY", "CHEM", "BIO", "MATH"
    examTags: text("exam_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(), // e.g. ["neet_ug"], ["jee_main","jee_advanced"], ["class_9","class_10"]
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    codeIdx: index("idx_subjects_code").on(table.code),
    examTagsIdx: index("idx_subjects_exam_tags").using("gin", table.examTags),
  }),
);

/* ═══════════════════════════════════════════
   CHAPTERS — belong to a subject, scoped to a class level
   ═══════════════════════════════════════════ */

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id")
      .references(() => subjects.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    classLevel: varchar("class_level", { length: 20 }), // e.g. "9","10","11","12","dropper"
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    subjectIdx: index("idx_chapters_subject").on(table.subjectId),
    classLevelIdx: index("idx_chapters_class_level").on(table.classLevel),
  }),
);

/* ═══════════════════════════════════════════
   TOPICS — belong to a chapter; this is the
   finest-grained unit content/MCQs attach to
   ═══════════════════════════════════════════ */

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id")
      .references(() => chapters.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    chapterIdx: index("idx_topics_chapter").on(table.chapterId),
  }),
);
