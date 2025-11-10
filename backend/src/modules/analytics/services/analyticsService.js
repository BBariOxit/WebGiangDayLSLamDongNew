import {
  getGlobalStats,
  getAttemptsTrend,
  getLessonBreakdown,
  getMyStats,
  getMyRecentAttempts,
  getUserRoleCounts,
  getUserAttemptTrend,
  getTeacherOverview,
  getTeacherAttemptTrend,
  getTeacherRecentAttempts,
  getTeacherLessonBreakdown,
  getTeacherTopQuizzes
} from '../repositories/analyticsRepo.js';

export async function getPublicAnalytics(days = 14) {
  const [globals, trend, breakdown, roleCounts] = await Promise.all([
    getGlobalStats(),
    getAttemptsTrend(days),
    getLessonBreakdown(),
    getUserRoleCounts()
  ]);
  return { globals, trend, breakdown, roleCounts };
}

export async function getPersonalAnalytics(userId, role = 'student', days = 14) {
  if (role === 'teacher') {
    const [overview, trend, recentAttempts, lessonBreakdown, topQuizzes] = await Promise.all([
      getTeacherOverview(userId),
      getTeacherAttemptTrend(userId, days),
      getTeacherRecentAttempts(userId, 8),
      getTeacherLessonBreakdown(userId),
      getTeacherTopQuizzes(userId, 6)
    ]);

    return {
      role,
      overview,
      trend,
      lessonBreakdown,
      topQuizzes,
      recentAttempts
    };
  }

  if (role === 'admin') {
    const system = await getPublicAnalytics(days);
    return { role, system };
  }

  const [stats, recentAttempts, trend] = await Promise.all([
    getMyStats(userId),
    getMyRecentAttempts(userId, 8),
    getUserAttemptTrend(userId, days)
  ]);

  return {
    role: role || 'student',
    stats,
    trend,
    recentAttempts
  };
}
