import { query } from '../../../config/pool.js';

async function getQuizIdByLesson(lessonId) {
  const r = await query('SELECT quiz_id FROM quizzes WHERE lesson_id=$1 ORDER BY quiz_id DESC LIMIT 1', [lessonId]);
  return r.rows[0]?.quiz_id || null;
}

export async function getQuizQuestions(lessonId) {
  // Resolve quiz_id by lesson
  const quizId = await getQuizIdByLesson(lessonId);
  if (!quizId) return [];
  const sql = `
    SELECT 
      q.question_id,
      q.question_text,
      COALESCE(NULLIF(q.question_type, ''), 'single_choice') AS question_type,
      COALESCE(q.points,1) AS points,
      q.options,
      q.correct_index,
      q.answer_schema,
      qu.assessment_type
    FROM quiz_questions q
    JOIN quizzes qu ON qu.quiz_id = q.quiz_id
    WHERE q.quiz_id = $1
    ORDER BY COALESCE(q.position,1), q.question_id
  `;
  const r = await query(sql, [quizId]);
  // Attach resolved quizId to rows for later
  return r.rows.map(row => ({ ...row, quiz_id: quizId }));
}

export async function getQuizQuestionsByQuizId(quizId) {
  const sql = `
    SELECT 
      q.question_id,
      q.question_text,
      COALESCE(NULLIF(q.question_type, ''), 'single_choice') AS question_type,
      COALESCE(q.points,1) AS points,
      q.options,
      q.correct_index,
      q.answer_schema,
      q.quiz_id,
      qu.assessment_type
    FROM quiz_questions q
    JOIN quizzes qu ON qu.quiz_id = q.quiz_id
    WHERE q.quiz_id = $1
    ORDER BY COALESCE(q.position,1), q.question_id
  `;
  const r = await query(sql, [quizId]);
  return r.rows;
}

export async function saveQuizAttempt({ lessonId, userId, score, answers }) {
  // Convert via quizId
  const quizId = await getQuizIdByLesson(lessonId);
  if (!quizId) throw new Error('No quiz for lesson');
  const sql = `
    INSERT INTO quiz_attempts (quiz_id, user_id, score, answers, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  const r = await query(sql, [quizId, userId, score, answers]);
  return r.rows[0];
}

export async function saveQuizAttemptByQuizId({ quizId, userId, score, answers }) {
  const sql = `
    INSERT INTO quiz_attempts (quiz_id, user_id, score, answers, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  const r = await query(sql, [quizId, userId, score, answers]);
  return r.rows[0];
}

export async function getAttemptsByUser(lessonId, userId) {
  const quizId = await getQuizIdByLesson(lessonId);
  if (!quizId) return [];
  const sql = `
    SELECT attempt_id, quiz_id, user_id, score, created_at
    FROM quiz_attempts
    WHERE quiz_id = $1 AND user_id = $2
    ORDER BY created_at DESC
  `;
  const r = await query(sql, [quizId, userId]);
  return r.rows;
}

export async function getLessonIdByQuiz(quizId) {
  const r = await query('SELECT lesson_id FROM quizzes WHERE quiz_id=$1', [quizId]);
  return r.rows[0]?.lesson_id || null;
}
