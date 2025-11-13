import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  MoreVertical,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import apiClient from '../shared/services/apiClient';
import { resolveAssetUrl } from '../shared/utils/url';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { listMyProgress } from '../api/lessonEngagementApi';

const DEFAULT_RATING = 5;

const clampProgress = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(Math.max(Math.round(numeric), 0), 100);
};

const parseLessonImages = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) =>
        typeof item === 'string' ? { url: item, caption: '' } : item,
      )
      .filter((img) => img && typeof img.url === 'string');
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseLessonImages(parsed);
    } catch {
      return [{ url: raw, caption: '' }];
    }
  }
  if (typeof raw === 'object') {
    return raw.url ? [raw] : [];
  }
  return [];
};

const formatRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return DEFAULT_RATING;
  return Math.round(numeric * 10) / 10;
};

const buildProgressMap = (rows = []) =>
  new Map(
    rows
      .map((row) => {
        const lessonId = Number(row.lesson_id);
        if (!Number.isFinite(lessonId)) return null;
        return [
          lessonId,
          {
            progress: Number(row.progress ?? 0),
            isCompleted: Boolean(row.is_completed ?? row.isCompleted),
          },
        ];
      })
      .filter(Boolean),
  );

const MyLearning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const lessonsPromise = apiClient.get('/lessons?published=1');
        const progressPromise = user ? listMyProgress() : Promise.resolve([]);

        const [lessonsRes, progressRows] = await Promise.all([lessonsPromise, progressPromise]);

        if (!mounted) return;

        const payload = Array.isArray(lessonsRes.data)
          ? lessonsRes.data
          : lessonsRes.data?.data || [];

        const progressMap = buildProgressMap(progressRows);

        const normalized = (payload || []).map((lesson) => {
          const lessonId = Number(lesson.lesson_id ?? lesson.id);
          const progressState = progressMap.get(lessonId) || {};
          const progressValue = clampProgress(progressState.progress ?? lesson.progress ?? 0);
          const isCompleted = progressState.isCompleted || progressValue >= 100;

          const ratingSource = lesson.avg_rating ?? lesson.rating ?? lesson.avgRating;

          return {
            id: lessonId,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary || '',
            instructor: lesson.instructor || 'Nhóm biên soạn địa phương',
            duration: lesson.duration || '25 phút',
            difficulty: lesson.difficulty || 'Cơ bản',
            category: lesson.category || 'Lịch sử địa phương',
            rating: formatRating(ratingSource),
            ratingCount: Number(lesson.rating_count ?? lesson.ratingCount ?? 0),
            studyCount: Number(lesson.study_sessions_count ?? lesson.students_count ?? 0),
            progress: progressValue,
            status: isCompleted ? 'completed' : progressValue > 0 ? 'in-progress' : 'not-started',
            images: parseLessonImages(lesson.images),
            createdAt: lesson.created_at || lesson.createdAt || new Date().toISOString(),
          };
        });

        setLessons(normalized);
      } catch (err) {
        if (mounted) {
          const message = err?.response?.data?.error || err?.message || 'Không thể tải dữ liệu bài học';
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Filter lessons based on search and status
  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((lesson) => lesson.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.category.toLowerCase().includes(query) ||
          lesson.summary.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [lessons, filterStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const inProgress = lessons.filter((l) => l.status === 'in-progress').length;
    const completed = lessons.filter((l) => l.status === 'completed').length;
    const totalProgress = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
    const recentProgress = lessons
      .filter((l) => l.status === 'in-progress')
      .reduce((sum, l) => sum + l.progress, 0) / Math.max(inProgress, 1);

    return {
      inProgress,
      completed,
      totalProgress,
      recentProgress: Math.round(recentProgress),
      total: lessons.length,
    };
  }, [lessons]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-20 pt-8">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-sky-400/10 blur-[120px] animate-pulse" />
        <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-violet-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-400/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-slate-600">Học tập của bạn</span>
            </div>
            <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
              Lộ trình học tập
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Theo dõi tiến độ, tiếp tục bài học chưa hoàn thành, và khám phá nội dung mới.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Bài đang học',
                value: stats.inProgress.toString(),
                icon: Play,
                gradient: 'from-sky-500 to-blue-600',
                shadow: 'shadow-sky-500/30',
              },
              {
                label: 'Bài hoàn thành',
                value: stats.completed.toString(),
                icon: CheckCircle2,
                gradient: 'from-emerald-500 to-teal-600',
                shadow: 'shadow-emerald-500/30',
              },
              {
                label: 'Tiến độ tổng',
                value: `${stats.totalProgress}%`,
                icon: TrendingUp,
                gradient: 'from-amber-500 to-orange-600',
                shadow: 'shadow-amber-500/30',
              },
              {
                label: 'Tiến độ hiện tại',
                value: `${stats.recentProgress}%`,
                icon: Zap,
                gradient: 'from-violet-500 to-purple-600',
                shadow: 'shadow-violet-500/30',
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="group border-2 border-slate-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                      stat.gradient,
                      stat.shadow
                    )}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-300 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <Tabs
              value={filterStatus}
              onValueChange={setFilterStatus}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-4 bg-slate-100 sm:w-auto">
                <TabsTrigger 
                  value="all"
                  className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Tất cả
                </TabsTrigger>
                <TabsTrigger 
                  value="in-progress"
                  className="text-xs data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-sm"
                >
                  Đang học
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="text-xs data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                >
                  Hoàn thành
                </TabsTrigger>
                <TabsTrigger 
                  value="not-started"
                  className="text-xs data-[state=active]:bg-slate-100 data-[state=active]:shadow-sm"
                >
                  Mới
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {error && (
          <Card className="mb-8 border-2 border-rose-300 bg-rose-50">
            <CardContent className="py-4">
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Lessons Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse space-y-3 rounded-2xl border-2 border-slate-300 bg-white p-4"
              >
                <div className="h-40 rounded-xl bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredLessons.length === 0 ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Không tìm thấy bài học</h3>
              <p className="text-sm text-slate-600">
                {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác.' : 'Không có bài học nào trong danh mục này.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
                onOpen={() => navigate(`/lesson/${lesson.slug}`)}
              />
            ))}
          </div>
        )}

        {filteredLessons.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Hiển thị <span className="font-semibold text-slate-900">{filteredLessons.length}</span> bài học
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const LessonCard = ({ lesson, index, onOpen }) => {
  const backgroundImage = lesson.images?.[0]?.url
    ? `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.75)), url('${resolveAssetUrl(
        lesson.images[0].url,
      )}')`
    : 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))';

  const statusConfig = {
    'in-progress': {
      label: 'Đang học',
      icon: Play,
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
    },
    completed: {
      label: 'Hoàn thành',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    'not-started': {
      label: 'Mới',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
  };

  const config = statusConfig[lesson.status];
  const StatusIcon = config.icon;

  return (
    <button
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-slate-400 hover:shadow-2xl"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    >
      {/* Image section */}
      <div
        className="relative h-40 w-full overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage,
        }}
      >
        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <Badge className={cn(
            'flex items-center gap-1.5 border-0 text-white shadow-lg',
            config.color
          )}>
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>

        {/* Progress overlay */}
        {lesson.status !== 'not-started' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-300/20">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 transition-all duration-500"
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-left text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
            {lesson.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-left text-xs text-slate-500">
            {lesson.summary}
          </p>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-slate-200 text-xs text-slate-600 bg-slate-50">
            {lesson.difficulty}
          </Badge>
          <Badge variant="outline" className="border-slate-200 text-xs text-slate-600 bg-slate-50">
            {lesson.category}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {lesson.duration}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="h-3 w-3" />
              {lesson.studyCount} lượt học
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
            {lesson.rating >= 4 && <Flame className="h-3.5 w-3.5 text-amber-500" />}
            <span className="text-xs font-semibold text-slate-700">{lesson.rating}/5</span>
          </div>
        </div>

        {/* Progress bar for in-progress lessons */}
        {lesson.status === 'in-progress' && (
          <div className="pt-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Tiến độ</span>
              <span className="font-semibold text-slate-900">{lesson.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 transition-all duration-500"
                style={{ width: `${lesson.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
        <Button
          size="lg"
          className="bg-white text-slate-900 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-slate-50"
        >
          <ArrowUpRight className="mr-2 h-4 w-4" />
          {lesson.status === 'completed' ? 'Ôn tập' : lesson.status === 'in-progress' ? 'Tiếp tục' : 'Bắt đầu'}
        </Button>
      </div>
    </button>
  );
};

export default MyLearning;
