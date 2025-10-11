import { query } from '../../../config/pool.js';

// COMMENTS
export async function listComments(lessonId, limit = 50, offset = 0) {
  const r = await query('SELECT c.*, u.username FROM lesson_comments c JOIN users u ON u.user_id=c.user_id WHERE lesson_id=$1 ORDER BY comment_id DESC LIMIT $2 OFFSET $3', [lessonId, limit, offset]);
  return r.rows;
}

export async function createComment({ lessonId, userId, content, rating }) {
  const r = await query('INSERT INTO lesson_comments (lesson_id, user_id, content, rating) VALUES ($1,$2,$3,$4) RETURNING *', [lessonId, userId, content, rating || null]);
  return r.rows[0];
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
