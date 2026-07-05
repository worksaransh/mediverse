-- Mediverse: Create all remaining tables (enums + colleges/orgs/org_memberships already exist)

-- USERS
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) UNIQUE,
  "phone" varchar(20) UNIQUE,
  "password_hash" text,
  "name" varchar(255) NOT NULL,
  "avatar_url" text,
  "role" "user_role" DEFAULT 'student' NOT NULL,
  "email_verified" boolean DEFAULT false NOT NULL,
  "phone_verified" boolean DEFAULT false NOT NULL,
  "google_id" varchar(255) UNIQUE,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- PROFILES
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "career_stage" "career_stage" DEFAULT 'pg_prep' NOT NULL,
  "exam_target_year" integer,
  "college_id" uuid REFERENCES "colleges"("id"),
  "specialization" varchar(255),
  "interest_vector" vector(768),
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "ai_profile" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- SOURCES
CREATE TABLE IF NOT EXISTS "sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "type" varchar(50) NOT NULL,
  "base_url" text,
  "api_key_ref" varchar(255),
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- CONTENT_ITEMS
CREATE TABLE IF NOT EXISTS "content_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "content_type" NOT NULL,
  "title" varchar(500) NOT NULL,
  "body" text,
  "summary" text,
  "source_url" text,
  "source_id" uuid REFERENCES "sources"("id"),
  "author_id" uuid REFERENCES "users"("id"),
  "audience_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "specialty_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "embedding" vector(768),
  "status" "content_status" DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- PAPERS
CREATE TABLE IF NOT EXISTS "papers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pmid" varchar(50) UNIQUE,
  "doi" varchar(255),
  "title" text NOT NULL,
  "abstract" text,
  "authors" jsonb,
  "journal" varchar(500),
  "published_date" date,
  "mesh_terms" text[] DEFAULT '{}'::text[],
  "content_item_id" uuid REFERENCES "content_items"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- MCQS
CREATE TABLE IF NOT EXISTS "mcqs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "content_item_id" uuid REFERENCES "content_items"("id"),
  "question" text NOT NULL,
  "options" jsonb NOT NULL,
  "correct_option" varchar(10) NOT NULL,
  "explanation" text,
  "difficulty" integer DEFAULT 3 NOT NULL,
  "subject" varchar(255) NOT NULL,
  "topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "source_reference" text,
  "verified" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- MCQ_ATTEMPTS
CREATE TABLE IF NOT EXISTS "mcq_attempts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "mcq_id" uuid NOT NULL REFERENCES "mcqs"("id") ON DELETE cascade,
  "selected_option" varchar(10) NOT NULL,
  "is_correct" boolean NOT NULL,
  "time_taken_ms" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- USER_TOPIC_MASTERY
CREATE TABLE IF NOT EXISTS "user_topic_mastery" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "topic_tag" varchar(255) NOT NULL,
  "attempts_count" integer DEFAULT 0 NOT NULL,
  "correct_count" integer DEFAULT 0 NOT NULL,
  "accuracy_ema" real DEFAULT 0 NOT NULL,
  "easiness_factor" real DEFAULT 2.5 NOT NULL,
  "repetitions" integer DEFAULT 0 NOT NULL,
  "interval_days" integer DEFAULT 0 NOT NULL,
  "next_review_at" timestamp with time zone,
  "last_attempted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("user_id", "topic_tag")
);

-- STREAKS
CREATE TABLE IF NOT EXISTS "streaks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE cascade,
  "current_streak" integer DEFAULT 0 NOT NULL,
  "longest_streak" integer DEFAULT 0 NOT NULL,
  "last_activity_date" date,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- BOOKMARKS
CREATE TABLE IF NOT EXISTS "bookmarks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "content_item_id" uuid NOT NULL REFERENCES "content_items"("id") ON DELETE cascade,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "uq_bookmark_user_content" UNIQUE("user_id","content_item_id")
);

