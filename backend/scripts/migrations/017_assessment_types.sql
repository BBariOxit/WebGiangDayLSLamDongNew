-- 017_assessment_types.sql
-- Introduce assessment types and flexible question schemas for quizzes

-- Add assessment_type to quizzes table (default to 'quiz' for backward compatibility)
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(50) NOT NULL DEFAULT 'quiz';

-- Extend quiz_questions to support different question formats
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) NOT NULL DEFAULT 'single_choice';

ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS answer_schema JSONB;

-- Allow options/correct_index to be nullable (e.g. for fill-in questions)
ALTER TABLE quiz_questions
  ALTER COLUMN options DROP NOT NULL;

ALTER TABLE quiz_questions
  ALTER COLUMN correct_index DROP NOT NULL;

-- Relax legacy check constraint on options length
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_options_check;

ALTER TABLE quiz_questions
  ADD CONSTRAINT quiz_questions_options_chk CHECK (
    options IS NULL OR array_length(options, 1) BETWEEN 2 AND 20
  );

-- Ensure defaults applied to existing rows
UPDATE quizzes SET assessment_type = 'quiz' WHERE assessment_type IS NULL;

UPDATE quiz_questions
SET question_type = COALESCE(NULLIF(question_type, ''), 'single_choice')
WHERE question_type IS NULL OR question_type = '';
