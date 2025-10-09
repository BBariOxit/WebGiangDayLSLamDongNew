-- 008_learning_engagement.sql
-- Purpose: Add engagement + quiz infrastructure: comments, ratings, progress, quizzes, quiz_questions, quiz_attempts
-- NOTE: This migration also replaces legacy quiz_* tables introduced earlier (003/006)
-- Run inside outer transaction provided by migrate.js (no BEGIN/COMMIT here)

-- Drop legacy quiz tables if they exist (schema reset for dev)
DROP TABLE IF EXISTS quiz_answers CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;

-- COMMENTS (with optional rating)
CREATE TABLE IF NOT EXISTS lesson_comments (
  comment_id SERIAL PRIMARY KEY,
  lesson_id INT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user ON lesson_comments(user_id);

-- PROGRESS
CREATE TABLE IF NOT EXISTS lesson_progress (
  lesson_id INT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  progress SMALLINT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (lesson_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);

-- QUIZ (one-to-one or one-to-many per lesson)
CREATE TABLE IF NOT EXISTS quizzes (
  quiz_id SERIAL PRIMARY KEY,
  lesson_id INT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  time_limit SMALLINT, -- minutes
  created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id);

-- QUESTIONS
CREATE TABLE IF NOT EXISTS quiz_questions (
  question_id SERIAL PRIMARY KEY,
  quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL CHECK (array_length(options,1) BETWEEN 2 AND 8),
  correct_index SMALLINT NOT NULL,
  explanation TEXT,
  position SMALLINT DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON quiz_questions(quiz_id);

-- ATTEMPTS
CREATE TABLE IF NOT EXISTS quiz_attempts (
  attempt_id SERIAL PRIMARY KEY,
  quiz_id INT NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  duration_seconds INT,
  answers JSONB, -- [{questionId, selectedIndexes: [..]}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);

-- MATERIALIZED VIEW (optional) average rating per lesson for fast lookup
CREATE MATERIALIZED VIEW IF NOT EXISTS lesson_rating_summary AS
SELECT l.lesson_id, COALESCE(ROUND(AVG(c.rating)::numeric,2),0) AS avg_rating, COUNT(c.rating) AS rating_count
FROM lessons l
LEFT JOIN lesson_comments c ON l.lesson_id = c.lesson_id AND c.rating IS NOT NULL
GROUP BY l.lesson_id;

-- Unique index required if we later choose CONCURRENT refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_rating_summary_lesson ON lesson_rating_summary(lesson_id);

-- Helper function to refresh rating summary after insert/update/delete comment with rating
CREATE OR REPLACE FUNCTION refresh_lesson_rating_summary() RETURNS TRIGGER AS $$
BEGIN
  -- Fast refresh (table small). For large datasets consider incremental strategy.
  REFRESH MATERIALIZED VIEW lesson_rating_summary;
  RETURN NULL; -- AFTER triggers ignore return value
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_rating_summary_ins ON lesson_comments;
DROP TRIGGER IF EXISTS trg_refresh_rating_summary_upd ON lesson_comments;
DROP TRIGGER IF EXISTS trg_refresh_rating_summary_del ON lesson_comments;

CREATE TRIGGER trg_refresh_rating_summary_ins
AFTER INSERT ON lesson_comments
FOR EACH ROW WHEN (NEW.rating IS NOT NULL)
EXECUTE FUNCTION refresh_lesson_rating_summary();

CREATE TRIGGER trg_refresh_rating_summary_upd
AFTER UPDATE ON lesson_comments
FOR EACH ROW WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
EXECUTE FUNCTION refresh_lesson_rating_summary();

CREATE TRIGGER trg_refresh_rating_summary_del
AFTER DELETE ON lesson_comments
FOR EACH ROW WHEN (OLD.rating IS NOT NULL)
EXECUTE FUNCTION refresh_lesson_rating_summary();
