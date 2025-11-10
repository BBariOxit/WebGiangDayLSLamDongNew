import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
  Users,
  Waypoints
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import apiClient from '../shared/services/apiClient';
import { useAuth } from '../features/auth/hooks/useAuth';
import { cn } from '../lib/utils';

const numberFormatter = new Intl.NumberFormat('vi-VN');
const percentFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
const shortDateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });
const longDateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
});

const TrendChart = ({ data = [], gradientId, color = '#0ea5e9', height = 260 }) => (
  <div className="h-[260px] w-full">
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#1f2937' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#1f2937' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <RechartTooltip
          contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}
          labelFormatter={(value) => `Ngày ${value}`}
          formatter={(value) => numberFormatter.format(value)}
        />
        <Area type="monotone" dataKey="attempts" stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const DistributionBar = ({ items = [] }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
            style={{ width: `${Math.max(5, Math.min(item.percentage || 0, 100))}%` }}
          />
        </div>
        <div className="w-32 text-right text-sm font-medium text-slate-600">
          {item.label}
          <span className="ml-1 font-semibold text-slate-900">{item.value}</span>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
    {message}
  </div>
);

const LoadingState = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 h-4 w-1/3 rounded-full bg-slate-200" />
        <div className="h-8 w-1/2 rounded-full bg-slate-200" />
      </div>
    ))}
  </div>
);

const formatNumber = (value) => numberFormatter.format(Number(value || 0));
const formatPercent = (value) => `${percentFormatter.format(Number(value || 0))}%`;
const formatScore = (value) => `${percentFormatter.format(Number(value || 0))}%`;
const formatTimestamp = (value) => {
  if (!value) return '—';
  try {
    return longDateTimeFormatter.format(new Date(value));
  } catch (e) {
    return value;
  }
};

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = user.role === 'admin' ? '/analytics/public' : '/analytics/me';
      const response = await apiClient.get(endpoint);
      setData(response?.data?.data || null);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Không thể tải thống kê';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, refreshToken]);

  const role = user?.role || 'student';

  const onRefresh = () => setRefreshToken((prev) => prev + 1);

  const roleCountsMap = useMemo(() => {
    if (!data?.roleCounts) return {};
    return Object.fromEntries((data.roleCounts || []).map((item) => [item.role, Number(item.total || 0)]));
  }, [data]);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-12">
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Yêu cầu đăng nhập</CardTitle>
            <CardDescription>Vui lòng đăng nhập để xem thống kê học tập và hệ thống.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge variant="outline" className="rounded-full bg-slate-50 capitalize text-slate-600">
              {role === 'admin' ? 'Quản trị hệ thống' : role === 'teacher' ? 'Giảng viên' : 'Học viên'}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Cập nhật thời gian thực</span>
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {role === 'admin' ? 'Thống kê toàn hệ thống' : 'Bảng điều khiển thống kê'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {role === 'admin'
              ? 'Theo dõi hiệu suất học tập, số lượng người dùng và mức độ tương tác trên toàn bộ nền tảng.'
              : role === 'teacher'
                ? 'Nắm bắt tình hình học tập của học viên trên các bài học và bài kiểm tra bạn phụ trách.'
                : 'Theo dõi tiến độ học tập cá nhân, điểm số và hoạt động gần đây của bạn.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onRefresh} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border border-rose-100 bg-rose-50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold text-rose-600">Không thể tải dữ liệu</CardTitle>
            <CardDescription className="text-sm text-rose-500">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {role === 'admin' && data && (
            <AdminDashboard data={data} roleCountsMap={roleCountsMap} />
          )}

          {role === 'teacher' && data && data.role === 'teacher' && (
            <TeacherDashboard data={data} />
          )}

          {role !== 'admin' && data && data.role !== 'teacher' && (
            <StudentDashboard data={data} />
          )}
        </>
      )}
    </div>
  );
};

