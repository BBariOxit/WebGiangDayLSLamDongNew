import { query } from '../../../config/pool.js';

export async function getGlobalStats() {
  const sql = `
    SELECT 
  (SELECT COUNT(*) FROM lessons) AS total_lessons,
  (SELECT COALESCE(SUM(study_sessions_count),0) FROM lessons) AS total_study_sessions,
      (SELECT COALESCE(AVG(rating),0) FROM lessons) AS avg_rating,
      (SELECT COUNT(*) FROM quizzes) AS total_quizzes,
      (SELECT COUNT(*) FROM quiz_attempts) AS total_attempts
  `;
  const r = await query(sql);
  return r.rows[0];
}

export async function getAttemptsTrend(days = 14) {
  const sql = `
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
           COUNT(*) AS attempts,
           ROUND(AVG(score)) AS avg_score
    FROM quiz_attempts
    WHERE created_at >= NOW() - ($1::int || ' days')::interval
    GROUP BY 1
    ORDER BY 1
  `;
  const r = await query(sql, [days]);
  return r.rows;
}

export async function getLessonBreakdown() {
  const sql = `
    SELECT difficulty, COUNT(*) AS total
    FROM lessons
    GROUP BY difficulty
    ORDER BY difficulty
  `;
  const r = await query(sql);
  return r.rows;
}

export async function getMyStats(userId) {
  const sql = `
    SELECT 
      (SELECT COUNT(DISTINCT lesson_id) FROM lesson_progress WHERE user_id=$1 AND progress > 0) AS lessons_started,
      (SELECT COUNT(DISTINCT lesson_id) FROM lesson_progress WHERE user_id=$1 AND is_completed = TRUE) AS lessons_completed,
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id=$1) AS attempts,
      (SELECT COALESCE(ROUND(AVG(score)),0) FROM quiz_attempts WHERE user_id=$1) AS avg_score
  `;
  const r = await query(sql, [userId]);
  return r.rows[0];
}

export async function getMyRecentAttempts(userId, limit = 10) {
  const sql = `
    SELECT attempt_id, quiz_id, score, created_at
    FROM quiz_attempts
    WHERE user_id=$1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const r = await query(sql, [userId, limit]);
  return r.rows;
}
