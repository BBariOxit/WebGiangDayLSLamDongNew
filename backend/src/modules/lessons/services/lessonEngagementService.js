import { createComment, listComments, deleteComment, upsertProgress, getProgress, getRatingSummary, getQuizByLesson, listQuizQuestions, recordQuizAttempt, listQuizAttempts, addBookmark, removeBookmark, listBookmarks } from '../repositories/lessonEngagementRepo.js';

export async function addCommentSvc(lessonId, user, { content, rating }) {
  if (!user) throw new Error('Unauthorized');
  if (!content || !content.trim()) throw new Error('Nội dung trống');
  if (rating && (rating < 1 || rating > 5)) throw new Error('Rating không hợp lệ');
  return createComment({ lessonId, userId: user.id, content: content.trim(), rating });
}

export async function listCommentsSvc(lessonId) {
  return listComments(lessonId, 100, 0);
}

export async function deleteCommentSvc(commentId, user) {
  if (!user) throw new Error('Unauthorized');
  const deleted = await deleteComment(commentId, user.id, (user.role||'').toLowerCase() === 'admin');
  if (!deleted) throw new Error('Not found or forbidden');
  return { success: true };
}

export async function saveProgressSvc(lessonId, user, { progress }) {
  if (!user) throw new Error('Unauthorized');
  if (progress < 0 || progress > 100) throw new Error('Progress invalid');
  return upsertProgress({ lessonId, userId: user.id, progress });
}

export async function getProgressSvc(lessonId, user) {
  if (!user) throw new Error('Unauthorized');
  return getProgress(lessonId, user.id) || { lesson_id: lessonId, progress: 0 };
}

export async function getRatingSummarySvc(lessonId) {
  return getRatingSummary(lessonId);
}

export async function getQuizBundleSvc(lessonId) {
  const quiz = await getQuizByLesson(lessonId);
  if (!quiz) return null;
  const questions = await listQuizQuestions(quiz.quiz_id);
  return { ...quiz, questions };
}

export async function submitQuizAttemptSvc(quizId, user, { score, durationSeconds, answers }) {
  if (!user) throw new Error('Unauthorized');
  return recordQuizAttempt({ quizId, userId: user.id, score, durationSeconds, answers });
}

export async function listAttemptsSvc(quizId, user) {
  if (!user) throw new Error('Unauthorized');
  return listQuizAttempts(quizId, user.id);
}

// BOOKMARKS
export async function addBookmarkSvc(lessonId, user){ if(!user) throw new Error('Unauthorized'); return addBookmark(lessonId, user.id); }
export async function removeBookmarkSvc(lessonId, user){ if(!user) throw new Error('Unauthorized'); const r = await removeBookmark(lessonId, user.id); if(!r) throw new Error('Not found'); return { success: true }; }
export async function listBookmarksSvc(user){ if(!user) throw new Error('Unauthorized'); return listBookmarks(user.id); }
