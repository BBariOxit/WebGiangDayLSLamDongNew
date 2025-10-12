-- 010_quiz_points_and_seed.sql
-- Add 'points' column to quiz_questions if missing, then seed one quiz with 5 questions
-- for each lesson that doesn't have a quiz yet, excluding lessons titled 'ALO' (case-insensitive).

-- Add points column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='quiz_questions' AND column_name='points'
  ) THEN
    ALTER TABLE quiz_questions ADD COLUMN points SMALLINT NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Seed quizzes for lessons without a quiz (exclude 'ALO')
WITH candidate_lessons AS (
  SELECT l.lesson_id, l.title
  FROM lessons l
  WHERE NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.lesson_id = l.lesson_id)
    AND LOWER(COALESCE(l.title,'')) <> 'alo'
)
, inserted_quizzes AS (
  INSERT INTO quizzes (lesson_id, title, description, difficulty, time_limit, created_by)
  SELECT cl.lesson_id,
         CONCAT('Quiz: ', cl.title) AS title,
         'Quiz mẫu tự động tạo' AS description,
         'Cơ bản' AS difficulty,
         10 AS time_limit,
         NULL AS created_by
  FROM candidate_lessons cl
  RETURNING quiz_id, lesson_id
)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, position, points)
SELECT iq.quiz_id,
       CONCAT('Câu hỏi ', gs.n, ' cho bài ', iq.lesson_id) AS question_text,
       ARRAY['Đáp án A','Đáp án B','Đáp án C','Đáp án D']::TEXT[] AS options,
       0 AS correct_index,
       NULL AS explanation,
       gs.n AS position,
       1 AS points
FROM inserted_quizzes iq
CROSS JOIN generate_series(1,5) AS gs(n);
