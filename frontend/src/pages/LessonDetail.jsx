import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  BookOpenCheck,
  ChevronRight,
  Clock3,
  Home,
  Printer,
  Share2,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@features/auth/hooks/useAuth';
import CommentSection from '../shared/components/CommentSection';
import { resolveAssetUrl } from '../shared/utils/url';
import { quizApi } from '../api/quizApi';
import quizService from '../shared/services/quizService';
import {
  fetchRatingSummary,
  recordStudySession,
  listMyBookmarks,
  addBookmarkApi,
  removeBookmarkApi,
  fetchProgress,
  saveProgress,
  listQuizAttempts
} from '../api/lessonEngagementApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const QUIZ_PASSING_SCORE = 70;

const LessonDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quizzesForLesson, setQuizzesForLesson] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [lessonQuiz, setLessonQuiz] = useState(null);
  const [quizCompletion, setQuizCompletion] = useState({});
  const [quizStatusLoading, setQuizStatusLoading] = useState(false);
  const [showQuizSelector, setShowQuizSelector] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ avg_rating: 0, rating_count: 0 });
  const [studySessionPosted, setStudySessionPosted] = useState(false);
  const lastSavedProgressRef = useRef(0);

  const quizItems = useMemo(() => {
    if (quizzesForLesson.length > 0) {
      return quizzesForLesson.map((quiz) => ({
        id: String(quiz.quiz_id),
        title: quiz.title,
        questionCount:
          quiz.question_count ??
          quiz.questions_count ??
          quiz.questionCount ??
          quiz.questions?.length ??
          0,
        duration: quiz.time_limit ?? quiz.duration_minutes ?? quiz.duration ?? null,
        difficulty: quiz.difficulty || lesson?.difficulty || 'Cơ bản',
        source: 'api'
      }));
    }
    if (lessonQuiz) {
      return [
        {
          id: String(lessonQuiz.id),
          title: lessonQuiz.title || 'Quiz tổng hợp',
          questionCount: lessonQuiz.questions?.length || 0,
          duration: lessonQuiz.timeLimit ? `${lessonQuiz.timeLimit} phút` : null,
          difficulty: lessonQuiz.difficulty || lesson?.difficulty || 'Cơ bản',
          source: 'legacy'
        }
      ];
    }
    return [];
  }, [quizzesForLesson, lessonQuiz, lesson?.difficulty]);

  const quizSummary = useMemo(() => {
    const total = quizItems.length;
    const completedCount = total
      ? quizItems.filter((quiz) => quizCompletion[quiz.id]?.completed).length
      : 0;
    return { total, completedCount };
  }, [quizItems, quizCompletion]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/lessons/slug/${slug}`);
        const lessonData = response.data?.data ?? response.data;
        if (!lessonData || !lessonData.lesson_id) {
          setLesson(null);
          return;
        }

        const parsedImages = normalizeImages(lessonData.images);
        const normalizedSections = normalizeSections(lessonData.sections);

        const mappedLesson = {
          id: lessonData.lesson_id,
          title: lessonData.title,
          slug: lessonData.slug,
          summary: lessonData.summary || '',
          description: lessonData.content_html || '',
          instructor: lessonData.instructor || 'Nhóm biên soạn địa phương',
          duration: lessonData.duration || '25 phút',
          difficulty: lessonData.difficulty || 'Cơ bản',
          studyCount: Number(lessonData.study_sessions_count ?? lessonData.students_count ?? 0),
          category: lessonData.category || '',
          tags: Array.isArray(lessonData.tags) ? lessonData.tags : [],
          images: parsedImages,
          sections: normalizedSections
        };

        setLesson(mappedLesson);

        if (user) {
          const progressRow = await fetchProgress(mappedLesson.id);
          const normalizedProgress = Number(progressRow?.progress ?? 0);
          lastSavedProgressRef.current = normalizedProgress;
          setCompleted(Boolean(progressRow?.is_completed));
          if (normalizedProgress > 0) {
            setReadingProgress(normalizedProgress);
          }
        } else {
          lastSavedProgressRef.current = 0;
          setCompleted(false);
        }

        try {
          const list = await quizApi.listPublicQuizzes({ lessonId: mappedLesson.id });
          setQuizzesForLesson(list || []);
          if (list?.length) {
            setSelectedQuizId(String(list[0].quiz_id));
          } else {
            const legacy = await quizService.getQuizByLessonId(mappedLesson.id);
            setLessonQuiz(legacy || null);
            if (legacy?.id) setSelectedQuizId(String(legacy.id));
          }
        } catch (error) {
          console.warn('Load quizzes list failed, fallback to legacy quiz.', error);
          const legacy = await quizService.getQuizByLessonId(mappedLesson.id);
          setLessonQuiz(legacy || null);
          if (legacy?.id) setSelectedQuizId(String(legacy.id));
        }

        try {
          const rating = await fetchRatingSummary(mappedLesson.id);
          setRatingSummary(rating);
        } catch (err) {
          console.warn('Rating summary load failed', err);
          setRatingSummary({ avg_rating: 0, rating_count: 0 });
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };

    setStudySessionPosted(false);
    fetchLesson();
  }, [slug, user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!user || !lesson?.id) return;
        const items = await listMyBookmarks();
        if (cancelled) return;
        const bookmarkedIds = new Set((items || []).map((it) => Number(it.lesson_id || it.id)));
        setIsBookmarked(bookmarkedIds.has(Number(lesson.id)));
      } catch (err) {
        console.warn('Bookmark load failed', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, lesson?.id]);

  useEffect(() => {
    if (!lesson?.id || studySessionPosted) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await recordStudySession(lesson.id);
        if (cancelled) return;
        if (result && typeof result.study_sessions_count === 'number') {
          setLesson((prev) => (prev ? { ...prev, studyCount: result.study_sessions_count } : prev));
        } else {
          setLesson((prev) => (prev ? { ...prev, studyCount: (prev.studyCount || 0) + 1 } : prev));
        }
      } catch (err) {
        if (!cancelled) console.warn('recordStudySession failed', err);
      } finally {
        if (!cancelled) setStudySessionPosted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson?.id, studySessionPosted]);

  useEffect(() => {
    if (quizItems.length === 0 && showQuizSelector) {
      setShowQuizSelector(false);
    }
  }, [quizItems.length, showQuizSelector]);

  useEffect(() => {
    if (!user || quizItems.length === 0) {
      setQuizCompletion({});
      setQuizStatusLoading(false);
      return;
    }
    let cancelled = false;
    setQuizStatusLoading(true);
    (async () => {
      const entries = await Promise.all(
        quizItems.map(async (quiz) => {
          try {
            if (quiz.source === 'api') {
              const attempts = await listQuizAttempts(quiz.id);
              return [quiz.id, computeQuizCompletionMeta(attempts)];
            }
            const attempts = quizService
              .getAttemptsByQuiz(quiz.id)
              .filter((attempt) => String(attempt.userId) === String(user.id));
            return [quiz.id, computeQuizCompletionMeta(attempts)];
          } catch (err) {
            console.warn(`Load quiz attempts failed for ${quiz.id}`, err);
            return [quiz.id, computeQuizCompletionMeta([])];
          }
        })
      );
      if (!cancelled) {
        setQuizCompletion(Object.fromEntries(entries));
      }
    })()
      .catch((err) => console.warn('Failed to build quiz completion map', err))
      .finally(() => {
        if (!cancelled) setQuizStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, quizItems]);

  useEffect(() => {
    if (!lesson?.id || !user || quizItems.length === 0) return;
    const allDone = quizItems.every((quiz) => quizCompletion[quiz.id]?.completed);
    if (allDone && (lastSavedProgressRef.current < 100 || !completed)) {
      setCompleted(true);
      lastSavedProgressRef.current = 100;
      saveProgress(lesson.id, 100).catch((err) => console.warn('saveProgress failed', err));
    } else if (!allDone && completed) {
      setCompleted(false);
    }
  }, [quizCompletion, quizItems, lesson?.id, user?.id, completed]);

  useEffect(() => {
    const MIN_DELTA = 10;
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

      const clamped = Math.min(Math.max(scrolled, 0), 100);
      setReadingProgress(clamped);
      setShowScrollTop(winScroll > 300);

      if (!lesson?.id || !user) return;

      const newProgress = Math.min(Math.round(clamped), 100);
      const reachedCompletion = newProgress === 100;
      const shouldPersist =
        (newProgress >= 20 && newProgress - lastSavedProgressRef.current >= MIN_DELTA) ||
        (reachedCompletion && lastSavedProgressRef.current < 100);

      if (shouldPersist) {
        lastSavedProgressRef.current = newProgress;
        saveProgress(lesson.id, newProgress).catch((err) => console.warn('saveProgress failed', err));
      }

      if (reachedCompletion && !completed) {
        setCompleted(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson?.id, user?.id, completed]);

  const handleBookmark = async () => {
    if (!lesson?.id) return;
    if (!user) {
      window.alert('Vui lòng đăng nhập để lưu bài học');
      return;
    }
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) await addBookmarkApi(lesson.id);
      else await removeBookmarkApi(lesson.id);
    } catch (err) {
      setIsBookmarked(!next);
      console.warn('Bookmark toggle failed', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson?.title,
          text: lesson?.summary,
          url: window.location.href
        });
      } catch {
        // ignore cancel
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      window.alert('Link đã được sao chép!');
    }
  };

  const handlePrint = () => window.print();

  const handleQuizNavigate = () => {
    const targetId = selectedQuizId || (lessonQuiz?.id ? String(lessonQuiz.id) : null);
    if (!targetId) {
      window.alert('Bài học này chưa có quiz.');
      return;
    }
    navigate(`/quizzes/take/${targetId}`, { state: { fromLesson: location.pathname } });
  };

  const handleQuizButtonClick = () => {
    if (!(quizzesForLesson.length > 0 || lessonQuiz)) {
      window.alert('Bài học này chưa có quiz.');
      return;
    }
    if (!selectedQuizId && quizItems.length > 0) {
      setSelectedQuizId(quizItems[0].id);
    }
    setShowQuizSelector((prev) => !prev);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const ratingValue = ratingSummary.rating_count ? Number(ratingSummary.avg_rating || 0) : 5;
  const heroImages = useMemo(() => extractHeroImages(lesson), [lesson]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="mb-6 h-1.5 w-64 animate-pulse rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" />
        <p className="text-sm text-slate-500">Đang tải bài học...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-lg rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-smooth">
          <CardTitle className="text-rose-500">Không tìm thấy bài học</CardTitle>
          <p className="mt-2 text-sm text-slate-500">Liên kết có thể đã hết hạn hoặc bài học đã bị gỡ.</p>
          <Button className="mt-4 rounded-full px-6" onClick={() => navigate('/lessons')}>
            Quay về danh sách bài học
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-slate-200/80">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-12 sm:px-6 lg:px-0">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-full px-3 text-slate-600"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-slate-500"
            onClick={() => navigate('/')}
          >
            <Home className="h-3.5 w-3.5" />
            Trang chủ
          </button>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="text-sm font-medium text-slate-400">Bài học</span>
        </div>

        <Card className="rounded-[32px] border border-slate-100 bg-white/95 shadow-smooth">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-semibold text-slate-900 sm:text-4xl">{lesson.title}</CardTitle>
              {lesson.summary && (
                <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line break-words break-all">
                  {lesson.summary}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {lesson.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={handleBookmark}
                aria-label="Bookmark lesson"
              >
                {isBookmarked ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : <BookOpenCheck className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare} aria-label="Chia sẻ">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handlePrint} aria-label="In">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Giảng viên',
                  value: lesson.instructor,
                  icon: BookOpenCheck,
                  accent: 'text-indigo-500 bg-indigo-50'
                },
                { label: 'Thời lượng', value: lesson.duration, icon: Clock3, accent: 'text-amber-500 bg-amber-50' },
                { label: 'Độ khó', value: lesson.difficulty, icon: TrendingUp, accent: 'text-emerald-500 bg-emerald-50' },
                { label: 'Lượt học', value: lesson.studyCount, icon: Users, accent: 'text-sky-500 bg-sky-50' }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className={cn('mb-3 inline-flex rounded-full p-2', item.accent)}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-base font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        'h-4 w-4',
                        index < Math.round(ratingValue) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500">
                  {(ratingSummary.rating_count ? ratingSummary.avg_rating : 5) || 5}/5 ·{' '}
                  {ratingSummary.rating_count || 0} đánh giá
                </span>
              </div>
              <div className="flex items-center gap-3">
                {completed && (
                  <Badge variant="success" className="rounded-full bg-emerald-50 text-emerald-600">
                    Đã hoàn thành
                  </Badge>
                )}
                <Button
                  className={cn(
                    'rounded-full bg-sky-500 px-6 shadow-lg shadow-sky-200 hover:bg-sky-600',
                    (quizzesForLesson.length === 0 && !lessonQuiz) && 'pointer-events-none opacity-60'
                  )}
                  onClick={handleQuizButtonClick}
                >
                  {(quizzesForLesson.length > 0 || lessonQuiz) ? 'Làm bài kiểm tra' : 'Chưa có bài kiểm tra'}
                </Button>
              </div>
            </div>

            {showQuizSelector && quizItems.length > 0 && (
              <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Chọn bài kiểm tra</p>
                    <p className="text-xs text-slate-500">
                      Lựa chọn bài kiểm tra bạn muốn thực hiện. Điểm số sẽ được lưu vào tiến độ của bạn.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={selectedQuizId || ''}
                      onChange={(event) => setSelectedQuizId(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {quizItems.map((quiz) => (
                        <option key={quiz.id} value={quiz.id}>
                          {quiz.title} · {quiz.questionCount} câu hỏi
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-full px-4" onClick={handleQuizNavigate}>
                        Bắt đầu
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full px-4 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowQuizSelector(false)}
                      >
                        Đóng
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {heroImages.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {heroImages.map((img, idx) => (
              <img
                key={`${img.url}-${idx}`}
                src={resolveAssetUrl(img.url)}
                alt={img.caption || `Ảnh giới thiệu ${idx + 1}`}
                className={cn(
                  'w-full rounded-[28px] object-cover shadow-smooth',
                  idx === 0 ? 'h-72 sm:col-span-2' : 'h-64'
                )}
              />
            ))}
          </div>
        )}

        <div className="space-y-4">
          {lesson.sections.length > 0 ? (
            lesson.sections.map((section, index) => (
              <Card key={`${section.type}-${index}`} className="rounded-[28px] border-none bg-white shadow-smooth">
                <CardContent className="space-y-6 px-6 py-6">{renderSectionBody(section)}</CardContent>
              </Card>
            ))
          ) : (
            <Card className="rounded-[28px] border-none bg-white shadow-smooth">
              <CardContent>
                <div
                  className="space-y-4 leading-relaxed text-slate-700"
                  dangerouslySetInnerHTML={{ __html: lesson.description }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {quizItems.length > 0 && (
          <Card className="rounded-[28px] border-none bg-white shadow-smooth">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900">Danh sách bài kiểm tra</CardTitle>
                <p className="text-sm text-slate-500">
                  {user
                    ? `${quizSummary.completedCount}/${quizSummary.total} bài đã hoàn thành`
                    : 'Đăng nhập để lưu tiến độ làm bài kiểm tra'}
                </p>
              </div>
              {quizStatusLoading && <span className="text-xs text-slate-400">Đang đồng bộ tiến độ...</span>}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {quizItems.map((quiz) => {
                  const completion = quizCompletion[quiz.id] || {};
                  const isFinished = Boolean(completion.completed);
                  const bestScore = Number.isFinite(completion.bestScore) ? completion.bestScore : null;
                  const attemptsCount = completion.attemptCount || 0;
                  const lastAttemptText = completion.lastAttemptAt
                    ? formatAttemptDate(completion.lastAttemptAt)
                    : null;

                  return (
                    <div
                      key={quiz.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-inner"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <Badge
                          className={cn(
                            'rounded-full px-3 py-0.5',
                            isFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          )}
                        >
                          {isFinished ? 'Hoàn thành' : 'Chưa làm'}
                        </Badge>
                        {user && (
                          <span className="text-slate-500">
                            Điểm cao nhất: {bestScore !== null ? `${bestScore}/100` : '—'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{quiz.title}</p>
                        <p className="text-xs text-slate-500">
                          {quiz.questionCount} câu hỏi · {quiz.difficulty}
                        </p>
                      </div>
                      {user && lastAttemptText && (
                        <div className="text-xs text-slate-500">
                          <p>Lần cuối: {lastAttemptText}</p>
                        </div>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {isFinished ? 'Xem lại kiến thức' : 'Sẵn sàng thử sức'}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full px-4"
                          onClick={() => navigate(`/quizzes/take/${quiz.id}`, { state: { fromLesson: location.pathname } })}
                        >
                          {isFinished ? 'Làm lại' : 'Làm ngay'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[28px] border-none bg-white shadow-smooth">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Thảo luận</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentSection lessonId={lesson.id} />
          </CardContent>
        </Card>
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 rounded-full bg-white p-3 text-slate-600 shadow-xl shadow-slate-300 transition hover:text-indigo-500"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

function normalizeImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map((img) => (typeof img === 'string' ? { url: img, caption: '' } : img));
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof images === 'object') {
    return [{ url: images.url, caption: images.caption || '' }];
  }
  return [];
}

function extractHeroImages(lesson) {
  if (!lesson?.images?.length) return [];
  const galleryUrls = new Set();
  (lesson.sections || []).forEach((section) => {
    if (section.type === 'image_gallery') {
      (section.data?.images || []).forEach((img) => {
        if (img?.url) galleryUrls.add(img.url);
      });
    }
  });
  const seen = new Set();
  const unique = [];
  lesson.images.forEach((img) => {
    const normalized = typeof img === 'string' ? { url: img, caption: '' } : img;
    if (!normalized?.url) return;
    if (galleryUrls.has(normalized.url)) return;
    if (seen.has(normalized.url)) return;
    seen.add(normalized.url);
    unique.push(normalized);
  });
  return unique.slice(0, 3);
}

function formatAttemptDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function normalizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections
    .map((section, idx) => {
      let data = section.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          data = {};
        }
      }
      return {
        type: section.type || 'text',
        title: section.title || '',
        contentHtml: section.contentHtml ?? section.content_html ?? '',
        data: data || {},
        orderIndex: Number(section.orderIndex ?? section.order_index ?? idx)
      };
    })
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

function renderSectionBody(section) {
  if (section.type === 'heading') {
    return (
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold text-slate-900">{section.title}</h3>
        {section.contentHtml && (
          <div className="space-y-3 leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
        )}
      </div>
    );
  }

  if (section.type === 'text') {
    return (
      <div className="space-y-3">
        {section.title && <h4 className="text-xl font-semibold text-slate-900">{section.title}</h4>}
        <div className="space-y-3 leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
      </div>
    );
  }

  if (section.type === 'image_gallery' && Array.isArray(section.data?.images)) {
    return (
      <div className="space-y-4">
        {section.title && <h4 className="text-xl font-semibold text-slate-900">{section.title}</h4>}
        <div className="grid gap-4 sm:grid-cols-2">
          {section.data.images.map((img, idx) => (
            <div key={`${img.url}-${idx}`} className="overflow-hidden rounded-3xl border border-slate-100 shadow-smooth">
              <img src={resolveAssetUrl(img.url)} alt={img.caption || `Hình ${idx + 1}`} className="h-60 w-full object-cover" />
              {(img.caption || img.description) && (
                <div className="px-4 py-3 text-sm text-slate-600">{img.caption || img.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'video') {
    const url = section.data?.url || '';
    return (
      <div className="space-y-3">
        {section.title && <h4 className="text-xl font-semibold text-slate-900">{section.title}</h4>}
        <div className="overflow-hidden rounded-3xl bg-slate-900/5">
          {url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo') ? (
            <iframe
              title={section.title || 'Video'}
              src={url}
              className="h-72 w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video controls className="h-72 w-full rounded-3xl" src={url} />
          )}
        </div>
        {section.data?.description && <p className="text-sm text-slate-500">{section.data.description}</p>}
      </div>
    );
  }

  if (section.type === 'divider') {
    return <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />;
  }

  return (
    <div className="space-y-3">
      {section.title && <h4 className="text-xl font-semibold text-slate-900">{section.title}</h4>}
      {section.contentHtml && (
        <div className="space-y-3 leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
      )}
    </div>
  );
}

function computeQuizCompletionMeta(attempts = []) {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return { completed: false, bestScore: 0, attemptCount: 0, lastAttemptAt: null };
  }
  const bestScore = attempts.reduce((max, attempt) => {
    const score = Number(attempt.score ?? attempt.best_score ?? attempt.bestScore ?? 0);
    return Number.isFinite(score) ? Math.max(max, score) : max;
  }, 0);
  const lastAttemptAt =
    attempts[0]?.created_at ||
    attempts[0]?.createdAt ||
    attempts[0]?.updated_at ||
    null;
  return {
    completed: bestScore >= QUIZ_PASSING_SCORE,
    bestScore,
    attemptCount: attempts.length,
    lastAttemptAt
  };
}

export default LessonDetail;
