import { createComment, listComments, deleteComment, upsertProgress, getProgress, getRatingSummary, getQuizByLesson, listQuizQuestions, recordQuizAttempt, listQuizAttempts, addBookmark, removeBookmark, listBookmarks, markLessonCompleted, listProgressByUser, getLessonIdForQuiz, listQuizzesByLesson, listPassedQuizzesForLesson, listQuizzesByLessons, listPassedQuizzesForLessons } from '../repositories/lessonEngagementRepo.js';
import { incrementStudySessions } from '../repositories/lessonRepo.js';

const PASSING_SCORE = 70;

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
  const base = await getProgress(lessonId, user.id) || { lesson_id: lessonId, progress: 0, is_completed: false, completed_at: null, best_score: 0 };
  const quizIds = await listQuizzesByLesson(lessonId);
  if (!quizIds.length) return base;
  const passedIds = await listPassedQuizzesForLesson({ lessonId, userId: user.id, passingScore: PASSING_SCORE });
  const passedSet = new Set(passedIds.map(Number));
  const allDone = quizIds.every((id) => passedSet.has(Number(id)));
  const quizProgress = Math.round((passedSet.size / quizIds.length) * 100);
  let progressValue = Math.max(Number(base.progress ?? 0), quizProgress);
  if (!allDone && progressValue >= 100) progressValue = 99;
  return { ...base, progress: allDone ? 100 : progressValue, is_completed: allDone };
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
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const attempt = await recordQuizAttempt({ quizId, userId: user.id, score: safeScore, durationSeconds, answers });
  if (safeScore >= PASSING_SCORE) {
    try {
      const lessonId = await getLessonIdForQuiz(quizId);
      if (lessonId) {
        const quizIds = await listQuizzesByLesson(lessonId);
        if (quizIds.length === 0) {
          await markLessonCompleted({ lessonId, userId: user.id, score: safeScore });
        } else {
          const passedQuizIds = await listPassedQuizzesForLesson({ lessonId, userId: user.id, passingScore: PASSING_SCORE });
          const passedSet = new Set(passedQuizIds.map((id) => Number(id)));
          passedSet.add(Number(quizId));
          const completedCount = quizIds.filter((id) => passedSet.has(Number(id))).length;
          if (completedCount >= quizIds.length) {
            await markLessonCompleted({ lessonId, userId: user.id, score: safeScore });
          } else {
            const progressPercent = Math.min(99, Math.round((completedCount / quizIds.length) * 100));
            await upsertProgress({ lessonId, userId: user.id, progress: progressPercent });
          }
        }
      }
    } catch (err) {
      // Do not fail attempt recording if completion update fails
      console.warn('markLessonCompleted failed', err);
    }
  }
  return attempt;
}

export async function listAttemptsSvc(quizId, user) {
  if (!user) throw new Error('Unauthorized');
  return listQuizAttempts(quizId, user.id);
}

// BOOKMARKS
export async function addBookmarkSvc(lessonId, user){ if(!user) throw new Error('Unauthorized'); return addBookmark(lessonId, user.id); }
export async function removeBookmarkSvc(lessonId, user){ if(!user) throw new Error('Unauthorized'); const r = await removeBookmark(lessonId, user.id); if(!r) throw new Error('Not found'); return { success: true }; }
export async function listBookmarksSvc(user){ if(!user) throw new Error('Unauthorized'); return listBookmarks(user.id); }

export async function listProgressForUserSvc(user){
  if(!user) throw new Error('Unauthorized');
  const rows = await listProgressByUser(user.id);
  if (!rows.length) return rows;
  const lessonIds = rows.map((row) => Number(row.lesson_id));
  const quizMap = await listQuizzesByLessons(lessonIds);
  const passedMap = await listPassedQuizzesForLessons({ lessonIds, userId: user.id, passingScore: PASSING_SCORE });
  return rows.map((row) => {
    const lessonId = Number(row.lesson_id);
    const quizIds = quizMap.get(lessonId) || [];
    if (!quizIds.length) return row;
    const passedIds = new Set((passedMap.get(lessonId) || []).map(Number));
    const allDone = quizIds.every((id) => passedIds.has(Number(id)));
    const quizProgress = Math.round((passedIds.size / quizIds.length) * 100);
    let progressValue = Math.max(Number(row.progress ?? 0), quizProgress);
    if (!allDone && progressValue >= 100) progressValue = 99;
    return {
      ...row,
      progress: allDone ? 100 : progressValue,
      is_completed: allDone,
    };
  });
}

// STUDY SESSIONS
export async function recordStudySessionSvc(lessonId) {
  const updated = await incrementStudySessions(lessonId);
  if (!updated) throw new Error('Not found');
  return {
    lesson_id: updated.lesson_id,
    study_sessions_count: updated.study_sessions_count
  };
}