const AdminDashboard = ({ data, roleCountsMap }) => {
  const globals = data?.globals || {};
  const trend = data?.trend || [];
  const breakdown = data?.breakdown || [];
  const roleDistribution = useMemo(() => (
    Object.entries(roleCountsMap || {}).map(([role, total]) => ({
      role: role === 'admin' ? 'Quản trị' : role === 'teacher' ? 'Giảng viên' : 'Học viên',
      total: Number(total)
    }))
  ), [roleCountsMap]);
  const normalizedTrend = useMemo(() => (
    (trend || []).map((item) => ({
      ...item,
      attempts: Number(item.attempts || 0)
    }))
  ), [trend]);

  const adminCards = [
    {
      title: 'Tổng số bài học',
      value: formatNumber(globals.total_lessons),
      icon: BookOpen,
      gradient: 'from-sky-500 to-blue-600'
    },
    {
      title: 'Bài kiểm tra',
      value: formatNumber(globals.total_quizzes),
      icon: Target,
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Lượt học tập',
      value: formatNumber(globals.total_study_sessions),
      icon: Waypoints,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Lượt làm bài',
      value: formatNumber(globals.total_attempts),
      icon: BarChart3,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Điểm đánh giá TB',
      value: Number(globals.avg_rating || 0).toFixed(1),
      icon: Sparkles,
      gradient: 'from-fuchsia-500 to-rose-500'
    },
    {
      title: 'Tổng tài khoản',
      value: formatNumber(Object.values(roleCountsMap || {}).reduce((sum, v) => sum + Number(v || 0), 0)),
      icon: Users,
      gradient: 'from-slate-500 to-slate-700'
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminCards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Xu hướng lượt làm bài</CardTitle>
              <CardDescription>Thống kê 14 ngày gần nhất trên toàn hệ thống</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-full">{trend.length} ngày</Badge>
          </CardHeader>
          <CardContent>
            {normalizedTrend.length === 0 ? <EmptyState message="Chưa có dữ liệu xu hướng." /> : (
              <TrendChart data={normalizedTrend} gradientId="admin-trend" color="#0ea5e9" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Phân bổ người dùng</CardTitle>
            <CardDescription>Theo vai trò trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            {roleDistribution.length === 0 ? (
              <EmptyState message="Chưa có dữ liệu người dùng." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                  <RechartTooltip
                    contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }}
                    formatter={(value) => formatNumber(value)}
                  />
                  <Bar dataKey="total" radius={[10, 10, 10, 10]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Bài học theo độ khó</CardTitle>
            <CardDescription>Số lượng bài học đã phát hành</CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full">{breakdown.length} nhóm</Badge>
        </CardHeader>
        <CardContent>
          {breakdown.length === 0 ? (
            <EmptyState message="Chưa có dữ liệu bài học." />
          ) : (
            <div className="flex flex-wrap gap-3">
              {breakdown.map((item) => (
                <div key={item.difficulty || 'Khác'} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                  <span className="font-medium text-slate-700">{item.difficulty || 'Khác'}</span>
                  <Badge variant="secondary" className="rounded-full text-xs">{formatNumber(item.total)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AdminStatCard = ({ title, value, icon: Icon, gradient }) => (
  <Card className={cn('overflow-hidden border-0 text-white shadow-lg shadow-slate-200/40', `bg-gradient-to-br ${gradient}`)}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
      <Icon className="h-5 w-5 text-white/90" />
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
    </CardContent>
  </Card>
);

const TeacherDashboard = ({ data }) => {
  const overview = data?.overview || {};
  const trend = data?.trend || [];
  const lessonBreakdown = data?.lessonBreakdown || [];
  const topQuizzes = data?.topQuizzes || [];
  const recentAttempts = data?.recentAttempts || [];
  const normalizedTrend = useMemo(() => (
    (trend || []).map((item) => ({
      ...item,
      attempts: Number(item.attempts || 0)
    }))
  ), [trend]);

  const completionRate = useMemo(() => {
    const learners = Number(overview.unique_learners || 0);
    const completions = Number(overview.total_completions || 0);
    if (!learners) return 0;
    return Math.min(100, Math.round((completions / learners) * 100));
  }, [overview]);

  const overviewCards = [
    {
      title: 'Bài học đã tạo',
      value: formatNumber(overview.lessons_created),
      icon: BookOpen
    },
    {
      title: 'Bài học đã xuất bản',
      value: formatNumber(overview.lessons_published),
      icon: ArrowUpRight
    },
    {
      title: 'Quiz đã tạo',
      value: formatNumber(overview.quizzes_created),
      icon: Target
    },
    {
      title: 'Học viên tham gia',
      value: formatNumber(overview.unique_learners),
      icon: Users
    }
  ];

  const secondaryCards = [
    {
      title: 'Lượt làm bài trên nội dung của bạn',
      value: formatNumber(overview.attempts_on_my_quizzes),
      icon: BarChart3
    },
    {
      title: 'Học viên làm quiz',
      value: formatNumber(overview.unique_quiz_learners),
      icon: GraduationCap
    },
    {
      title: 'Điểm trung bình quiz',
      value: formatScore(overview.avg_score_on_my_quizzes),
      icon: Sparkles
    },
    {
      title: 'Điểm cao nhất',
      value: formatScore(overview.best_quiz_score),
      icon: CheckCircle2
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.title} className="border border-slate-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {secondaryCards.map((card) => (
          <Card key={card.title} className="border border-slate-100 bg-slate-50/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold">Xu hướng tương tác</CardTitle>
            <CardDescription>Lượt làm bài trên các quiz của bạn (14 ngày)</CardDescription>
          </CardHeader>
          <CardContent>
            {normalizedTrend.length === 0 ? (
              <EmptyState message="Chưa có học viên làm bài trong 14 ngày qua." />
            ) : (
              <TrendChart data={normalizedTrend} gradientId="teacher-trend" color="#6366f1" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tỉ lệ hoàn thành</CardTitle>
            <CardDescription>Học viên đã hoàn tất bài học bạn phụ trách</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-semibold text-slate-900">{formatPercent(completionRate)}</p>
                <p className="mt-1 text-sm text-slate-500">{formatNumber(overview.total_completions)} lượt hoàn thành</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <CheckCircle2 className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
            <p className="text-xs text-slate-400">Tỉ lệ được tính dựa trên số học viên có mặt trong các bài học của bạn.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold">Bài học theo độ khó</CardTitle>
            <CardDescription>Phân bố nội dung bạn đã tạo</CardDescription>
          </CardHeader>
          <CardContent>
            {lessonBreakdown.length === 0 ? (
              <EmptyState message="Chưa có bài học nào." />
            ) : (
              <div className="flex flex-wrap gap-3">
                {lessonBreakdown.map((item) => (
                  <div key={item.difficulty || 'Khác'} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                    <span className="font-medium text-slate-700">{item.difficulty || 'Khác'}</span>
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">{formatNumber(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quiz nổi bật</CardTitle>
            <CardDescription>Dựa trên số lượt làm bài</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topQuizzes.length === 0 ? (
              <EmptyState message="Chưa có quiz nào được làm." />
            ) : (
              <div className="space-y-3">
                {topQuizzes.map((quiz) => (
                  <div key={quiz.quiz_id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{quiz.title}</p>
                      <p className="text-xs text-slate-400">{formatNumber(quiz.attempts)} lượt • Điểm TB {formatScore(quiz.avg_score)}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-600">
                      <Brain className="mr-1 h-3.5 w-3.5" />
                      Quiz
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-lg font-semibold">Lượt làm bài gần đây</CardTitle>
          <CardDescription>Các học viên vừa hoàn thành bài kiểm tra của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAttempts.length === 0 ? (
            <EmptyState message="Chưa có dữ liệu." />
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div key={attempt.attempt_id} className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{attempt.quiz_title}</p>
                      <p className="text-xs text-slate-400">{attempt.full_name || 'Học viên ẩn danh'}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs">
                      Điểm {formatScore(attempt.score)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>Thời gian: {attempt.duration_seconds ? `${Math.ceil(Number(attempt.duration_seconds) / 60)} phút` : '—'}</span>
                    <span>{formatTimestamp(attempt.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StudentDashboard = ({ data }) => {
  const stats = data?.stats || {};
  const trend = data?.trend || [];
  const recentAttempts = data?.recentAttempts || [];
  const normalizedTrend = useMemo(() => (
    (trend || []).map((item) => ({
      ...item,
      attempts: Number(item.attempts || 0)
    }))
  ), [trend]);

  const quizPassed = Number(stats.passed_quizzes || 0);
  const quizTotal = Number(stats.attempts || 0);
  const quizFailed = Math.max(quizTotal - quizPassed, 0);

  const lessonDistribution = [
    { label: 'Đang học', value: formatNumber(stats.lessons_in_progress || 0), percentage: stats.lessons_started ? Math.round(((stats.lessons_in_progress || 0) / stats.lessons_started) * 100) : (stats.lessons_in_progress ? 100 : 0) },
    { label: 'Đã hoàn thành', value: formatNumber(stats.lessons_completed || 0), percentage: stats.lessons_started ? Math.round(((stats.lessons_completed || 0) / stats.lessons_started) * 100) : (stats.lessons_completed ? 100 : 0) },
    { label: 'Chưa bắt đầu', value: formatNumber(Math.max((stats.lessons_started || 0) - (stats.lessons_in_progress || 0) - (stats.lessons_completed || 0), 0)), percentage: 0 }
  ];

  const quizDistribution = [
    { label: 'Vượt 70%', value: formatNumber(quizPassed), percentage: quizTotal ? Math.round((quizPassed / quizTotal) * 100) : 0 },
    { label: 'Cần luyện thêm', value: formatNumber(quizFailed), percentage: quizTotal ? Math.round((quizFailed / quizTotal) * 100) : 0 }
  ];

  const spotlightCards = [
    {
      title: 'Bài học đã hoàn thành',
      value: formatNumber(stats.lessons_completed),
      icon: CheckCircle2
    },
    {
      title: 'Bài học đang theo học',
      value: formatNumber(stats.lessons_in_progress),
      icon: BookOpen
    },
    {
      title: 'Lượt làm quiz',
      value: formatNumber(stats.attempts),
      icon: Target
    },
    {
      title: 'Điểm trung bình',
      value: formatScore(stats.avg_score),
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {spotlightCards.map((card) => (
          <Card key={card.title} className="border border-slate-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Xu hướng luyện tập</CardTitle>
            <CardDescription>Lượt làm quiz của bạn trong 14 ngày gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {normalizedTrend.length === 0 ? (
              <EmptyState message="Bạn chưa có lượt làm bài nào gần đây." />
            ) : (
              <TrendChart data={normalizedTrend} gradientId="student-trend" color="#22c55e" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tiến độ tổng quan</CardTitle>
            <CardDescription>Tỷ lệ hoàn thành và điểm số tổng hợp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Tiến độ trung bình</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{formatPercent(stats.avg_progress)}</p>
              <p className="mt-1 text-xs text-slate-500">Tổng điểm tích luỹ: <span className="font-semibold text-slate-700">{formatNumber(stats.total_score)}</span></p>
            </div>

            <DistributionBar items={lessonDistribution} />

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="text-xs font-medium uppercase text-indigo-500">Điểm cao nhất</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600">{formatScore(stats.best_score)}</p>
              <p className="mt-1 text-xs text-indigo-500">{formatNumber(quizPassed)} lượt đạt trên 70%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Kết quả quiz</CardTitle>
            <CardDescription>Phân loại theo ngưỡng đạt 70%</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionBar items={quizDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Hoạt động gần đây</CardTitle>
            <CardDescription>Những lượt làm bài gần nhất của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttempts.length === 0 ? (
              <EmptyState message="Bạn chưa có lượt làm bài nào." />
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.attempt_id} className="flex flex-col gap-1 rounded-3xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{attempt.quiz_title || `Quiz #${attempt.quiz_id}`}</p>
                      <Badge variant="outline" className="rounded-full text-xs">{formatScore(attempt.score)}</Badge>
                    </div>
                    {attempt.lesson_title && (
                      <p className="text-xs text-slate-400">Bài học: {attempt.lesson_title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {attempt.duration_seconds ? (
                        <span>Thời gian: {Math.ceil(Number(attempt.duration_seconds) / 60)} phút</span>
                      ) : null}
                      <span>{formatTimestamp(attempt.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
