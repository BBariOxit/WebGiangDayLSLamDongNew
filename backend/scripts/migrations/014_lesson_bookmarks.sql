-- 014_lesson_bookmarks.sql
-- Purpose: Add table to store user bookmarks (saved lessons)

CREATE TABLE IF NOT EXISTS lesson_bookmarks (
  lesson_id INT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (lesson_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_user ON lesson_bookmarks(user_id);
