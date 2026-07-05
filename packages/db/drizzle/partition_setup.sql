-- 1. Drop existing non-partitioned tables
DROP TABLE IF EXISTS "mcq_attempts" CASCADE;
DROP TABLE IF EXISTS "feed_events" CASCADE;

-- 2. Recreate mcq_attempts as partitioned table
CREATE TABLE "mcq_attempts" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "mcq_id" uuid NOT NULL REFERENCES "mcqs"("id") ON DELETE cascade,
  "selected_option" varchar(10) NOT NULL,
  "is_correct" boolean NOT NULL,
  "time_taken_ms" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id", "created_at")
) PARTITION BY RANGE ("created_at");

-- Create indexes on parent partitioned table
CREATE INDEX "idx_mcq_attempts_user" ON "mcq_attempts" ("user_id");
CREATE INDEX "idx_mcq_attempts_mcq" ON "mcq_attempts" ("mcq_id");
CREATE INDEX "idx_mcq_attempts_created" ON "mcq_attempts" ("created_at");

-- 3. Recreate feed_events as partitioned table
CREATE TABLE "feed_events" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "content_item_id" uuid REFERENCES "content_items"("id"),
  "event_type" "feed_event_type" NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id", "created_at")
) PARTITION BY RANGE ("created_at");

-- Create indexes on parent partitioned table
CREATE INDEX "idx_feed_events_user" ON "feed_events" ("user_id");
CREATE INDEX "idx_feed_events_type" ON "feed_events" ("event_type");
CREATE INDEX "idx_feed_events_created" ON "feed_events" ("created_at");

-- 4. Create function to dynamically create current and next month partitions
CREATE OR REPLACE FUNCTION create_monthly_partitions() RETURNS void AS $$
DECLARE
  current_month TEXT;
  next_month TEXT;
  current_start DATE;
  current_end DATE;
  next_start DATE;
  next_end DATE;
  tbl_name_mcq_curr TEXT;
  tbl_name_mcq_next TEXT;
  tbl_name_feed_curr TEXT;
  tbl_name_feed_next TEXT;
BEGIN
  -- Current month details (e.g. 2026_07)
  current_month := to_char(NOW(), 'YYYY_MM');
  current_start := date_trunc('month', NOW())::DATE;
  current_end := (date_trunc('month', NOW()) + INTERVAL '1 month')::DATE;

  -- Next month details (e.g. 2026_08)
  next_month := to_char(NOW() + INTERVAL '1 month', 'YYYY_MM');
  next_start := (date_trunc('month', NOW()) + INTERVAL '1 month')::DATE;
  next_end := (date_trunc('month', NOW()) + INTERVAL '2 month')::DATE;

  -- Formulate full table names
  tbl_name_mcq_curr := 'mcq_attempts_' || current_month;
  tbl_name_mcq_next := 'mcq_attempts_' || next_month;
  tbl_name_feed_curr := 'feed_events_' || current_month;
  tbl_name_feed_next := 'feed_events_' || next_month;

  -- Create current month partitions if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = tbl_name_mcq_curr) THEN
    EXECUTE format('CREATE TABLE %I PARTITION OF mcq_attempts FOR VALUES FROM (%L) TO (%L);', 
      tbl_name_mcq_curr, current_start, current_end);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = tbl_name_feed_curr) THEN
    EXECUTE format('CREATE TABLE %I PARTITION OF feed_events FOR VALUES FROM (%L) TO (%L);', 
      tbl_name_feed_curr, current_start, current_end);
  END IF;

  -- Create next month partitions (pre-provisioning) if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = tbl_name_mcq_next) THEN
    EXECUTE format('CREATE TABLE %I PARTITION OF mcq_attempts FOR VALUES FROM (%L) TO (%L);', 
      tbl_name_mcq_next, next_start, next_end);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = tbl_name_feed_next) THEN
    EXECUTE format('CREATE TABLE %I PARTITION OF feed_events FOR VALUES FROM (%L) TO (%L);', 
      tbl_name_feed_next, next_start, next_end);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Run the partition auto-creation function immediately to build current + next month tables
SELECT create_monthly_partitions();

-- 6. Create IVFFlat Index on content_items for vector embeddings (pgvector)
CREATE INDEX IF NOT EXISTS idx_content_embedding
  ON content_items
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
