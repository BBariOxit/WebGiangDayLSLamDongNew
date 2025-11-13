import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Clock,
  Compass,
  Layers,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@features/auth/hooks/useAuth';
import apiClient from '../shared/services/apiClient';
import {
  listMyBookmarks,
  addBookmarkApi,
  removeBookmarkApi,
  listMyProgress,
} from '../api/lessonEngagementApi';
import { resolveAssetUrl } from '../shared/utils/url';
import { LESSON_SECTIONS, SAMPLE_LESSONS } from '../shared/constants/lessonSections';

const ICON_MAP = {
  landmarks: MapPin,
  figures: Sparkles,
  overview: Layers,
};

const difficultyFilters = ['all', 'Cơ bản', 'Trung bình', 'Nâng cao'];
const statusFilters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'in-progress', label: 'Đang học' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'saved', label: 'Đã lưu' },
];

const fallbackImage = (label = 'Bài học', theme = 'default') => {
  const encoded = encodeURIComponent(label);
  const gradients = {
    default: { from: '#0ea5e9', to: '#6366f1' },
    landmarks: { from: '#06b6d4', to: '#3b82f6' },
    figures: { from: '#8b5cf6', to: '#ec4899' },
    overview: { from: '#f59e0b', to: '#ef4444' },
  };
  const colors = gradients[theme] || gradients.default;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns='http://www.w3.org/2000/svg' width='960' height='540' viewBox='0 0 960 540'>
  <defs>
    <linearGradient id='g-${theme}' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='${colors.from}'/>
      <stop offset='100%' stop-color='${colors.to}'/>
    </linearGradient>
    <filter id='shadow'>
      <feGaussianBlur in='SourceAlpha' stdDeviation='3'/>
      <feOffset dx='0' dy='2' result='offsetblur'/>
      <feComponentTransfer>
        <feFuncA type='linear' slope='0.2'/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in='SourceGraphic'/>
      </feMerge>
    </filter>
  </defs>
  <rect width='960' height='540' fill='url(#g-${theme})' rx='24'/>
  <text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='Inter, -apple-system, system-ui, sans-serif' font-size='48' font-weight='600' fill='white' filter='url(#shadow)'>${encoded}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

const parseImages = (raw, fallbackLabel) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (raw && typeof raw === 'object') return [raw];
  return [{ url: fallbackImage(fallbackLabel) }];
};

const buildProgressMap = (rows = []) =>
  new Map(
    rows.map((row) => [
      Number(row.lesson_id),
      {
        progress: Number(row.progress ?? 0),
        isCompleted: Boolean(row.is_completed),
        bestScore: Number(row.best_score ?? 0),
      },
    ]),
  );

const formatNumber = (value) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

const extractMinutes = (lessons = []) =>
  lessons.reduce((total, lesson) => {
    const match = String(lesson.duration || '').match(/\d+/);
    return total + (match ? parseInt(match[0], 10) : 0);
  }, 0);

const isValidImage = (url) =>
  typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:'));

