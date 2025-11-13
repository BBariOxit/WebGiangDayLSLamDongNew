import { query } from '../../../config/pool.js';

// COMMENTS
export async function listComments(lessonId, limit = 50, offset = 0) {
  const sql = `
    SELECT c.*, COALESCE(u.full_name, split_part(u.email,'@',1)) AS username
    FROM lesson_comments c
    JOIN users u ON u.user_id = c.user_id
    WHERE c.lesson_id = $1
    ORDER BY c.comment_id DESC
    LIMIT $2 OFFSET $3
  `;
  const r = await query(sql, [lessonId, limit, offset]);
  return r.rows;
}

export async function createComment({ lessonId, userId, content, rating }) {
  const inserted = await query(
    'INSERT INTO lesson_comments (lesson_id, user_id, content, rating) VALUES ($1,$2,$3,$4) RETURNING comment_id',
    [lessonId, userId, content, rating || null]
  );
  const id = inserted.rows[0]?.comment_id;
  if (!id) return null;
  const r = await query(
    `SELECT c.*, COALESCE(u.full_name, split_part(u.email,'@',1)) AS username
     FROM lesson_comments c JOIN users u ON u.user_id = c.user_id
     WHERE c.comment_id = $1`,
    [id]
  );
  return r.rows[0] || null;
}

export async function deleteComment(commentId, userId, isAdmin) {
  const cond = isAdmin ? '' : ' AND user_id=$2';
  const params = isAdmin ? [commentId] : [commentId, userId];
  const r = await query(`DELETE FROM lesson_comments WHERE comment_id=$1${cond} RETURNING *`, params);
  return r.rows[0] || null;
}

// PROGRESS
export async function upsertProgress({ lessonId, userId, progress }) {
  const r = await query(`INSERT INTO lesson_progress (lesson_id, user_id, progress, last_viewed_at)
                         VALUES ($1,$2,$3,NOW())
                         ON CONFLICT (lesson_id, user_id) DO UPDATE SET progress = GREATEST(lesson_progress.progress, EXCLUDED.progress), last_viewed_at=NOW()
                         RETURNING *`, [lessonId, userId, progress]);
  return r.rows[0];
}

export async function getProgress(lessonId, userId) {
  const r = await query('SELECT * FROM lesson_progress WHERE lesson_id=$1 AND user_id=$2', [lessonId, userId]);
  return r.rows[0] || null;
}

// RATING SUMMARY (on-demand if MV not refreshed yet)
export async function getRatingSummary(lessonId) {
  const r = await query('SELECT AVG(rating)::numeric(4,2) AS avg_rating, COUNT(rating) AS rating_count FROM lesson_comments WHERE lesson_id=$1 AND rating IS NOT NULL', [lessonId]);
  return r.rows[0];
}

// QUIZ (simplified: one quiz per lesson optional)
export async function getQuizByLesson(lessonId) {
  const r = await query('SELECT * FROM quizzes WHERE lesson_id=$1 ORDER BY quiz_id DESC LIMIT 1', [lessonId]);
  return r.rows[0] || null;
}

export async function listQuizzesByLesson(lessonId) {
  const r = await query('SELECT quiz_id FROM quizzes WHERE lesson_id=$1 ORDER BY quiz_id', [lessonId]);
  return r.rows.map((row) => row.quiz_id);
}

export async function listQuizzesByLessons(lessonIds = []) {
  if (!lessonIds?.length) return new Map();
  const r = await query('SELECT lesson_id, quiz_id FROM quizzes WHERE lesson_id = ANY($1)', [lessonIds]);
  const map = new Map();
  r.rows.forEach(({ lesson_id, quiz_id }) => {
    const key = Number(lesson_id);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(Number(quiz_id));
  });
  return map;
}

export async function listQuizQuestions(quizId) {
  const r = await query('SELECT * FROM quiz_questions WHERE quiz_id=$1 ORDER BY position, question_id', [quizId]);
  return r.rows;
}

