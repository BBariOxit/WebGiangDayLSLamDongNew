-- Allow standalone quizzes (not tied to lesson) + track creator
-- Migration 006

-- Add created_by to quiz_questions
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(user_id),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Make lesson_id nullable for standalone quizzes
ALTER TABLE quiz_questions 
ALTER COLUMN lesson_id DROP NOT NULL;

-- Add title index
CREATE INDEX IF NOT EXISTS idx_quiz_questions_title ON quiz_questions(title) WHERE title IS NOT NULL;

-- Add created_by index
CREATE INDEX IF NOT EXISTS idx_quiz_questions_creator ON quiz_questions(created_by) WHERE created_by IS NOT NULL;

COMMENT ON COLUMN quiz_questions.lesson_id IS 'NULL if standalone quiz, otherwise references a lesson';
COMMENT ON COLUMN quiz_questions.title IS 'Title for standalone quiz (NULL if part of lesson)';
