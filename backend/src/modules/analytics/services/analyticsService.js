import { getGlobalStats, getAttemptsTrend, getLessonBreakdown, getMyStats, getMyRecentAttempts } from '../repositories/analyticsRepo.js';

export async function getPublicAnalytics(days = 14) {
  const [globals, trend, breakdown] = await Promise.all([
    getGlobalStats(), getAttemptsTrend(days), getLessonBreakdown()
  ]);
  return { globals, trend, breakdown };
}

export async function getPersonalAnalytics(userId, days = 14) {
  const [mine, recent, trend] = await Promise.all([
    getMyStats(userId), getMyRecentAttempts(userId, 10), getAttemptsTrend(days)
  ]);
  return { mine, recent, trend };
}
