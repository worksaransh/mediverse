CREATE TYPE "public"."academic_stream" AS ENUM('pcb', 'pcm', 'pcmb', 'commerce', 'arts', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."exam_target" AS ENUM('neet_ug', 'jee_main', 'jee_advanced', 'none');--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'class_9';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'class_10';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'class_11';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'class_12';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'neet_dropper';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'nursing_student';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'pharmacy_student';--> statement-breakpoint
ALTER TYPE "public"."career_stage" ADD VALUE 'allied_health_student';--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"class_level" varchar(20),
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"exam_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "exam_target" "exam_target" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "academic_stream" "academic_stream" DEFAULT 'not_applicable' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "topic_id" uuid;--> statement-breakpoint
ALTER TABLE "mcqs" ADD COLUMN "topic_id" uuid;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chapters_subject" ON "chapters" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "idx_chapters_class_level" ON "chapters" USING btree ("class_level");--> statement-breakpoint
CREATE INDEX "idx_subjects_code" ON "subjects" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_subjects_exam_tags" ON "subjects" USING gin ("exam_tags");--> statement-breakpoint
CREATE INDEX "idx_topics_chapter" ON "topics" USING btree ("chapter_id");--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcqs" ADD CONSTRAINT "mcqs_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_content_topic_id" ON "content_items" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_mcqs_topic_id" ON "mcqs" USING btree ("topic_id");