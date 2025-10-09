import { query } from '../../../config/pool.js';

export async function createQuizWithQuestions({ title, description, lessonId, createdBy, questions }) {
  const client = await query.connect?.() || null;
  try {
    if (client) await client.query('BEGIN');
    
    // Create main quiz question (parent) - will hold metadata
    const firstQ = await query(`
      INSERT INTO quiz_questions (title, description, lesson_id, created_by, question_text, question_type, points)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING question_id
    `, [title, description, lessonId, createdBy, questions[0].questionText, questions[0].questionType, questions[0].points]);
    
    const parentId = firstQ.rows[0].question_id;
    
    // Insert answers for first question
    for (const ans of questions[0].answers) {
      await query(`INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES ($1,$2,$3)`,
        [parentId, ans.answerText, ans.isCorrect]);
    }
    
    // Insert remaining questions (if any)
    for (let i = 1; i < questions.length; i++) {
      const q = questions[i];
      const qRes = await query(`
        INSERT INTO quiz_questions (title, description, lesson_id, created_by, question_text, question_type, points)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING question_id
      `, [title, description, lessonId, createdBy, q.questionText, q.questionType, q.points]);
      
      const qid = qRes.rows[0].question_id;
      for (const ans of q.answers) {
        await query(`INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES ($1,$2,$3)`,
          [qid, ans.answerText, ans.isCorrect]);
      }
    }
    
    if (client) await client.query('COMMIT');
    return { questionId: parentId };
  } catch (e) {
    if (client) await client.query('ROLLBACK');
    throw e;
  } finally {
    if (client) client.release();
  }
}

export async function getQuizById(questionId) {
  const r = await query(`
    SELECT question_id, title, description, lesson_id, created_by, created_at
    FROM quiz_questions
    WHERE question_id = $1
    LIMIT 1
  `, [questionId]);
  return r.rows[0] || null;
}

export async function listQuizzes({ createdBy, lessonId, standalone }) {
  let sql = `
    SELECT DISTINCT q.question_id, q.title, q.description, q.lesson_id, q.created_by, q.created_at,
      u.full_name as creator_name,
      l.title as lesson_title
    FROM quiz_questions q
    LEFT JOIN users u ON u.user_id = q.created_by
    LEFT JOIN lessons l ON l.lesson_id = q.lesson_id
    WHERE q.title IS NOT NULL
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

export async function getQuizWithQuestions(questionId) {
  // Get quiz metadata
  const quizMeta = await query(`
    SELECT question_id, title, description, lesson_id, created_by, created_at
    FROM quiz_questions
    WHERE question_id = $1
  `, [questionId]);
  
  if (!quizMeta.rows[0]) return null;
  
  const quiz = quizMeta.rows[0];
  
  // Get all questions with same title (grouped quiz)
  const questions = await query(`
    SELECT qq.question_id, qq.question_text, qq.question_type, qq.points
    FROM quiz_questions qq
    WHERE (qq.question_id = $1 OR (qq.title = $2 AND qq.title IS NOT NULL))
    ORDER BY qq.question_id
  `, [questionId, quiz.title]);
  
  // Get answers for each question
  for (const q of questions.rows) {
    const answers = await query(`
      SELECT answer_id, answer_text, is_correct
      FROM quiz_answers
      WHERE question_id = $1
      ORDER BY answer_id
    `, [q.question_id]);
    q.answers = answers.rows;
  }
  
  return {
    ...quiz,
    questions: questions.rows
  };
}

export async function deleteQuizAndQuestions(questionId) {
  // Get title to delete all related questions
  const quiz = await getQuizById(questionId);
  if (!quiz) throw new Error('Not found');
  
  if (quiz.title) {
    // Delete all questions with same title
    await query(`DELETE FROM quiz_questions WHERE title = $1`, [quiz.title]);
  } else {
    await query(`DELETE FROM quiz_questions WHERE question_id = $1`, [questionId]);
  }
}

export async function updateQuizMetadata(questionId, { title, description, lessonId }) {
  const quiz = await getQuizById(questionId);
  if (!quiz) throw new Error('Not found');
  
  const oldTitle = quiz.title;
  
  // Update all questions with old title
  await query(`
    UPDATE quiz_questions
    SET title = $1, description = $2, lesson_id = $3
    WHERE title = $4 OR question_id = $5
  `, [title, description, lessonId, oldTitle, questionId]);
}
