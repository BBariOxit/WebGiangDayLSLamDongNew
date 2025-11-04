import { query, getPool } from '../../../config/pool.js';

export async function createQuizWithQuestions({
  title,
  description,
  lessonId,
  createdBy,
  questions,
  timeLimit = null,
  difficulty = null,
  assessmentType = 'quiz'
}) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    // Create quiz
    const qz = await client.query(`
      INSERT INTO quizzes (lesson_id, title, description, difficulty, time_limit, created_by, assessment_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING quiz_id
    `, [
      lessonId || null,
      title,
      description || null,
      difficulty || null,
      timeLimit || null,
      createdBy || null,
      assessmentType || 'quiz'
    ]);
    const quizId = qz.rows[0].quiz_id;
    // Insert questions
    let position = 1;
    for (const q of questions) {
      await client.query(`
        INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, position, points, question_type, answer_schema)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        quizId,
        q.questionText,
        q.options ?? null,
        q.correctIndex ?? null,
        q.explanation || null,
        position++,
  q.points || 1,
  q.questionType || 'single_choice',
  q.answerSchema || null
      ]);
    }
    await client.query('COMMIT');
    return { quizId };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getQuizById(quizId) {
  const r = await query(`
    SELECT quiz_id, title, description, lesson_id, created_by, created_at, difficulty, time_limit, assessment_type
    FROM quizzes
    WHERE quiz_id = $1
    LIMIT 1
  `, [quizId]);
  return r.rows[0] || null;
}

export async function listQuizzes({ createdBy, lessonId, standalone }) {
  let sql = `
    SELECT q.quiz_id, q.title, q.description, q.lesson_id, q.created_by, q.created_at, q.difficulty, q.time_limit, q.assessment_type,
           u.full_name as creator_name, l.title as lesson_title
    FROM quizzes q
    LEFT JOIN users u ON u.user_id = q.created_by
    LEFT JOIN lessons l ON l.lesson_id = q.lesson_id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;
  
  if (createdBy) {
    sql += ` AND q.created_by = $${idx++}`;
    params.push(createdBy);
  }
  
  if (lessonId !== null && lessonId !== undefined) {
    sql += ` AND q.lesson_id = $${idx++}`;
    params.push(lessonId);
  }
  
  if (standalone) {
    sql += ` AND q.lesson_id IS NULL`;
  }
  
  sql += ` ORDER BY q.created_at DESC LIMIT 100`;
  
  const r = await query(sql, params);
  return r.rows;
}

export async function getQuizWithQuestions(quizId) {
  const quizMeta = await query(`
    SELECT quiz_id, title, description, lesson_id, created_by, created_at, difficulty, time_limit, assessment_type
    FROM quizzes WHERE quiz_id=$1
  `, [quizId]);
  if (!quizMeta.rows[0]) return null;
  const quiz = quizMeta.rows[0];
  const questions = await query(`
    SELECT question_id, question_text, options, correct_index, explanation, position, points, question_type, answer_schema
    FROM quiz_questions WHERE quiz_id=$1 ORDER BY position, question_id
  `, [quizId]);
  return {
    ...quiz,
    questions: questions.rows.map(row => ({
      ...row,
      answer_schema: row.answer_schema ? row.answer_schema : null
    }))
  };
}

export async function deleteQuizAndQuestions(quizId) {
  await query(`DELETE FROM quiz_questions WHERE quiz_id = $1`, [quizId]);
  await query(`DELETE FROM quizzes WHERE quiz_id = $1`, [quizId]);
}

export async function updateQuizMetadata(quizId, { title, description, lessonId, difficulty, timeLimit, assessmentType }) {
  await query(`
    UPDATE quizzes
    SET title=$1, description=$2, lesson_id=$3, difficulty=$4, time_limit=$5, assessment_type=$6, updated_at=NOW()
    WHERE quiz_id=$7
  `, [
    title,
    description,
    lessonId || null,
    difficulty || null,
    timeLimit || null,
    assessmentType || 'quiz',
    quizId
  ]);
}

export async function updateQuizWithQuestions(quizId, { title, description, lessonId, difficulty, timeLimit, assessmentType }, questions) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      UPDATE quizzes
      SET title=$1, description=$2, lesson_id=$3, difficulty=$4, time_limit=$5, assessment_type=$6, updated_at=NOW()
      WHERE quiz_id=$7
    `, [
      title,
      description,
      lessonId || null,
      difficulty || null,
      timeLimit || null,
      assessmentType || 'quiz',
      quizId
    ]);

    await client.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [quizId]);

    let position = 1;
    for (const q of questions) {
      await client.query(`
        INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, position, points, question_type, answer_schema)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        quizId,
        q.questionText,
        q.options ?? null,
        q.correctIndex ?? null,
        q.explanation || null,
        position++,
  q.points || 1,
  q.questionType || 'single_choice',
  q.answerSchema || null
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