const Lessons = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [bookmarked, setBookmarked] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const lessonsPromise = apiClient.get('/lessons?published=1');
        const progressPromise = user ? listMyProgress() : Promise.resolve([]);
        const bookmarkPromise = user ? listMyBookmarks() : Promise.resolve([]);

        const [lessonsRes, progressRows, bookmarkRows] = await Promise.all([
          lessonsPromise,
          progressPromise,
          bookmarkPromise,
        ]);

        if (!active) return;

        const payload = Array.isArray(lessonsRes.data)
          ? lessonsRes.data
          : Array.isArray(lessonsRes.data?.data)
            ? lessonsRes.data.data
            : [];

        const progressMap = buildProgressMap(progressRows);
        const normalized = (payload || []).map((lesson) => {
          const lessonId = Number(lesson.lesson_id ?? lesson.id);
          const progress = progressMap.get(lessonId) || {};
          const ratingRaw = Number(lesson.avg_rating ?? lesson.rating ?? 0);
          const ratingCount = Number(lesson.rating_count ?? lesson.ratingCount ?? 0);
          const rating = ratingCount > 0 && Number.isFinite(ratingRaw) ? Math.round(ratingRaw * 10) / 10 : 0;

          const imageCandidates = parseImages(lesson.images, lesson.title);
          const firstImage = imageCandidates[0]?.url;
          let coverImage = fallbackImage(lesson.title);
          if (typeof firstImage === 'string') {
            if (firstImage.startsWith('data:')) {
              coverImage = firstImage;
            } else {
              coverImage = resolveAssetUrl(firstImage);
            }
          }

          return {
            id: lessonId,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary || '',
            duration: lesson.duration || '20 phút',
            difficulty: lesson.difficulty || 'Cơ bản',
            category: lesson.category || 'Lịch sử địa phương',
            rating,
            ratingCount,
            studyCount: Number(lesson.study_sessions_count ?? lesson.students_count ?? 0),
            images: imageCandidates,
            coverImage,
            instructor: lesson.instructor || 'Ban biên soạn Lịch sử Lâm Đồng',
            progress: Number(progress.progress ?? 0),
            isCompleted: Boolean(progress.isCompleted),
            bestScore: Number(progress.bestScore ?? 0),
            tags: Array.isArray(lesson.tags) ? lesson.tags : [],
            isSample: false,
          };
        });

        setLessons(normalized);
        setBookmarked(new Set((bookmarkRows || []).map((row) => Number(row.lesson_id))));
      } catch (err) {
        if (!active) return;
        const message = err?.response?.data?.error || err?.message || 'Không thể tải danh sách bài học';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setStatusFilter('all');
  }, [sectionId]);

  const activeSection = useMemo(() => {
    if (!sectionId) return null;
    return LESSON_SECTIONS.find((section) => section.id === sectionId) || null;
  }, [sectionId]);

  const overviewSections = useMemo(() =>
    LESSON_SECTIONS.map((section) => {
      const source = section.id === 'landmarks' ? lessons : SAMPLE_LESSONS[section.id] || [];
      const minutes = extractMinutes(source);
      const rating = source.length
        ? Math.round((source.reduce((sum, item) => sum + (item.rating || 0), 0) / source.length) * 10) / 10
        : 0;
      const learners = source.reduce((sum, item) => sum + (item.studyCount || 0), 0);
      return {
        ...section,
        lessonCount: source.length,
        minutes,
        rating,
        learners,
      };
    }),
  [lessons]);

  const sectionLessons = useMemo(() => {
    if (!activeSection) return [];
    if (activeSection.id === 'landmarks') return lessons;
    return (SAMPLE_LESSONS[activeSection.id] || []).map((item) => ({
      ...item,
      coverImage: item.coverImage || fallbackImage(item.title),
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [{ url: fallbackImage(item.title) }],
      progress: Number(item.progress ?? 0),
      isCompleted: Boolean(item.isCompleted),
      bestScore: Number(item.bestScore ?? 0),
      isSample: true,
    }));
  }, [activeSection, lessons]);

  const filteredLessons = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return sectionLessons.filter((lesson) => {
      if (difficultyFilter !== 'all' && lesson.difficulty !== difficultyFilter) {
        return false;
      }

      if (activeSection?.id === 'landmarks') {
        if (statusFilter === 'in-progress' && !(lesson.progress > 0 && !lesson.isCompleted)) return false;
        if (statusFilter === 'completed' && !lesson.isCompleted) return false;
        if (statusFilter === 'saved' && !bookmarked.has(Number(lesson.id))) return false;
      } else if (statusFilter !== 'all') {
        return false;
      }

      if (!search) return true;
      const haystack = [lesson.title, lesson.summary, lesson.category, (lesson.tags || []).join(' ')].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }, [sectionLessons, searchTerm, difficultyFilter, statusFilter, activeSection, bookmarked]);

  const stats = useMemo(() => {
    const totalLessons = sectionLessons.length;
    const totalMinutes = extractMinutes(sectionLessons);
    const totalLearners = sectionLessons.reduce((sum, lesson) => sum + (lesson.studyCount || 0), 0);
    const averageRating = sectionLessons.length
      ? Math.round((sectionLessons.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / sectionLessons.length) * 10) / 10
      : 0;
    return { totalLessons, totalMinutes, totalLearners, averageRating };
  }, [sectionLessons]);

  const toggleBookmark = async (lessonId) => {
    const numericId = Number(lessonId);
    if (!Number.isFinite(numericId)) return;
    const isBookmarked = bookmarked.has(numericId);

    setBookmarked((prev) => {
      const next = new Set(prev);
      if (isBookmarked) {
        next.delete(numericId);
      } else {
        next.add(numericId);
      }
      return next;
    });

    try {
      if (!user) return;
      if (isBookmarked) {
        await removeBookmarkApi(numericId);
      } else {
        await addBookmarkApi(numericId);
      }
    } catch (err) {
      setBookmarked((prev) => {
        const next = new Set(prev);
        if (isBookmarked) {
          next.add(numericId);
        } else {
          next.delete(numericId);
        }
        return next;
      });
      const message = err?.response?.data?.error || err?.message || 'Không thể cập nhật danh sách đã lưu';
      setError(message);
    }
  };

  if (!sectionId) {
    const totalLessons = lessons.length;
    const totalMinutes = extractMinutes(lessons);
    const totalLearners = lessons.reduce((sum, lesson) => sum + (lesson.studyCount || 0), 0);
    const averageRating = lessons.length
      ? Math.round((lessons.reduce((sum, lesson) => sum + (lesson.rating || 0), 0) / lessons.length) * 10) / 10
      : 0;

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-24 pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-[140px]" />
          <div className="absolute -right-32 top-10 h-[28rem] w-[28rem] rounded-full bg-violet-300/20 blur-[140px]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
          <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_450px] lg:items-end">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/10">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Hành trình học lịch sử</span>
                  <span className="text-sm font-medium text-slate-400">Lâm Đồng</span>
                </div>
              </div>
              <div className="max-w-3xl space-y-4">
                <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
                  Chọn phần học phù hợp với mục tiêu của bạn
                </h1>
                <p className="text-lg leading-relaxed text-slate-600">
                  Mỗi phần học mở ra một góc nhìn khác nhau về lịch sử Lâm Đồng. Hãy bắt đầu từ chủ đề truyền cảm hứng nhất với bạn.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{
                label: 'Bài học hiện có',
                value: formatNumber(totalLessons),
                icon: Layers,
                gradient: 'from-sky-500 to-blue-600',
                bg: 'bg-sky-50',
                text: 'text-sky-700',
              }, {
                label: 'Tổng thời lượng',
                value: `${formatNumber(totalMinutes)} phút`,
                icon: Clock,
                gradient: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
              }, {
                label: 'Lượt học',
                value: formatNumber(totalLearners),
                icon: Users,
                gradient: 'from-amber-500 to-orange-600',
                bg: 'bg-amber-50',
                text: 'text-amber-700',
              }, {
                label: 'Đánh giá trung bình',
                value: averageRating ? `${averageRating}/5` : '—',
                icon: Star,
                gradient: 'from-violet-500 to-purple-600',
                bg: 'bg-violet-50',
                text: 'text-violet-700',
              }].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="group border-0 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all hover:shadow-xl hover:shadow-slate-300/50">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110', stat.gradient, stat.text)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </header>

          {error && (
            <Card className="border-l-4 border-l-rose-500 border-y-0 border-r-0 bg-gradient-to-r from-rose-50 to-rose-50/50 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5 text-sm text-rose-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                  <Activity className="h-5 w-5 text-rose-600" />
                </div>
                <span className="flex-1 font-medium">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                  onClick={() => setError('')}
                >
                  Đóng
                </Button>
              </CardContent>
            </Card>
          )}

          <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {overviewSections.map((section) => {
              const Icon = ICON_MAP[section.id] || Layers;
              const badgeText = section.comingSoon ? 'Sắp ra mắt' : `${section.lessonCount} bài học`;
              const gradient = section.accent ? `bg-gradient-to-br ${section.accent}` : 'bg-gradient-to-br from-slate-600 to-slate-800';

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigate(`/lessons/${section.id}`)}
                  className="group relative flex min-h-[28rem] flex-col overflow-hidden rounded-[2rem] border-0 bg-white p-10 text-left shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-slate-300/60 hover:ring-slate-300/70 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                    <div className={cn('absolute inset-x-4 top-4 h-56 rounded-[1.75rem] blur-3xl', gradient, 'opacity-20')} />
                  </div>

                  <div className="relative flex items-start justify-between">
                    <span className={cn('flex h-16 w-16 items-center justify-center rounded-[1.25rem] text-white shadow-2xl ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3', gradient)}>
                      <Icon className="h-7 w-7" />
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'px-4 py-1.5 text-xs font-bold uppercase tracking-wider',
                        section.comingSoon 
                          ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 shadow-sm shadow-amber-200' 
                          : 'border-slate-300 bg-white text-slate-700 shadow-sm'
                      )}
                    >
                      {badgeText}
                    </Badge>
                  </div>

                  <div className="relative mt-8 space-y-5">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">{section.shortTitle}</p>
                      <h2 className="h-16 text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-slate-800 line-clamp-2">
                        {section.title}
                      </h2>
                    </div>
                    <p className="h-[4.5rem] text-sm leading-relaxed text-slate-600 line-clamp-3">{section.description}</p>
                  </div>

                  <div className="relative mt-8 grid grid-cols-3 gap-4">
                    <StatsPill label="Bài học" value={formatNumber(section.lessonCount)} />
                    <StatsPill label="Thời lượng" value={`${formatNumber(section.minutes)}'`} />
                    <StatsPill label="Đánh giá" value={section.rating ? `${section.rating}/5` : '—'} />
                  </div>

                  {/* Spacer to push footer to bottom */}
                  <div className="flex-1" />

                  <div className="relative mt-10 flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-700 transition-colors group-hover:text-slate-900">
                      {section.comingSoon ? 'Đang hoàn thiện nội dung' : 'Bắt đầu khám phá ngay'}
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-slate-600" />
                  </div>
                </button>
              );
            })}
          </section>

          {loading && <LoadingState />}
        </div>
      </div>
    );
  }

  if (!activeSection) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-20 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 shadow-xl">
          <Layers className="h-12 w-12 text-slate-500" />
        </div>
        <div className="mt-8 max-w-md space-y-3">
          <h2 className="text-3xl font-bold text-slate-800">Phần học chưa khả dụng</h2>
          <p className="text-base leading-relaxed text-slate-600">
            Vui lòng quay lại danh sách phần học và chọn một chủ đề khác. Chúng tôi sẽ cập nhật nội dung mới ngay khi hoàn thiện.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="lg"
          className="mt-8 rounded-full px-8" 
          onClick={() => navigate('/lessons')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Trở về danh sách phần học
        </Button>
      </div>
    );
  }

  const Icon = ICON_MAP[activeSection.id] || Layers;
  const gradient = activeSection.accent ? `bg-gradient-to-br ${activeSection.accent}` : 'bg-gradient-to-br from-slate-600 to-slate-800';
  const showStatusFilters = activeSection.id === 'landmarks';
  const showBookmarks = activeSection.id === 'landmarks';

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-slate-50 pb-24 pt-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 top-16 h-[30rem] w-[30rem] rounded-full bg-cyan-300/20 blur-[150px]" />
        <div className="absolute -right-40 top-24 h-[32rem] w-[32rem] rounded-full bg-violet-300/20 blur-[150px]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="space-y-8">
          {/* Back Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/lessons')}
            className="group inline-flex h-11 items-center gap-2 rounded-full border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-md transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Trở về danh sách
          </Button>

          {/* Title & Description */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              {activeSection.heroTitle}
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              {activeSection.heroDescription}
            </p>
          </div>

        </header>

        {/* Search & Filters Section */}
        <div className="mx-auto w-full max-w-6xl space-y-0 rounded-2xl bg-white/80 px-8 py-6 shadow-lg backdrop-blur-sm">
          {/* Filter Bar - Centered and Wide */}
          <div className="flex items-center justify-center gap-6 border-b border-slate-200 pb-6">
            {/* Search Box */}
            <div className="relative w-80">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bài học..."
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {/* Danh mục */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-600">Danh mục:</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="h-11 min-w-[140px] cursor-pointer rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="all">Tất cả</option>
                {difficultyFilters.filter(f => f !== 'all').map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Độ khó */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-600">Độ khó:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 min-w-[140px] cursor-pointer rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {statusFilters.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-600">Sắp xếp:</label>
              <select className="h-11 min-w-[140px] cursor-pointer rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200">
                <option>Mới nhất</option>
                <option>Cũ nhất</option>
                <option>Phổ biến nhất</option>
              </select>
            </div>

            {/* Clear Button */}
            {(searchTerm || difficultyFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDifficultyFilter('all');
                  setStatusFilter('all');
                }}
                className="flex h-11 items-center gap-2 rounded-xl border border-sky-300 bg-white px-5 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-50"
              >
                <span className="text-lg">✕</span>
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Status Tabs - Centered */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[
              { label: 'TẤT CẢ', count: filteredLessons.length, value: 'all' },
              { label: 'ĐANG HỌC', count: 3, value: 'learning' },
              { label: 'HOÀN THÀNH', count: 1, value: 'completed' },
              { label: 'ĐÃ LƯU', count: 2, value: 'saved' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'relative px-8 py-3 text-sm font-semibold transition-all',
                  statusFilter === tab.value
                    ? 'text-sky-600'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {tab.label} ({tab.count})
                {statusFilter === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-sky-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <Card className="border-l-4 border-l-rose-500 border-y-0 border-r-0 bg-gradient-to-r from-rose-50 to-rose-50/50 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5 text-sm text-rose-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                <Activity className="h-5 w-5 text-rose-600" />
              </div>
              <span className="flex-1 font-medium">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                onClick={() => setError('')}
              >
                Đóng
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <LoadingState />
        ) : filteredLessons.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 shadow-sm">
            <CardContent className="flex flex-col items-center gap-5 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Compass className="h-10 w-10 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-slate-700">Không tìm thấy bài học phù hợp</p>
                <p className="text-sm text-slate-500">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="mt-2"
                onClick={() => {
                  setSearchTerm('');
                  setDifficultyFilter('all');
                  setStatusFilter('all');
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onOpen={() => lesson.slug && navigate(`/lesson/${lesson.slug}`)}
                showBookmark={showBookmarks}
                bookmarked={bookmarked.has(Number(lesson.id))}
                onBookmarkToggle={showBookmarks ? () => toggleBookmark(lesson.id) : undefined}
              />
            ))}
          </div>
        )}

        {/* Stats Section - Bottom Centered */}
        <div className="mx-auto mt-12 flex max-w-5xl items-center justify-center gap-8 rounded-3xl bg-gradient-to-br from-white/95 to-slate-50/95 p-10 shadow-2xl shadow-slate-300/50 backdrop-blur-sm">
          {[
            { label: 'BÀI HỌC', value: formatNumber(stats.totalLessons), icon: Layers, gradient: 'from-sky-500 to-blue-600' },
            { label: 'THỜI LƯỢNG', value: `${formatNumber(stats.totalMinutes)} phút`, icon: Clock, gradient: 'from-emerald-500 to-teal-600' },
            { label: 'LƯỢT HỌC', value: formatNumber(stats.totalLearners), icon: Users, gradient: 'from-amber-500 to-orange-600' },
            { 
              label: 'ĐÁNH GIÁ', 
              value: stats.totalLessons > 0 && stats.totalRating > 0 
                ? `${(stats.totalRating / stats.totalLessons).toFixed(1)}/5` 
                : '0.0/5', 
              icon: Star, 
              gradient: 'from-violet-500 to-purple-600' 
            },
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-5">
                <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg', stat.gradient)}>
                  <StatIcon className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                  <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LessonCard = ({ lesson, onOpen, showBookmark, bookmarked, onBookmarkToggle }) => {
  const isCompleted = lesson.isCompleted;
  const inProgress = !isCompleted && lesson.progress > 0;
  const rawCover = lesson.coverImage || lesson.images?.[0]?.url;
  let imageSrc = fallbackImage(lesson.title || 'Bài học', 'default');
  if (typeof rawCover === 'string') {
    if (rawCover.startsWith('data:')) {
      imageSrc = rawCover;
    } else if (isValidImage(rawCover) && rawCover.startsWith('/')) {
      imageSrc = resolveAssetUrl(rawCover);
    } else if (rawCover.startsWith('http')) {
      imageSrc = rawCover;
    } else if (!rawCover.startsWith('http')) {
      imageSrc = resolveAssetUrl(rawCover);
    }
  }

  return (
    <article
      role={lesson.slug ? 'button' : 'article'}
      tabIndex={lesson.slug ? 0 : undefined}
      onClick={() => lesson.slug && onOpen?.()}
      onKeyDown={(event) => {
        if (!lesson.slug) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen?.();
        }
      }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300',
        lesson.slug ? 'cursor-pointer hover:shadow-xl' : 'cursor-default',
      )}
    >
      {/* Image Section - Fixed Height */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        <img
          src={imageSrc}
          alt={lesson.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage(lesson.title, 'default');
          }}
        />
        
        {/* Status Badge - Top Left */}
        <div className="absolute left-4 top-4">
          <span
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-md',
              isCompleted
                ? 'bg-emerald-500 text-white'
                : inProgress
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-700',
            )}
          >
            {isCompleted ? 'Đang học' : inProgress ? 'Đang học' : 'Mới'}
          </span>
        </div>

        {/* Bookmark Button - Top Right */}
        {showBookmark && onBookmarkToggle && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBookmarkToggle();
            }}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition-all hover:bg-white"
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 fill-sky-600 text-sky-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Progress Bar at Bottom of Image */}
        {!lesson.isSample && lesson.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-blue-600" 
              style={{ width: `${Math.min(Math.max(lesson.progress, 2), 100)}%` }} 
            />
          </div>
        )}
      </div>

      {/* Content Section - Flex with fixed structure */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title - Fixed 2 lines */}
        <h3 className="mb-3 h-14 text-lg font-bold leading-tight text-slate-900 line-clamp-2">
          {lesson.title}
        </h3>

        {/* Description - Fixed 3 lines max */}
        <p className="mb-4 h-[4.5rem] text-sm leading-relaxed text-slate-600 line-clamp-3">
          {lesson.summary}
        </p>

        {/* Stats Row - Fixed height */}
        <div className="mb-4 flex h-5 items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {lesson.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatNumber(lesson.studyCount || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700">{lesson.rating || '—'}</span>
          </span>
        </div>

        {/* Tags - Fixed height and structure */}
        <div className="mb-4 flex h-7 flex-wrap gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {lesson.difficulty}
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {lesson.category}
          </span>
          {(lesson.tags || []).slice(0, 1).map((tag) => (
            <span key={tag} className="rounded-lg bg-slate-50 px-3 py-1 text-xs text-slate-600">
              #{tag}
            </span>
          ))}
          {(lesson.tags || []).length > 1 && (
            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
              +{lesson.tags.length - 1}
            </span>
          )}
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1" />

        {/* Footer - Fixed height and position at bottom */}
        <div className="flex h-16 items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Sparkles className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-slate-800 line-clamp-1">{lesson.instructor}</span>
              <span className="text-xs text-slate-500">Giảng viên</span>
            </div>
          </div>

          {lesson.slug ? (
            <Button 
              size="sm" 
              className="h-9 shrink-0 rounded-full bg-sky-500 px-5 text-xs font-bold text-white shadow-md transition-all hover:bg-sky-600 hover:shadow-lg"
            >
              {inProgress ? 'Tiếp tục' : isCompleted ? 'Ôn tập' : 'Bắt đầu'}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          ) : (
            <span className="text-xs font-medium text-slate-400">Sắp ra mắt</span>
          )}
        </div>
      </div>
    </article>
  );
};

