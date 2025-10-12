-- 011_allow_standalone_quizzes.sql
-- Make quizzes.lesson_id nullable to support standalone quizzes

ALTER TABLE quizzes
  ALTER COLUMN lesson_id DROP NOT NULL;
