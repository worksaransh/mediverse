import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  real,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/* ═══════════════════════════════════════════
   FLASHCARD_DECKS — Collections of flashcards
   ═══════════════════════════════════════════ */

export const flashcardDecks = pgTable(
  "flashcard_decks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    subject: varchar("subject", { length: 255 }).notNull(),
    topicTags: text("topic_tags")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    cardCount: integer("card_count").default(0).notNull(),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("idx_flashcard_decks_user").on(table.userId),
    subjectIdx: index("idx_flashcard_decks_subject").on(table.subject),
    publicIdx: index("idx_flashcard_decks_public").on(table.isPublic),
  }),
);

/* ═══════════════════════════════════════════
   FLASHCARDS — Individual cards with spaced
   repetition (SM-2 algorithm fields).
   ═══════════════════════════════════════════ */

export const flashcards = pgTable(
  "flashcards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deckId: uuid("deck_id")
      .references(() => flashcardDecks.id, { onDelete: "cascade" })
      .notNull(),
    front: text("front").notNull(), // question / term
    back: text("back").notNull(),   // answer / definition
    hint: text("hint"),
    imageUrl: text("image_url"),
    difficulty: integer("difficulty").default(3).notNull(), // 1-5
    sortOrder: integer("sort_order").default(0).notNull(),
    metadata: jsonb("metadata"), // clinical pearls, mnemonics, etc.
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    deckIdx: index("idx_flashcards_deck").on(table.deckId),
    sortIdx: index("idx_flashcards_sort").on(table.deckId, table.sortOrder),
  }),
);

/* ═══════════════════════════════════════════
   FLASHCARD_REVIEWS — SM-2 spaced repetition
   review log per user per card.
   ═══════════════════════════════════════════ */

export const flashcardReviews = pgTable(
  "flashcard_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    cardId: uuid("card_id")
      .references(() => flashcards.id, { onDelete: "cascade" })
      .notNull(),
    quality: integer("quality").notNull(), // 0-5 (SM-2 quality grade)
    easinessFactor: real("easiness_factor").default(2.5).notNull(),
    intervalDays: integer("interval_days").default(1).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }).notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("idx_flashcard_reviews_user").on(table.userId),
    cardIdx: index("idx_flashcard_reviews_card").on(table.cardId),
    nextReviewIdx: index("idx_flashcard_reviews_next").on(table.userId, table.nextReviewAt),
  }),
);
