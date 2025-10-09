-- Quiz tables migration (003)
-- Minimal schema matching current repository quizRepo expectations

CREATE TABLE IF NOT EXISTS quiz_questions (
  question_id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson ON quiz_questions(lesson_id);

CREATE TABLE IF NOT EXISTS quiz_answers (
  answer_id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  quiz_attempt_id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score INTEGER,
  answers JSONB,
  attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_lesson ON quiz_attempts(user_id, lesson_id);
