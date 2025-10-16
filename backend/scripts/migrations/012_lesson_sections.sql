-- Migration 012: Lesson sections (structured content)

-- Create table to store ordered sections per lesson
CREATE TABLE IF NOT EXISTS lesson_sections (
  section_id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- heading | text | image_gallery | video | embed | divider
  title VARCHAR(255),
  content_html TEXT,
  data JSONB DEFAULT '{}'::jsonb, -- flexible payload (images, videoUrl, layout...)
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_sections_lesson ON lesson_sections(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_sections_order ON lesson_sections(lesson_id, order_index);

-- Trigger to keep updated_at in sync (function set_updated_at defined in 001_init.sql)
DROP TRIGGER IF EXISTS trg_lesson_sections_updated_at ON lesson_sections;
CREATE TRIGGER trg_lesson_sections_updated_at
BEFORE UPDATE ON lesson_sections
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
