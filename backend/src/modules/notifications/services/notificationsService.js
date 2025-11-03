import { createNotification, listUserNotifications, getUnreadCount, markRead, markAllRead } from '../repositories/notificationsRepo.js';

function truncate(text, max=180){
  if (!text) return null;
  const s = String(text).trim();
  return s.length > max ? s.slice(0, max-1) + '…' : s;
}

export async function publishNewLessonNotification(lesson) {
  if (!lesson) return null;
  return createNotification({
    type: 'new_lesson',
    title: `Bài học mới: ${lesson.title}`,
    body: truncate(lesson.summary || ''),
    data: { lessonId: lesson.lesson_id, slug: lesson.slug, url: `/lesson/${lesson.slug}` },
    isGlobal: true,
    lessonId: lesson.lesson_id
  });
}

export async function publishNewQuizNotification(quiz) {
  if (!quiz) return null;
  return createNotification({
    type: 'new_quiz',
    title: `Quiz mới: ${quiz.title}`,
    body: truncate(quiz.description || ''),
    data: { quizId: quiz.quiz_id, lessonId: quiz.lesson_id || null, url: `/quizzes/take/${quiz.quiz_id}` },
    isGlobal: true,
    quizId: quiz.quiz_id,
    lessonId: quiz.lesson_id || null
  });
}

export async function listMyNotifications(userId, limit = 10) {
  const items = await listUserNotifications(userId, limit, 0);
  const unreadCount = await getUnreadCount(userId);
  return { items, unreadCount };
}

export async function markNotificationRead(userId, notificationId) {
  return markRead(userId, notificationId);
}

export async function markAllNotificationsRead(userId) {
  return markAllRead(userId);
}
