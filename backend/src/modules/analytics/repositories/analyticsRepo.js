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
    WITH progress_stats AS (
      SELECT
        COUNT(*) FILTER (WHERE progress > 0) AS lessons_started,
        COUNT(*) FILTER (WHERE is_completed = TRUE) AS lessons_completed,
        COUNT(*) FILTER (WHERE progress BETWEEN 1 AND 99 AND (is_completed IS DISTINCT FROM TRUE)) AS lessons_in_progress,
        COALESCE(ROUND(AVG(progress)), 0) AS avg_progress,
        MAX(last_viewed_at) AS last_viewed_at,
        MAX(completed_at) AS last_completed_at
      FROM lesson_progress
      WHERE user_id = $1
    ),
    attempt_stats AS (
      SELECT
        COUNT(*) AS attempts,
        COUNT(DISTINCT quiz_id) AS unique_quizzes,
        COALESCE(ROUND(AVG(score)), 0) AS avg_score,
        COALESCE(MAX(score), 0) AS best_score,
        COUNT(*) FILTER (WHERE score >= 70) AS passed_quizzes,
        COALESCE(SUM(score), 0) AS total_score,
        MAX(created_at) AS last_quiz_at
      FROM quiz_attempts
      WHERE user_id = $1
    ),
    owned_quizzes AS (
      SELECT COUNT(*) AS quizzes_created
      FROM quizzes
      WHERE created_by = $1
    ),
    owned_attempts AS (
      SELECT
        COUNT(*) AS attempts_on_my_quizzes,
        COUNT(DISTINCT qa.user_id) AS unique_learners_on_my_quizzes,
        COALESCE(ROUND(AVG(qa.score)), 0) AS avg_score_on_my_quizzes
      FROM quiz_attempts qa
      JOIN quizzes q ON q.quiz_id = qa.quiz_id
      WHERE q.created_by = $1
    )
    SELECT
      COALESCE(p.lessons_started, 0) AS lessons_started,
      COALESCE(p.lessons_completed, 0) AS lessons_completed,
      COALESCE(p.lessons_in_progress, 0) AS lessons_in_progress,
      COALESCE(p.avg_progress, 0) AS avg_progress,
      COALESCE(a.attempts, 0) AS attempts,
      COALESCE(a.unique_quizzes, 0) AS unique_quizzes,
      COALESCE(a.avg_score, 0) AS avg_score,
      COALESCE(a.best_score, 0) AS best_score,
      COALESCE(a.passed_quizzes, 0) AS passed_quizzes,
      COALESCE(a.total_score, 0) AS total_score,
      COALESCE(o.quizzes_created, 0) AS quizzes_created,
      COALESCE(oa.attempts_on_my_quizzes, 0) AS attempts_on_my_quizzes,
      COALESCE(oa.unique_learners_on_my_quizzes, 0) AS unique_learners_on_my_quizzes,
      COALESCE(oa.avg_score_on_my_quizzes, 0) AS avg_score_on_my_quizzes,
      NULLIF(
        GREATEST(
          COALESCE(a.last_quiz_at, to_timestamp(0)),
          COALESCE(p.last_viewed_at, to_timestamp(0)),
          COALESCE(p.last_completed_at, to_timestamp(0))
        ),
        to_timestamp(0)
      ) AS last_active_at
    FROM progress_stats p, attempt_stats a, owned_quizzes o, owned_attempts oa
  `;
  const r = await query(sql, [userId]);
  return r.rows[0];
}

export async function getMyRecentAttempts(userId, limit = 10) {
  const sql = `
    SELECT qa.attempt_id,
           qa.quiz_id,
           qa.score,
           qa.created_at,
           qa.duration_seconds,
           q.title AS quiz_title,
           q.lesson_id,
           l.title AS lesson_title
    FROM quiz_attempts qa
    JOIN quizzes q ON q.quiz_id = qa.quiz_id
    LEFT JOIN lessons l ON l.lesson_id = q.lesson_id
    WHERE qa.user_id=$1
    ORDER BY qa.created_at DESC
    LIMIT $2
  `;
  const r = await query(sql, [userId, limit]);
  return r.rows;
}
