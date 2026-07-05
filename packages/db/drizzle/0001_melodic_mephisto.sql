CREATE TABLE "study_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"subject" varchar(255) NOT NULL,
	"topic_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"estimated_minutes" integer DEFAULT 60 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "flashcard_decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "flashcard_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" uuid NOT NULL,
	"quality" integer NOT NULL,
	"easiness_factor" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 1 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "quiz_session_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"mcq_id" uuid NOT NULL,
	"question_order" integer NOT NULL,
	"selected_option" varchar(10),
	"is_correct" integer,
	"time_taken_ms" integer,
	"flagged" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "study_group_members" (
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "study_group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "study_group_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"reply_to_id" uuid,
	"attachments" jsonb,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"exam_target" varchar(100),
	"avatar_url" text,
	"owner_id" uuid NOT NULL,
	"invite_code" varchar(20),
	"is_public" boolean DEFAULT true NOT NULL,
	"max_members" integer DEFAULT 50 NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "study_groups_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon_url" text,
	"category" varchar(50) NOT NULL,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"requirement" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_xp_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"source" varchar(50) NOT NULL,
	"source_id" uuid,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
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
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"phone" varchar(20),
	"exam_target" varchar(100),
	"referral_code" varchar(50),
	"referred_by" uuid,
	"converted_to_user_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "ai_profile" jsonb;--> statement-breakpoint
ALTER TABLE "user_topic_mastery" ADD COLUMN "easiness_factor" real DEFAULT 2.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_topic_mastery" ADD COLUMN "repetitions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_topic_mastery" ADD COLUMN "interval_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_topic_mastery" ADD COLUMN "next_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_plan_id_study_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."study_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_card_id_flashcards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."flashcard_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_mcq_id_mcqs_id_fk" FOREIGN KEY ("mcq_id") REFERENCES "public"."mcqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_group_id_study_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD CONSTRAINT "study_group_messages_group_id_study_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_group_messages" ADD CONSTRAINT "study_group_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_groups" ADD CONSTRAINT "study_groups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_xp_log" ADD CONSTRAINT "user_xp_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_plan_items_plan" ON "study_plan_items" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_plan_items_day" ON "study_plan_items" USING btree ("plan_id","day_number");--> statement-breakpoint
CREATE INDEX "idx_plan_items_completed" ON "study_plan_items" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "idx_study_plans_user" ON "study_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_study_plans_status" ON "study_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_study_plans_exam" ON "study_plans" USING btree ("exam_target");--> statement-breakpoint
CREATE INDEX "idx_flashcard_decks_user" ON "flashcard_decks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_flashcard_decks_subject" ON "flashcard_decks" USING btree ("subject");--> statement-breakpoint
CREATE INDEX "idx_flashcard_decks_public" ON "flashcard_decks" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_flashcard_reviews_user" ON "flashcard_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_flashcard_reviews_card" ON "flashcard_reviews" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_flashcard_reviews_next" ON "flashcard_reviews" USING btree ("user_id","next_review_at");--> statement-breakpoint
CREATE INDEX "idx_flashcards_deck" ON "flashcards" USING btree ("deck_id");--> statement-breakpoint
CREATE INDEX "idx_flashcards_sort" ON "flashcards" USING btree ("deck_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_quiz_session_q_session" ON "quiz_session_questions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_session_q_mcq" ON "quiz_session_questions" USING btree ("mcq_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_session_q_order" ON "quiz_session_questions" USING btree ("session_id","question_order");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_user" ON "quiz_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_status" ON "quiz_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_mode" ON "quiz_sessions" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_started" ON "quiz_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_sgm_group" ON "study_group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_sgm_user" ON "study_group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sgm_msg_group" ON "study_group_messages" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_sgm_msg_user" ON "study_group_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sgm_msg_created" ON "study_group_messages" USING btree ("group_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_sgm_msg_pinned" ON "study_group_messages" USING btree ("group_id","pinned");--> statement-breakpoint
CREATE INDEX "idx_study_groups_owner" ON "study_groups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_study_groups_invite" ON "study_groups" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "idx_study_groups_public" ON "study_groups" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_achievements_slug" ON "achievements" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_achievements_category" ON "achievements" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leaderboard_user_period" ON "leaderboard_snapshots" USING btree ("user_id","period","period_start");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_rank" ON "leaderboard_snapshots" USING btree ("period","period_start","rank");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_score" ON "leaderboard_snapshots" USING btree ("period","period_start","score");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_user" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_ach" ON "user_achievements" USING btree ("achievement_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_earned" ON "user_achievements" USING btree ("earned_at");--> statement-breakpoint
CREATE INDEX "idx_xp_log_user" ON "user_xp_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_xp_log_source" ON "user_xp_log" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_xp_log_created" ON "user_xp_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_announcements_active" ON "announcements" USING btree ("active","published_at");--> statement-breakpoint
CREATE INDEX "idx_announcements_type" ON "announcements" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_announcements_priority" ON "announcements" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_reports_reporter" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "idx_reports_target" ON "reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_waitlist_email" ON "waitlist" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_waitlist_referral" ON "waitlist" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_waitlist_created" ON "waitlist" USING btree ("created_at");