export async function recordQuizAttempt({ quizId, userId, score, durationSeconds, answers }) {
  const r = await query('INSERT INTO quiz_attempts (quiz_id, user_id, score, duration_seconds, answers) VALUES ($1,$2,$3,$4,$5) RETURNING *', [quizId, userId, score, durationSeconds || null, JSON.stringify(answers || [])]);
  return r.rows[0];
}

export async function listQuizAttempts(quizId, userId) {
  const r = await query('SELECT * FROM quiz_attempts WHERE quiz_id=$1 AND user_id=$2 ORDER BY attempt_id DESC LIMIT 20', [quizId, userId]);
  return r.rows;
}

export async function listPassedQuizzesForLesson({ lessonId, userId, passingScore }) {
  const r = await query(
    `
      SELECT qa.quiz_id
      FROM quiz_attempts qa
      JOIN quizzes q ON q.quiz_id = qa.quiz_id
      WHERE q.lesson_id = $1
        AND qa.user_id = $2
        AND qa.score >= $3
      GROUP BY qa.quiz_id
    `,
    [lessonId, userId, passingScore],
  );
  return r.rows.map((row) => row.quiz_id);
}

export async function listPassedQuizzesForLessons({ lessonIds = [], userId, passingScore }) {
  if (!lessonIds?.length) return new Map();
  const r = await query(
    `
      SELECT q.lesson_id, qa.quiz_id
      FROM quiz_attempts qa
      JOIN quizzes q ON q.quiz_id = qa.quiz_id
      WHERE q.lesson_id = ANY($1)
        AND qa.user_id = $2
        AND qa.score >= $3
      GROUP BY q.lesson_id, qa.quiz_id
    `,
    [lessonIds, userId, passingScore],
  );
  const map = new Map();
  r.rows.forEach(({ lesson_id, quiz_id }) => {
    const key = Number(lesson_id);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(Number(quiz_id));
  });
  return map;
}

// BOOKMARKS
export async function addBookmark(lessonId, userId) {
  await query('INSERT INTO lesson_bookmarks (lesson_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [lessonId, userId]);
  return { lesson_id: lessonId, user_id: userId };
}

export async function removeBookmark(lessonId, userId) {
  const r = await query('DELETE FROM lesson_bookmarks WHERE lesson_id=$1 AND user_id=$2 RETURNING *', [lessonId, userId]);
  return r.rows[0] || null;
}

export async function listBookmarks(userId) {
  const r = await query(`
    SELECT lb.lesson_id, l.title, l.slug, l.summary, l.images, l.created_at
    FROM lesson_bookmarks lb
    JOIN lessons l ON l.lesson_id = lb.lesson_id
    WHERE lb.user_id=$1
    ORDER BY lb.created_at DESC
  `, [userId]);
  return r.rows;
}

// COMPLETIONS / PROGRESS SNAPSHOT
export async function markLessonCompleted({ lessonId, userId, score }) {
  if (!lessonId || !userId) return null;
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const r = await query(`
    INSERT INTO lesson_progress (lesson_id, user_id, progress, last_viewed_at, is_completed, completed_at, best_score)
    VALUES ($1,$2,100,NOW(),TRUE,NOW(),$3)
    ON CONFLICT (lesson_id, user_id) DO UPDATE
    SET progress = 100,
        is_completed = TRUE,
        completed_at = COALESCE(lesson_progress.completed_at, NOW()),
        best_score = GREATEST(lesson_progress.best_score, EXCLUDED.best_score),
        last_viewed_at = NOW()
    RETURNING *
  `, [lessonId, userId, safeScore]);
  return r.rows[0] || null;
}

export async function listProgressByUser(userId) {
  const r = await query(`
    SELECT lesson_id, progress, is_completed, completed_at, best_score
    FROM lesson_progress
    WHERE user_id = $1
  `, [userId]);
  return r.rows;
}

export async function getLessonIdForQuiz(quizId) {
  const r = await query('SELECT lesson_id FROM quizzes WHERE quiz_id=$1', [quizId]);
  return r.rows[0]?.lesson_id || null;
}
