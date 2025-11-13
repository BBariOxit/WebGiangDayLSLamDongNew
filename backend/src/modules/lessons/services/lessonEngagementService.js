import slugify from 'slugify';
import { createComment, listComments, deleteComment, upsertProgress, getProgress, getRatingSummary, getQuizByLesson, listQuizQuestions, recordQuizAttempt, listQuizAttempts, addBookmark, removeBookmark, listBookmarks, markLessonCompleted, listProgressByUser, getLessonIdForQuiz, listQuizzesByLesson, listPassedQuizzesForLesson, listQuizzesByLessons, listPassedQuizzesForLessons } from '../repositories/lessonEngagementRepo.js';
import { incrementStudySessions, listPublishedLessonsBasic } from '../repositories/lessonRepo.js';

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

const buildEmptyLearningPath = () => ({
  overview: {
    totalLessons: 0,
    completedLessons: 0,
    inProgressLessons: 0,
    notStartedLessons: 0,
    lessonCompletionPercent: 0,
    quizCompletionPercent: 0,
    totalSections: 0,
    completedSections: 0
  },
  sectionProgress: [],
  lessonProgress: [],
  nextLessons: []
});

export async function learningPathOverviewSvc(user) {
  if (!user) throw new Error('Unauthorized');
  const lessonsRaw = await listPublishedLessonsBasic();

  const publishedLessons = lessonsRaw
    .map((lesson) => ({
      ...lesson,
      lesson_id: Number(lesson.lesson_id)
    }))
    .filter((lesson) => Number.isFinite(lesson.lesson_id));

  if (!publishedLessons.length) {
    return buildEmptyLearningPath();
  }

  const lessonIds = publishedLessons.map((lesson) => lesson.lesson_id);
  const [progressRows, quizMap, passedMap] = await Promise.all([
    listProgressByUser(user.id),
    listQuizzesByLessons(lessonIds),
    listPassedQuizzesForLessons({ lessonIds, userId: user.id, passingScore: PASSING_SCORE })
  ]);

  const progressMap = new Map(progressRows.map((row) => [Number(row.lesson_id), row]));

  const normalizedLessons = publishedLessons.map((lesson) => {
    const lessonId = lesson.lesson_id;
    const quizIds = quizMap.get(lessonId) || [];
    const passedIds = new Set((passedMap.get(lessonId) || []).map(Number));
    const totalQuizzes = quizIds.length;
    const passedQuizzes = passedIds.size;
    const progressRow = progressMap.get(lessonId);
    const storedProgress = Number(progressRow?.progress ?? 0);

    let progressPercent = storedProgress;
    let status = 'not-started';

    if (totalQuizzes > 0) {
      const quizPercent = Math.round((passedQuizzes / totalQuizzes) * 100);
      progressPercent = quizPercent;
      if (passedQuizzes >= totalQuizzes) {
        status = 'completed';
        progressPercent = 100;
      } else if (passedQuizzes > 0) {
        status = 'in-progress';
      } else if (storedProgress > 0) {
        status = storedProgress >= 100 ? 'completed' : 'in-progress';
        progressPercent = storedProgress;
      }
    } else {
      if (progressRow?.is_completed || storedProgress >= 100) {
        status = 'completed';
        progressPercent = 100;
      } else if (storedProgress > 0) {
        status = 'in-progress';
        progressPercent = storedProgress;
      }
    }

    progressPercent = Math.min(100, Math.max(0, Math.round(progressPercent || 0)));
    
    // Đảm bảo không có NaN
    if (!Number.isFinite(progressPercent)) {
      progressPercent = 0;
    }
    
    const nextAction = status === 'completed' ? 'review' : status === 'in-progress' ? 'continue' : 'start';

    return {
      lessonId,
      title: lesson.title,
      slug: lesson.slug,
      summary: lesson.summary,
      duration: lesson.duration,
      difficulty: lesson.difficulty,
      category: lesson.category || 'Phần học khác',
      tags: lesson.tags || [],
      images: lesson.images || [],
      progressPercent,
      status,
      nextAction,
      totalQuizzes,
      passedQuizzes,
      studyCount: Number(lesson.study_sessions_count || 0)
    };
  });

  const totalLessons = normalizedLessons.length;
  const completedLessons = normalizedLessons.filter((lesson) => lesson.status === 'completed').length;
  const inProgressLessons = normalizedLessons.filter((lesson) => lesson.status === 'in-progress').length;
  const notStartedLessons = totalLessons - completedLessons - inProgressLessons;

  const totalQuizzes = normalizedLessons.reduce((sum, lesson) => sum + lesson.totalQuizzes, 0);
  const completedQuizzes = normalizedLessons.reduce((sum, lesson) => sum + lesson.passedQuizzes, 0);

  const sectionMap = new Map();
  normalizedLessons.forEach((lesson) => {
    const title = lesson.category || 'Phần học khác';
    const id = slugify(title, { lower: true, strict: true }) || 'phan-hoc';
    if (!sectionMap.has(id)) {
      sectionMap.set(id, {
        id,
        title,
        lessons: [],
        totalLessons: 0,
        completedLessons: 0
      });
    }
    const section = sectionMap.get(id);
    section.lessons.push(lesson);
    section.totalLessons += 1;
    if (lesson.status === 'completed') section.completedLessons += 1;
  });

  const sectionProgress = Array.from(sectionMap.values()).map((section) => ({
    id: section.id,
    title: section.title,
    totalLessons: section.totalLessons,
    completedLessons: section.completedLessons,
    progressPercent: section.totalLessons ? Math.round((section.completedLessons / section.totalLessons) * 100) : 0,
    highlightLesson: section.lessons.find((lesson) => lesson.status !== 'completed') || section.lessons[0] || null
  }));

  const nextLessons = normalizedLessons
    .filter((lesson) => lesson.status !== 'completed')
    .sort((a, b) => {
      if (a.status === b.status) return a.progressPercent - b.progressPercent;
      if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
      if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
      return 0;
    })
    .slice(0, 6);

  return {
    overview: {
      totalLessons,
      completedLessons,
      inProgressLessons,
      notStartedLessons,
      lessonCompletionPercent: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
      quizCompletionPercent: totalQuizzes ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0,
      totalSections: sectionProgress.length,
      completedSections: sectionProgress.filter((section) => section.progressPercent >= 100).length
    },
    sectionProgress,
    lessonProgress: normalizedLessons,
    nextLessons
  };
}
