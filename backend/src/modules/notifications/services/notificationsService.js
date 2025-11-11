import { createNotification, listUserNotifications, getUnreadCount, markRead, markAllRead, hideNotification } from '../repositories/notificationsRepo.js';

function truncate(text, max=180){
  if (!text) return null;
  const s = String(text).trim();
  return s.length > max ? s.slice(0, max-1) + '…' : s;
}

const ASSESSMENT_LABELS = {
  quiz: 'Trắc nghiệm 1 đáp án',
  multi_choice: 'Trắc nghiệm nhiều đáp án',
  fill_blank: 'Điền đáp án',
  mixed: 'Quiz hỗn hợp'
};

function parseDataField(value) {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return value;
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
  const assessmentType = (quiz.assessment_type || quiz.assessmentType || 'quiz').toLowerCase();
  const assessmentLabels = {
    quiz: 'Trắc nghiệm 1 đáp án',
    multi_choice: 'Trắc nghiệm nhiều đáp án',
    fill_blank: 'Điền đáp án',
    mixed: 'Quiz hỗn hợp'
  };
  const assessmentLabel = assessmentLabels[assessmentType] || 'Bài kiểm tra';
  return createNotification({
    type: 'new_quiz',
    title: `${assessmentLabel}: ${quiz.title}`,
    body: truncate(quiz.description || `Thời lượng ${quiz.time_limit || 0} phút • Độ khó ${quiz.difficulty || '—'}`),
    data: { 
      quizId: quiz.quiz_id, 
      lessonId: quiz.lesson_id || null, 
      url: `/quizzes/take/${quiz.quiz_id}`,
      assessmentType,
      assessmentLabel,
      difficulty: quiz.difficulty || null,
      timeLimit: quiz.time_limit || null,
      quizTitle: quiz.title
    },
    isGlobal: true,
    quizId: quiz.quiz_id,
    lessonId: quiz.lesson_id || null
  });
}

export async function listMyNotifications(userId, limit = 10) {
  const rows = await listUserNotifications(userId, limit, 0);
  const unreadCount = await getUnreadCount(userId);
  const mapped = rows.map((row) => {
    const data = parseDataField(row.data);
    const base = {
      ...row,
      unread: !!row.unread,
      data
    };
    if (row.type === 'new_quiz') {
      const quizTitle = row.quiz_title || data.quizTitle || data.title || 'Bài kiểm tra mới';
      const assessmentType = (data.assessmentType || row.quiz_assessment_type || 'quiz').toLowerCase();
      const assessmentLabel = data.assessmentLabel || ASSESSMENT_LABELS[assessmentType] || 'Bài kiểm tra';
      base.title = `Quiz mới: ${quizTitle}`;
      base.body = truncate(row.body || data.body || data.description || '');
      base.data = {
        ...data,
        quizTitle,
        quizId: data.quizId || row.quiz_id,
        lessonId: data.lessonId || row.lesson_id,
        assessmentType,
        assessmentLabel,
        difficulty: data.difficulty || row.quiz_difficulty || null,
        timeLimit: data.timeLimit ?? row.quiz_time_limit ?? null,
        url: data.url || (row.quiz_id ? `/quizzes/take/${row.quiz_id}` : null)
      };
      return base;
    }
    if (row.type === 'new_lesson') {
      const lessonTitle = row.lesson_title || data.lessonTitle || data.title || 'Bài học mới';
      const slug = data.slug || row.lesson_slug;
      base.title = `Bài học mới: ${lessonTitle}`;
      base.body = truncate(row.body || data.body || '');
      base.data = {
        ...data,
        lessonTitle,
        slug,
        lessonId: data.lessonId || row.lesson_id,
        url: data.url || (slug ? `/lesson/${slug}` : null)
      };
      return base;
    }
    if (!base.body) base.body = truncate(data.body || '');
    return base;
  });
  return { items: mapped, unreadCount };
}

export async function markNotificationRead(userId, notificationId) {
  return markRead(userId, notificationId);
}

export async function markAllNotificationsRead(userId) {
  return markAllRead(userId);
}

export async function dismissNotification(userId, notificationId) {
  return hideNotification(userId, notificationId);
}