const StatsPill = ({ label, value }) => (
  <div className="group flex min-h-[6rem] flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 px-4 py-5 text-center shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="flex items-baseline justify-center text-2xl font-bold leading-none text-slate-800 transition-colors group-hover:text-slate-900">{value}</p>
  </div>
);

const LoadingState = () => (
  <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="flex h-full animate-pulse flex-col gap-5 overflow-hidden rounded-[2rem] border-0 bg-white p-0 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/50"
      >
        <div className="h-52 w-full bg-gradient-to-br from-slate-200 to-slate-300" />
        <div className="space-y-4 px-7 pb-7">
          <div className="space-y-3">
            <div className="h-3 w-1/3 rounded-full bg-slate-200" />
            <div className="h-5 w-5/6 rounded-full bg-slate-300" />
            <div className="h-3 w-full rounded-full bg-slate-200" />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="h-5 w-20 rounded-full bg-slate-200" />
            <div className="h-5 w-16 rounded-full bg-slate-200" />
            <div className="h-5 w-14 rounded-full bg-slate-200" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-24 rounded-full bg-slate-200" />
            <div className="h-7 w-32 rounded-full bg-slate-200" />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="h-10 w-32 rounded-full bg-slate-200" />
            <div className="flex h-10 w-10 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Lessons;
