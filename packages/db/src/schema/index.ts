/* ─── Re-export everything for Drizzle Kit and consumers ─── */

export * from "./enums";
export * from "./helpers";
export * from "./orgs";       // colleges, organizations, org_memberships (before users due to FK)
export * from "./users";      // users, profiles
export * from "./content";    // sources, content_items, papers
export * from "./mcqs";       // mcqs, mcq_attempts
export * from "./study";      // user_topic_mastery, streaks
export * from "./feed";       // feed_events, bookmarks, notifications
export * from "./ai";         // ai_conversations, ai_messages, ai_usage_daily
export * from "./billing";    // subscriptions

/* ─── New schema modules ─── */
export * from "./study-plans";   // study_plans, study_plan_items
export * from "./flashcards";    // flashcard_decks, flashcards, flashcard_reviews
export * from "./quiz-sessions"; // quiz_sessions, quiz_session_questions
export * from "./study-groups";  // study_groups, study_group_members, study_group_messages
export * from "./gamification";  // leaderboard_snapshots, achievements, user_achievements, user_xp_log
export * from "./platform";     // announcements, reports, waitlist
