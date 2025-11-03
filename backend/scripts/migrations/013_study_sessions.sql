-- 013_study_sessions.sql
-- Purpose: Rename students_count to study_sessions_count and ensure safe defaults

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'students_count'
  ) THEN
    EXECUTE 'ALTER TABLE lessons RENAME COLUMN students_count TO study_sessions_count';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'study_sessions_count'
  ) THEN
    EXECUTE 'ALTER TABLE lessons ADD COLUMN study_sessions_count INTEGER DEFAULT 0';
  END IF;

  EXECUTE 'UPDATE lessons SET study_sessions_count = COALESCE(study_sessions_count, 0)';
  EXECUTE 'COMMENT ON COLUMN lessons.study_sessions_count IS ''Số lượt học đã được ghi nhận cho bài học''';
END $$;
