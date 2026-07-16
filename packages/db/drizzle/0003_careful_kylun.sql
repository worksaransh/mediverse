CREATE TABLE "mentor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"specialization" varchar(255) NOT NULL,
	"bio" text,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentor_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "mentorship_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"topic" varchar(500),
	"message" text,
	"status" varchar(30) DEFAULT 'requested' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"student_rating" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"cover_note" text,
	"status" varchar(30) DEFAULT 'applied' NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_job_applications_job_user" UNIQUE("job_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "job_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"posted_by_user_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"organization" varchar(500) NOT NULL,
	"location" varchar(255),
	"listing_type" varchar(30) DEFAULT 'internship' NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"exam_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"application_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_collaborators" (
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'collaborator' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "research_collaborators_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "research_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"abstract" text NOT NULL,
	"status" varchar(30) DEFAULT 'recruiting' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"max_collaborators" integer DEFAULT 5 NOT NULL,
	"collaborator_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_sessions" ADD CONSTRAINT "mentorship_sessions_mentor_id_mentor_profiles_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_sessions" ADD CONSTRAINT "mentorship_sessions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_listings_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_posted_by_user_id_users_id_fk" FOREIGN KEY ("posted_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_collaborators" ADD CONSTRAINT "research_collaborators_project_id_research_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."research_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_collaborators" ADD CONSTRAINT "research_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mentor_profiles_user" ON "mentor_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mentor_profiles_specialization" ON "mentor_profiles" USING btree ("specialization");--> statement-breakpoint
CREATE INDEX "idx_mentor_profiles_active" ON "mentor_profiles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_mentorship_sessions_mentor" ON "mentorship_sessions" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "idx_mentorship_sessions_student" ON "mentorship_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_mentorship_sessions_status" ON "mentorship_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_applications_job" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_job_applications_user" ON "job_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_job_applications_status" ON "job_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_listings_posted_by" ON "job_listings" USING btree ("posted_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_job_listings_type" ON "job_listings" USING btree ("listing_type");--> statement-breakpoint
CREATE INDEX "idx_job_listings_active" ON "job_listings" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_job_listings_exam_tags" ON "job_listings" USING gin ("exam_tags");--> statement-breakpoint
CREATE INDEX "idx_research_collaborators_project" ON "research_collaborators" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_research_collaborators_user" ON "research_collaborators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_research_projects_owner" ON "research_projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_research_projects_status" ON "research_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_research_projects_tags" ON "research_projects" USING gin ("tags");