-- FEED_EVENTS
CREATE TABLE IF NOT EXISTS "feed_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "content_item_id" uuid REFERENCES "content_items"("id"),
  "event_type" "feed_event_type" NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "type" "notification_type" NOT NULL,
  "title" varchar(500) NOT NULL,
  "body" text,
  "read" boolean DEFAULT false NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- AI_CONVERSATIONS
CREATE TABLE IF NOT EXISTS "ai_conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "title" varchar(500),
  "subject" varchar(255),
  "message_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- AI_MESSAGES
CREATE TABLE IF NOT EXISTS "ai_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" uuid NOT NULL REFERENCES "ai_conversations"("id") ON DELETE cascade,
  "role" "ai_message_role" NOT NULL,
  "content" text NOT NULL,
  "tokens_used" integer DEFAULT 0,
  "flagged" boolean DEFAULT false NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- AI_USAGE_DAILY
CREATE TABLE IF NOT EXISTS "ai_usage_daily" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "date" date NOT NULL,
  "messages_count" integer DEFAULT 0 NOT NULL,
  "tokens_used" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "uq_ai_usage_user_date" UNIQUE("user_id","date")
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "plan" "subscription_plan" DEFAULT 'free' NOT NULL,
  "status" "subscription_status" DEFAULT 'trialing' NOT NULL,
  "razorpay_subscription_id" varchar(255),
  "razorpay_customer_id" varchar(255),
  "current_period_start" timestamp with time zone,
  "current_period_end" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- STUDY_PLANS
CREATE TABLE IF NOT EXISTS "study_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "title" varchar(500) NOT NULL,
  "description" text,
  "exam_target" varchar(100),
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "days_per_week" integer DEFAULT 6 NOT NULL,
  "hours_per_day" real DEFAULT 4 NOT NULL,
  "ai_generated" boolean DEFAULT false NOT NULL,
  "status" varchar(30) DEFAULT 'active' NOT NULL,
  "progress_percent" real DEFAULT 0 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- STUDY_PLAN_ITEMS
CREATE TABLE IF NOT EXISTS "study_plan_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL REFERENCES "study_plans"("id") ON DELETE cascade,
  "day_number" integer NOT NULL,
  "subject" varchar(255) NOT NULL,
  "topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "estimated_minutes" integer DEFAULT 60 NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "completed_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- FLASHCARD_DECKS
CREATE TABLE IF NOT EXISTS "flashcard_decks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "title" varchar(500) NOT NULL,
  "description" text,
  "subject" varchar(255) NOT NULL,
  "topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "is_public" boolean DEFAULT false NOT NULL,
  "card_count" integer DEFAULT 0 NOT NULL,
  "ai_generated" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- FLASHCARDS
CREATE TABLE IF NOT EXISTS "flashcards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "deck_id" uuid NOT NULL REFERENCES "flashcard_decks"("id") ON DELETE cascade,
  "front" text NOT NULL,
  "back" text NOT NULL,
  "hint" text,
  "image_url" text,
  "difficulty" integer DEFAULT 3 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- FLASHCARD_REVIEWS
CREATE TABLE IF NOT EXISTS "flashcard_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "card_id" uuid NOT NULL REFERENCES "flashcards"("id") ON DELETE cascade,
  "quality" integer NOT NULL,
  "easiness_factor" real DEFAULT 2.5 NOT NULL,
  "interval_days" integer DEFAULT 1 NOT NULL,
  "repetitions" integer DEFAULT 0 NOT NULL,
  "next_review_at" timestamp with time zone NOT NULL,
  "reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- QUIZ_SESSIONS
CREATE TABLE IF NOT EXISTS "quiz_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "title" varchar(500) NOT NULL,
  "mode" varchar(30) DEFAULT 'practice' NOT NULL,
  "subject" varchar(255),
  "total_questions" integer DEFAULT 0 NOT NULL,
  "correct_answers" integer DEFAULT 0 NOT NULL,
  "skipped_questions" integer DEFAULT 0 NOT NULL,
  "time_limit_seconds" integer,
  "time_taken_seconds" integer,
  "score_percent" integer,
  "status" varchar(30) DEFAULT 'in_progress' NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- QUIZ_SESSION_QUESTIONS
