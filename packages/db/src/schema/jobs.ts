import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/* ═══════════════════════════════════════════
   JOB_LISTINGS — Career Marketplace: jobs,
   internships, and research assistantships
   relevant to medical/science students.
   ═══════════════════════════════════════════ */

export const jobListings = pgTable(
  "job_listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postedByUserId: uuid("posted_by_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    organization: varchar("organization", { length: 500 }).notNull(), // hospital, company, institute
    location: varchar("location", { length: 255 }),
    listingType: varchar("listing_type", { length: 30 }).default("internship").notNull(), // internship | job | research_assistantship
    description: text("description").notNull(),
    requirements: text("requirements"),
    examTags: text("exam_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(), // who this is relevant to, e.g. ["neet_ug", "pharmacy_student"]
    applicationUrl: text("application_url"), // optional external apply link
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    postedByIdx: index("idx_job_listings_posted_by").on(table.postedByUserId),
    typeIdx: index("idx_job_listings_type").on(table.listingType),
    activeIdx: index("idx_job_listings_active").on(table.isActive),
    examTagsIdx: index("idx_job_listings_exam_tags").using("gin", table.examTags),
  }),
);

/* ═══════════════════════════════════════════
   JOB_APPLICATIONS — A user's in-app
   application to a listing. Unique per
   (job, user) to prevent duplicate applies.
   ═══════════════════════════════════════════ */

export const jobApplications = pgTable(
  "job_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .references(() => jobListings.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    coverNote: text("cover_note"),
    status: varchar("status", { length: 30 }).default("applied").notNull(), // applied | reviewing | rejected | accepted
    appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    jobUserUnique: unique("uq_job_applications_job_user").on(table.jobId, table.userId),
    jobIdx: index("idx_job_applications_job").on(table.jobId),
    userIdx: index("idx_job_applications_user").on(table.userId),
    statusIdx: index("idx_job_applications_status").on(table.status),
  }),
);
