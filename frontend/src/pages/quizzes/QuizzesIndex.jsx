import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import {
  AlarmClock,
  BarChart3,
  BookOpenCheck,
  Filter,
  Layers3,
  Search,
  Shuffle,
  Sparkles,
  Timer,
} from 'lucide-react';

const difficultyPalette = {
  'Cơ bản': 'from-emerald-500 to-emerald-600',
  'Trung bình': 'from-amber-500 to-amber-600',
  'Nâng cao': 'from-rose-500 to-rose-600',
};

const difficultyFilters = ['Cơ bản', 'Trung bình', 'Nâng cao'];
const sortOptions = [
  { value: 'fresh', label: 'Mới nhất' },
  { value: 'duration', label: 'Thời lượng tăng dần' },
  { value: 'difficulty', label: 'Độ khó' },
];

const getQuestionCount = (quiz = {}) => {
  if (Array.isArray(quiz.questions)) return quiz.questions.length;
  return Number(quiz.question_count || quiz.question_total || 0);
};

const QuizzesIndex = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('');
  const [sort, setSort] = React.useState('fresh');
  const [quizzes, setQuizzes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await quizApi.listPublicQuizzes();
        if (mounted) setQuizzes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError(e.message || 'Không tải được danh sách quiz');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (quizzes || []).filter((quiz) => {
      const title = (quiz.title || '').toLowerCase();
      const desc = (quiz.description || '').toLowerCase();
      const matchesKeyword = !keyword || title.includes(keyword) || desc.includes(keyword);
      const matchesDifficulty = !difficulty || quiz.difficulty === difficulty;
      return matchesKeyword && matchesDifficulty;
    });
  }, [quizzes, search, difficulty]);

  const sorted = useMemo(() => {
    const byDifficulty = {
      'Cơ bản': 0,
      'Trung bình': 1,
      'Nâng cao': 2,
    };
    const copy = [...filtered];
    switch (sort) {
      case 'duration':
        return copy.sort(
          (a, b) => Number(a.time_limit || a.duration || 0) - Number(b.time_limit || b.duration || 0)
        );
      case 'difficulty':
        return copy.sort(
          (a, b) => (byDifficulty[a.difficulty] ?? 99) - (byDifficulty[b.difficulty] ?? 99)
        );
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || b.updatedAt || b.createdAt || 0) -
            new Date(a.updated_at || a.created_at || a.updatedAt || a.createdAt || 0)
        );
    }
  }, [filtered, sort]);

  const stats = useMemo(() => {
    const shown = sorted.length;
    const totalMinutes = sorted.reduce(
      (sum, quiz) => sum + Number(quiz.time_limit || quiz.duration || 0),
      0
    );
    const totalQuestions = sorted.reduce((sum, quiz) => sum + getQuestionCount(quiz), 0);
    const topicMap = sorted.reduce((acc, quiz) => {
      const category = quiz.category || 'Chưa phân loại';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(topicMap).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      shown,
      totalMinutes,
      avgDuration: shown ? Math.round(totalMinutes / shown) : 0,
      totalQuestions,
      topCategory,
    };
  }, [sorted]);

  const featured = useMemo(() => {
    const sortedByQuestions = [...sorted].sort(
      (a, b) => getQuestionCount(b) - getQuestionCount(a)
    );
    return sortedByQuestions.slice(0, 3);
  }, [sorted]);

  const handleClearFilters = () => {
    setSearch('');
    setDifficulty('');
    setSort('fresh');
  };

  const handleRandomQuiz = () => {
    if (!sorted.length) return;
    const randomQuiz = sorted[Math.floor(Math.random() * sorted.length)];
    if (randomQuiz?.quiz_id || randomQuiz?.id) {
      navigate(`/quizzes/take/${randomQuiz.quiz_id ?? randomQuiz.id}`);
    }
  };

  const handleOpenQuiz = (quiz) => {
    if (!quiz.quiz_id && !quiz.id) return;
    navigate(`/quizzes/take/${quiz.quiz_id ?? quiz.id}`);
  };

  const renderQuizCard = (quiz, idx) => {
    const gradient = difficultyPalette[quiz.difficulty] || 'from-blue-500 to-blue-600';
    const questions = Array.isArray(quiz.questions)
      ? quiz.questions.length
      : quiz.question_count || quiz.question_total || 0;
    const lessonTitle = quiz.lesson_title || quiz.lessonTitle || quiz.lesson?.title || '';
    const statusLabel = quiz.status || 'Sẵn sàng';
    const statusColor =
      statusLabel === 'Sẵn sàng'
        ? 'bg-emerald-400'
        : statusLabel === 'Bảo trì'
        ? 'bg-amber-400'
        : 'bg-slate-300';
    const description = (quiz.description || '').trim();
    const hasDescription = Boolean(description);

    return (
      <Card
        key={quiz.quiz_id ?? quiz.id ?? idx}
        className="group flex min-h-[220px] cursor-pointer flex-col rounded-3xl border border-slate-100 bg-white/95 shadow-smooth transition hover:-translate-y-1 hover:shadow-xl"
        onClick={() => handleOpenQuiz(quiz)}
      >
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg',
                gradient
              )}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-left">
              <p className="text-base font-semibold text-slate-900 line-clamp-2">{quiz.title || 'Bài kiểm tra'}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {quiz.category && (
                  <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600">
                    {quiz.category}
                  </Badge>
                )}
                <Badge variant="outline" className="rounded-full border-dashed text-slate-500">
                  {quiz.difficulty || 'Chưa rõ'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="min-h-[22px] text-left">
            {hasDescription ? (
              <p className="text-sm text-slate-600 line-clamp-1">{description}</p>
            ) : (
              <span className="text-sm text-transparent">placeholder</span>
            )}
          </div>

          <div className="mt-1 grid grid-cols-3 gap-2 text-sm text-slate-600">
            <MiniStat icon={<Timer className="h-4 w-4" />} label="Thời lượng" value={`${quiz.time_limit || 0}′`} />
            <MiniStat
              icon={<BookOpenCheck className="h-4 w-4" />}
              label="Câu hỏi"
              value={`${questions || 0} câu`}
            />
            <MiniStat
              icon={<Layers3 className="h-4 w-4" />}
              label="Bài học"
              value={lessonTitle ? truncateText(lessonTitle, 60) : 'Đang cập nhật'}
            />
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className={cn('h-2.5 w-2.5 rounded-full', statusColor)} />
              {statusLabel}
            </div>
            <Button
              type="button"
              className="rounded-full px-5 font-semibold shadow-lg shadow-slate-200 transition group-hover:bg-slate-900 group-hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenQuiz(quiz);
              }}
            >
              Bắt đầu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 p-6 text-white shadow-smooth">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_45%)] opacity-70" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="space-y-4 md:flex-1">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Trung tâm bài kiểm tra</p>
            <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl">
              Quiz & Bài tập tương tác dành cho bạn
            </h1>
            <p className="max-w-3xl text-base text-white/80">
              Chọn ngay một bài quiz để luyện tập kiến thức Lịch sử Lâm Đồng.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleRandomQuiz}
                className="rounded-2xl bg-white text-slate-900 hover:bg-white/90"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Kiểm tra ngẫu nhiên
              </Button>
            </div>
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <HeroStat label="Bài hiển thị" value={stats.shown} />
            <HeroStat label="Thời lượng TB" value={`${stats.avgDuration}′`} />
            <HeroStat label="Câu hỏi tổng" value={stats.totalQuestions} />
          </div>
        </div>
        {featured.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((quiz, idx) => (
              <div
                key={`featured-${idx}`}
                className="flex h-full flex-col rounded-2xl bg-white/80 p-4 text-slate-900 shadow-lg transition hover:shadow-xl"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">Nổi bật</p>
                <p className="mt-1 font-heading text-lg font-semibold line-clamp-2">{quiz.title}</p>
                <p
                  className="text-sm text-slate-600"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '3px'
                  }}
                >
                  {quiz.description || 'Khám phá ngay.'}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-auto w-fit rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenQuiz(quiz);
                  }}
                >
                  Vào thi
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tiêu đề, mô tả, chủ đề..."
                className="h-12 pl-12"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Độ khó:</span>
            {difficultyFilters.map((level) => {
              const active = difficulty === level;
              return (
                <Button
                  key={level}
                  variant={active ? 'default' : 'secondary'}
                  className={cn(
                    'rounded-2xl text-sm',
                    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                  onClick={() => setDifficulty(active ? '' : level)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {level}
                </Button>
              );
            })}
          </div>

          {(search || difficulty || sort !== 'fresh') && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Đang áp dụng bộ lọc nâng cao.{' '}
              <button
                className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                onClick={handleClearFilters}
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard
          icon={<Sparkles className="h-5 w-5 text-emerald-600" />}
          title="Chủ đề nổi bật"
          value={stats.topCategory || 'Đang cập nhật'}
          description="Dựa trên số lượng quiz hiện có"
        />
        <InsightCard
          icon={<Timer className="h-5 w-5 text-amber-500" />}
          title="Thời lượng khuyến nghị"
          value={`${stats.avgDuration} phút`}
          description="Phù hợp cho mỗi buổi học"
        />
        <InsightCard
          icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
          title="Tổng câu hỏi"
          value={stats.totalQuestions}
          description="Bao gồm các bài luyện tập"
        />
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <div key={`skeleton-${idx}`} className="h-64 animate-pulse rounded-3xl bg-slate-200/60" />
          ))}
        </div>
      ) : sorted.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">{sorted.map(renderQuizCard)}</div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
          <AlarmClock className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-lg font-semibold text-slate-700">Không tìm thấy quiz nào</p>
          <p className="text-sm text-slate-500">Hãy thử bỏ chọn bộ lọc để xem thêm gợi ý.</p>
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
    <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
      {icon}
      {label}
    </div>
    <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-2">{value}</p>
  </div>
);

const truncateText = (text = '', maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
};

const HeroStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center">
    <p className="text-xs uppercase tracking-widest text-white/70">{label}</p>
    <p className="mt-1 text-3xl font-black">{value}</p>
  </div>
);

const InsightCard = ({ icon, title, value, description }) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-slate-100 p-3">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{description}</p>
  </div>
);

export default QuizzesIndex;
