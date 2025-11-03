-- 016_lesson_completion.sql
-- Purpose: Track lesson completion status and best quiz score per user

ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS best_score SMALLINT DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed_user
  ON lesson_progress(user_id)
  WHERE is_completed = TRUE;
