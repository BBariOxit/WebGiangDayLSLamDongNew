import { query } from '../../../config/pool.js';

const PG_UNDEFINED_COLUMN = '42703';

function mapLegacyQuestion(row) {
  return {
    question_id: row.question_id,
    question_text: row.question_text,
    question_type: 'single_choice',
    points: row.points ?? 1,
    options: row.options,
    correct_index: row.correct_index,
    answer_schema: null,
    quiz_id: row.quiz_id,
    assessment_type: row.assessment_type ?? 'quiz'
  };
}

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
  try {
    const r = await query(sql, [quizId]);
    return r.rows.map(row => ({ ...row, quiz_id: quizId }));
  } catch (error) {
    if (error?.code !== PG_UNDEFINED_COLUMN) throw error;
    console.warn('[quizRepo] Legacy schema detected for getQuizQuestions. Falling back. Please run migration 017.');
    const legacySql = `
      SELECT q.question_id, q.question_text, q.options, q.correct_index, q.quiz_id, COALESCE(qu.lesson_id, $1) AS lesson_id
      FROM quiz_questions q
      JOIN quizzes qu ON qu.quiz_id = q.quiz_id
      WHERE q.quiz_id = $1
      ORDER BY q.question_id
    `;
    const legacyResult = await query(legacySql, [quizId]);
    return legacyResult.rows.map(row => ({
      ...mapLegacyQuestion(row),
      quiz_id: quizId,
      assessment_type: 'quiz'
    }));
  }
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
  try {
    const r = await query(sql, [quizId]);
    return r.rows;
  } catch (error) {
    if (error?.code !== PG_UNDEFINED_COLUMN) throw error;
    console.warn('[quizRepo] Legacy schema detected for getQuizQuestionsByQuizId. Falling back. Please run migration 017.');
    const legacySql = `
      SELECT q.question_id, q.question_text, q.options, q.correct_index, q.quiz_id
      FROM quiz_questions q
      WHERE q.quiz_id = $1
      ORDER BY q.question_id
    `;
    const legacyResult = await query(legacySql, [quizId]);
    return legacyResult.rows.map(mapLegacyQuestion);
  }
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