CREATE TABLE IF NOT EXISTS "quiz_session_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "quiz_sessions"("id") ON DELETE cascade,
  "mcq_id" uuid NOT NULL REFERENCES "mcqs"("id") ON DELETE cascade,
  "question_order" integer NOT NULL,
  "selected_option" varchar(10),
  "is_correct" integer,
  "time_taken_ms" integer,
  "flagged" integer DEFAULT 0 NOT NULL,
  "answered_at" timestamp with time zone
);

-- STUDY_GROUPS
CREATE TABLE IF NOT EXISTS "study_groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "exam_target" varchar(100),
  "avatar_url" text,
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "invite_code" varchar(20) UNIQUE,
  "is_public" boolean DEFAULT true NOT NULL,
  "max_members" integer DEFAULT 50 NOT NULL,
  "member_count" integer DEFAULT 1 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- STUDY_GROUP_MEMBERS
CREATE TABLE IF NOT EXISTS "study_group_members" (
  "group_id" uuid NOT NULL REFERENCES "study_groups"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role" varchar(20) DEFAULT 'member' NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("group_id", "user_id")
);

-- STUDY_GROUP_MESSAGES
CREATE TABLE IF NOT EXISTS "study_group_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid NOT NULL REFERENCES "study_groups"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "content" text NOT NULL,
  "reply_to_id" uuid,
  "attachments" jsonb,
  "pinned" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- LEADERBOARD_SNAPSHOTS
CREATE TABLE IF NOT EXISTS "leaderboard_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "period" varchar(20) NOT NULL,
  "period_start" date NOT NULL,
  "rank" integer NOT NULL,
  "score" integer NOT NULL,
  "questions_attempted" integer DEFAULT 0 NOT NULL,
  "correct_answers" integer DEFAULT 0 NOT NULL,
  "streak_days" integer DEFAULT 0 NOT NULL,
  "study_minutes" integer DEFAULT 0 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS "achievements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(100) UNIQUE NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "icon_url" text,
  "category" varchar(50) NOT NULL,
  "xp_reward" integer DEFAULT 0 NOT NULL,
  "requirement" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- USER_ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS "user_achievements" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "achievement_id" uuid NOT NULL REFERENCES "achievements"("id") ON DELETE cascade,
  "earned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "metadata" jsonb,
  PRIMARY KEY ("user_id", "achievement_id")
);

-- USER_XP_LOG
CREATE TABLE IF NOT EXISTS "user_xp_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "amount" integer NOT NULL,
  "source" varchar(50) NOT NULL,
  "source_id" uuid,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS "announcements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(500) NOT NULL,
  "body" text NOT NULL,
  "type" varchar(30) DEFAULT 'info' NOT NULL,
  "target_audience" text[] DEFAULT '{}'::text[],
  "priority" integer DEFAULT 0 NOT NULL,
  "action_url" text,
  "image_url" text,
  "published_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "active" boolean DEFAULT true NOT NULL,
  "author_id" uuid NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- REPORTS
CREATE TABLE IF NOT EXISTS "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "reporter_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "target_type" varchar(50) NOT NULL,
  "target_id" uuid NOT NULL,
  "reason" varchar(100) NOT NULL,
  "description" text,
  "status" varchar(30) DEFAULT 'pending' NOT NULL,
  "reviewed_by" uuid REFERENCES "users"("id"),
  "reviewed_at" timestamp with time zone,
  "resolution" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- WAITLIST
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "name" varchar(255),
  "phone" varchar(20),
  "exam_target" varchar(100),
  "referral_code" varchar(50),
  "referred_by" uuid,
  "converted_to_user_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
