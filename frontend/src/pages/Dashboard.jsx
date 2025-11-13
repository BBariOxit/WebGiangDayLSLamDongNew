import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  CircleCheckBig,
  Compass,
  Layers,
  PlayCircle,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Users,
  TrendingUp,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import apiClient from '../shared/services/apiClient';
import { resolveAssetUrl } from '../shared/utils/url';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatNumber = (value) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value || 0);

const lessonAccents = [
  {
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.9), rgba(99,102,241,0.85))',
    ring: 'ring-sky-400/30',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.9), rgba(236,72,153,0.85))',
    ring: 'ring-amber-400/30',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(78,205,196,0.85))',
    ring: 'ring-emerald-400/30',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.9), rgba(147,51,234,0.85))',
    ring: 'ring-fuchsia-400/30',
  },
];

const getAccentIndex = (idx) => lessonAccents[idx % lessonAccents.length];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resLessons, resAnalytics] = await Promise.all([
          apiClient.get('/lessons?published=1'),
          apiClient.get('/analytics/public').catch(() => ({ data: { data: null } })),
        ]);

        const payload = Array.isArray(resLessons.data) ? resLessons.data : resLessons.data?.data || [];
        const normalized = (payload || []).map((lesson) => {
          let parsedImages = [];
          if (lesson.images) {
            if (Array.isArray(lesson.images)) parsedImages = lesson.images;
            else if (typeof lesson.images === 'string') {
              try {
                parsedImages = JSON.parse(lesson.images);
              } catch {
                parsedImages = [];
              }
            } else if (typeof lesson.images === 'object') parsedImages = lesson.images;
          }

          if (Array.isArray(parsedImages)) {
            parsedImages = parsedImages.map((img) =>
              typeof img === 'string' ? { url: img, caption: '' } : img,
            );
          }

          const ratingCount = Number(lesson.rating_count ?? lesson.ratingCount ?? 0);
          const hasRatings = ratingCount > 0 && lesson.rating !== null && lesson.rating !== undefined;
          const ratingValue = hasRatings ? Math.round((lesson.rating || 0) * 10) / 10 : 5;

          return {
            id: lesson.lesson_id ?? lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary || '',
            instructor: lesson.instructor || 'Nhóm biên soạn địa phương',
            duration: lesson.duration || '25 phút',
            difficulty: lesson.difficulty || 'Cơ bản',
            category: lesson.category || 'Lịch sử địa phương',
            rating: ratingValue,
            ratingCount,
            studyCount: Number(lesson.study_sessions_count ?? lesson.students_count ?? 0),
            progress: lesson.progress ?? 0,
            images: parsedImages,
            createdAt: lesson.created_at || lesson.createdAt || new Date().toISOString(),
          };
        });

        if (!mounted) return;

        setLessons(normalized);
        const prioritySlugs = ['lien-khuong', 'da-lat', 'djiring', 'di-linh', 'djiring-di-linh'];
        const featuredSorted = [...normalized].sort((a, b) => {
          const ap = prioritySlugs.some((s) => (a.slug || '').includes(s)) ? 1 : 0;
          const bp = prioritySlugs.some((s) => (b.slug || '').includes(s)) ? 1 : 0;
          if (ap !== bp) return bp - ap;
          if ((b.studyCount || 0) !== (a.studyCount || 0)) return (b.studyCount || 0) - (a.studyCount || 0);
          if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setFeatured(featuredSorted.slice(0, Math.min(4, featuredSorted.length)));
        setAnalytics(resAnalytics.data?.data || null);
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const overviewStats = useMemo(() => {
    const globals = analytics?.globals || {};
    const totalLessons = globals.total_lessons ?? lessons.length;
    const totalMinutes =
      globals.total_minutes ??
      lessons.reduce((sum, lesson) => {
        const match = String(lesson.duration).match(/\d+/);
        return sum + (match ? parseInt(match[0], 10) : 0);
      }, 0);

    return [
      {
        label: 'Bài học đã duyệt',
        value: formatNumber(totalLessons),
        delta: '+12% tuần này',
        icon: BookOpen,
        accent: 'rgba(14,165,233,0.45)',
      },
      {
        label: 'Bài kiểm tra',
        value: formatNumber(globals.total_quizzes ?? 48),
        delta: '5 bài mới',
        icon: Layers,
        accent: 'rgba(139,92,246,0.45)',
      },
      {
        label: 'Thời lượng học',
        value: `${formatNumber(totalMinutes)} phút`,
        delta: '+86 phút',
        icon: Timer,
        accent: 'rgba(251,191,36,0.45)',
      },
      {
        label: 'Học viên tham gia',
        value: formatNumber(globals.total_students ?? 1260),
        delta: 'Tỷ lệ hoàn thành 92%',
        icon: Users,
        accent: 'rgba(16,185,129,0.45)',
      },
    ];
  }, [analytics, lessons]);

  const learningMoments = useMemo(() => {
    const base = lessons.slice(0, 6);
    return base.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      subtitle: lesson.summary || lesson.category,
      progress: Math.min(95, 35 + index * 8),
      status: index % 2 === 0 ? 'Đang học' : 'Sẵn sàng',
      duration: lesson.duration,
      rating: lesson.rating,
      slug: lesson.slug,
    }));
  }, [lessons]);

  const activityTimeline = useMemo(() => {
    const events = analytics?.timeline || [];
    if (events.length) return events.slice(0, 5);

    return [
      {
        title: 'GV T. Lan vừa xuất bản bài học mới',
        timestamp: '2 phút trước',
        category: 'Bài học',
        color: 'bg-sky-500',
      },
      {
        title: 'Thêm 34 học sinh tham gia Lịch sử Đà Lạt',
        timestamp: '1 giờ trước',
        category: 'Thống kê',
        color: 'bg-violet-500',
      },
      {
        title: '3 bài kiểm tra được cập nhật nội dung',
        timestamp: 'Hôm qua',
        category: 'Quiz',
        color: 'bg-amber-500',
      },
      {
        title: '8 học sinh hoàn thành bài Địa danh Liên Khương',
        timestamp: '2 ngày trước',
        category: 'Tiến độ',
        color: 'bg-emerald-500',
      },
    ];
  }, [analytics]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-20 pt-8 text-slate-900">
      {/* Enhanced background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-sky-400/10 blur-[120px] animate-pulse" />
        <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-violet-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-400/8 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),transparent_50%)]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header Section */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <BadgeCheck className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-slate-600">
                Không gian học tập của bạn
              </span>
            </div>
            
            <div>
              <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                Chào {user?.name || 'bạn'}! 👋
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Tổng hợp tiến trình, bài học nổi bật và hoạt động mới nhất trong hệ thống.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              className="group relative overflow-hidden border-slate-300 bg-white font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
              onClick={() => navigate('/lessons')}
            >
              <span className="relative z-10">Khám phá bài học</span>
            </Button>
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
              onClick={() => navigate('/quizzes')}
            >
              <span className="relative z-10 flex items-center gap-2">
                Tạo bài kiểm tra
                <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-8 overflow-hidden border border-rose-300 bg-gradient-to-r from-rose-50 via-rose-50/50 to-transparent backdrop-blur-sm shadow-sm">
            <CardContent className="py-4">
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Enhanced */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((stat, index) => (
            <Card
              key={stat.label}
              className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeIn 0.6s ease-out forwards',
              }}
            >
              {/* Gradient overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${stat.accent}, transparent)`,
                  filter: 'blur(40px)',
                }}
              />
              
              {/* Content */}
              <CardContent className="relative z-10 space-y-5 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-slate-50 group-hover:ring-slate-300">
                    <stat.icon className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-600">{stat.delta}</p>
                </div>
              </CardContent>
              
              {/* Shine effect on hover */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-10"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
                }}
              />
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-5">
          {/* Learning Progress Section */}
          <Card className="border border-slate-200 bg-white/80 backdrop-blur-md shadow-lg lg:col-span-3">
            <CardHeader className="space-y-4 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Radar học tập cá nhân
                  </p>
                  <CardTitle className="text-2xl font-bold text-slate-900">Tiến độ tuần này</CardTitle>
                </div>
              </div>
              
              <p className="text-sm leading-relaxed text-slate-600">
                Theo dõi mức độ tương tác của bạn với hệ thống bài học và kiểm tra.
              </p>
              
              <Tabs defaultValue="lessons" className="mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
                  <TabsTrigger 
                    value="lessons"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Bài học
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quizzes"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Bài kiểm tra
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    Thành tích
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="lessons" className="mt-6 space-y-3">
                  {learningMoments.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        animation: 'slideInLeft 0.4s ease-out forwards',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-sky-500/30">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {lesson.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {lesson.duration} • {lesson.status}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="relative h-2.5 w-32 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 transition-all duration-500"
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                        <span className="min-w-[3rem] text-right text-sm font-bold text-slate-700">
                          {lesson.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="quizzes" className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 backdrop-blur-sm transition-all hover:border-emerald-300 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">Điểm trung bình</p>
                    </div>
                    <p className="mt-4 text-4xl font-bold text-slate-900">8.7<span className="text-2xl text-slate-500">/10</span></p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +0.4 so với tuần trước
                    </p>
                  </div>
                  
                  <div className="group rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-5 backdrop-blur-sm transition-all hover:border-sky-300 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
                        <CircleCheckBig className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-sky-700">Bài hoàn thành</p>
                    </div>
                    <p className="mt-4 text-4xl font-bold text-slate-900">12</p>
                    <p className="mt-2 text-xs font-semibold text-sky-600">
                      Tỷ lệ hoàn thành 95%
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { 
                      label: 'Chuỗi học tập', 
                      value: '14 ngày', 
                      gradient: 'from-amber-500 to-orange-600',
                      icon: Zap,
                      shadow: 'shadow-amber-500/30'
                    },
                    { 
                      label: 'Huy hiệu chuyên sâu', 
                      value: '06', 
                      gradient: 'from-emerald-500 to-teal-600',
                      icon: Award,
                      shadow: 'shadow-emerald-500/30'
                    },
                    { 
                      label: 'Điểm kinh nghiệm', 
                      value: '2.450', 
                      gradient: 'from-sky-500 to-blue-600',
                      icon: Trophy,
                      shadow: 'shadow-sky-500/30'
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 text-center backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                    >
                      <div className={cn(
                        "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                        item.gradient,
                        item.shadow
                      )}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Activity Timeline Section */}
          <Card className="border border-slate-200 bg-white/80 backdrop-blur-md shadow-lg lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <Activity className="h-4.5 w-4.5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Hoạt động mới</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => navigate('/analytics')}
              >
                Xem tất cả
              </Button>
            </CardHeader>
            
            <CardContent className="pt-5">
              <ScrollArea className="h-[480px] pr-3">
                <div className="space-y-4">
                  {activityTimeline.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex gap-4">
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center pt-1">
                        <div className={cn(
                          'h-3 w-3 rounded-full ring-4 ring-white',
                          item.color || 'bg-slate-400'
                        )} />
                        {index !== activityTimeline.length - 1 && (
                          <div className="mt-2 h-full w-0.5 flex-1 bg-gradient-to-b from-slate-300 to-transparent" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="group rounded-2xl border border-slate-200 bg-white p-4 backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <p className="flex-1 text-sm font-semibold leading-relaxed text-slate-900">
                              {item.title}
                            </p>
                            <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                              {item.timestamp}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="border-slate-300 bg-slate-50 text-slate-700 backdrop-blur-sm"
                            >
                              {item.category}
                            </Badge>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Activity className="h-3 w-3" />
                              Hệ thống ghi nhận
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Featured Lessons & Checklist Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Featured Lessons */}
          <Card className="border border-slate-200 bg-white/80 backdrop-blur-md shadow-lg lg:col-span-2">
            <CardHeader className="space-y-3 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                  <Star className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Bài học nổi bật tuần này
                  </p>
                  <CardTitle className="text-xl font-bold text-slate-900">Gợi ý dành cho bạn</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              {featured.map((lesson, index) => {
                const accent = getAccentIndex(index);
                const backgroundImage = lesson.images?.[0]?.url
                  ? `linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.75)), url('${resolveAssetUrl(
                      lesson.images[0].url,
                    )}')`
                  : accent.gradient;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigate(`/lesson/${lesson.slug}`)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
                      accent.ring,
                    )}
                    style={{
                      backgroundImage,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderColor: 'rgba(255,255,255,0.15)',
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                    
                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className="border-white/30 bg-white/15 font-semibold text-white backdrop-blur-md">
                          {lesson.category}
                        </Badge>
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/25 px-2.5 py-1 text-xs font-bold text-amber-100 backdrop-blur-sm ring-1 ring-amber-400/40">
                          <Star className="h-3 w-3 fill-current" />
                          {lesson.rating}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold leading-snug text-white group-hover:text-sky-200 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-100 line-clamp-2">
                          {lesson.summary}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/15 pt-3 text-xs font-medium text-slate-100">
                        <span className="flex items-center gap-1.5">
                          <Timer className="h-3.5 w-3.5" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {lesson.studyCount} lượt
                        </span>
                      </div>
                    </div>
                    
                    {/* Hover indicator */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 transition-all duration-300 group-hover:w-full" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Daily Checklist */}
          <Card className="border border-slate-200 bg-white/80 backdrop-blur-md shadow-lg">
            <CardHeader className="space-y-3 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
                  <Compass className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Lộ trình tiếp theo
                  </p>
                  <CardTitle className="text-xl font-bold text-slate-900">Checklist hôm nay</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 pt-5">
              {[
                {
                  label: 'Đọc bài Lang Biang nền bản địa',
                  icon: BookOpen,
                  tag: 'Bài học',
                  gradient: 'from-sky-500 to-blue-600',
                  bgColor: 'bg-sky-50',
                  textColor: 'text-sky-700',
                  borderColor: 'border-sky-200',
                  shadowColor: 'shadow-sky-500/30',
                },
                {
                  label: 'Hoàn thành Quiz Liên Khương',
                  icon: PlayCircle,
                  tag: 'Bài kiểm tra',
                  gradient: 'from-violet-500 to-purple-600',
                  bgColor: 'bg-violet-50',
                  textColor: 'text-violet-700',
                  borderColor: 'border-violet-200',
                  shadowColor: 'shadow-violet-500/30',
                },
                {
                  label: 'Đánh dấu ghi chú cá nhân',
                  icon: CircleCheckBig,
                  tag: 'Ghi chú',
                  gradient: 'from-amber-500 to-orange-600',
                  bgColor: 'bg-amber-50',
                  textColor: 'text-amber-700',
                  borderColor: 'border-amber-200',
                  shadowColor: 'shadow-amber-500/30',
                },
                {
                  label: 'Theo dõi thống kê lớp',
                  icon: Trophy,
                  tag: 'Thống kê',
                  gradient: 'from-emerald-500 to-teal-600',
                  bgColor: 'bg-emerald-50',
                  textColor: 'text-emerald-700',
                  borderColor: 'border-emerald-200',
                  shadowColor: 'shadow-emerald-500/30',
                },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className={cn(
                    'group flex items-center justify-between rounded-2xl border bg-white p-4 backdrop-blur-sm transition-all hover:bg-slate-50 hover:shadow-md',
                    item.borderColor
                  )}
                  style={{
                    animationDelay: `${idx * 100}ms`,
                    animation: 'fadeIn 0.5s ease-out forwards',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110',
                      item.gradient,
                      item.shadowColor
                    )}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 leading-snug">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {item.tag}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      'text-xs font-semibold transition-all hover:bg-slate-100',
                      item.textColor
                    )}
                    onClick={() => navigate('/lessons')}
                  >
                    Bắt đầu
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
