import { query } from '../../../config/pool.js';

export async function getQuizQuestions(lessonId) {
  const sql = `
    SELECT 
      q.question_id,
      q.question_text,
      q.question_type,
      q.points,
      a.answer_id,
      a.answer_text,
      a.is_correct
    FROM quiz_questions q
    LEFT JOIN quiz_answers a ON a.question_id = q.question_id
    WHERE q.lesson_id = $1
    ORDER BY q.question_id, a.answer_id
  `;
  const r = await query(sql, [lessonId]);
  return r.rows;
}

export async function saveQuizAttempt({ lessonId, userId, score, answers }) {
  const sql = `
    INSERT INTO quiz_attempts (lesson_id, user_id, score, answers, attempted_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  const r = await query(sql, [lessonId, userId, score, answers]);
  return r.rows[0];
}

export async function getAttemptsByUser(lessonId, userId) {
  const sql = `
    SELECT quiz_attempt_id, lesson_id, user_id, score, attempted_at
    FROM quiz_attempts
    WHERE lesson_id = $1 AND user_id = $2
    ORDER BY attempted_at DESC
  `;
  const r = await query(sql, [lessonId, userId]);
  return r.rows;
}
