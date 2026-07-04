-- ============================================================
-- 0000_enable_pgvector.sql
-- Run BEFORE Drizzle-generated migrations.
-- Enables pgvector, sets up partitioned tables, IVFFlat index,
-- and updated_at trigger function.
-- ============================================================

-- ─── 1. Enable pgvector extension ───────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── 2. Auto-update trigger function for updated_at ─────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 3. IVFFlat index on content_items.embedding ────────────
-- NOTE: Must be run AFTER content_items table exists.
-- If the table is empty, the index will be built when data arrives.
-- For best performance, REINDEX after bulk inserts.
-- CREATE INDEX idx_content_embedding
--   ON content_items
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);

-- ─── 4. Monthly partitioning for mcq_attempts ───────────────
-- Drizzle creates mcq_attempts as a regular table.
-- To convert to range-partitioned, run this INSTEAD of the
-- Drizzle-generated CREATE TABLE for mcq_attempts:
--
-- DROP TABLE IF EXISTS mcq_attempts;
-- CREATE TABLE mcq_attempts (
--   id UUID NOT NULL DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   mcq_id UUID NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
--   selected_option VARCHAR(10) NOT NULL,
--   is_correct BOOLEAN NOT NULL,
--   time_taken_ms INTEGER,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   PRIMARY KEY (id, created_at)
-- ) PARTITION BY RANGE (created_at);
--
-- -- Create partitions (extend as needed)
-- CREATE TABLE mcq_attempts_2026_07 PARTITION OF mcq_attempts
--   FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- CREATE TABLE mcq_attempts_2026_08 PARTITION OF mcq_attempts
--   FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
-- CREATE TABLE mcq_attempts_2026_09 PARTITION OF mcq_attempts
--   FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
-- CREATE TABLE mcq_attempts_2026_10 PARTITION OF mcq_attempts
--   FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
-- CREATE TABLE mcq_attempts_2026_11 PARTITION OF mcq_attempts
--   FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
-- CREATE TABLE mcq_attempts_2026_12 PARTITION OF mcq_attempts
--   FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- ─── 5. Monthly partitioning for feed_events ────────────────
-- Same approach as mcq_attempts:
--
-- DROP TABLE IF EXISTS feed_events;
-- CREATE TABLE feed_events (
--   id UUID NOT NULL DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   event_type feed_event_type NOT NULL,
--   content_item_id UUID REFERENCES content_items(id),
--   metadata JSONB,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   PRIMARY KEY (id, created_at)
-- ) PARTITION BY RANGE (created_at);
--
-- CREATE TABLE feed_events_2026_07 PARTITION OF feed_events
--   FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- CREATE TABLE feed_events_2026_08 PARTITION OF feed_events
--   FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
-- CREATE TABLE feed_events_2026_09 PARTITION OF feed_events
--   FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
-- CREATE TABLE feed_events_2026_10 PARTITION OF feed_events
--   FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
-- CREATE TABLE feed_events_2026_11 PARTITION OF feed_events
--   FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
-- CREATE TABLE feed_events_2026_12 PARTITION OF feed_events
--   FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');
