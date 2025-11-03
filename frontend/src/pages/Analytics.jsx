import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Chip, Paper, LinearProgress, Button, Tooltip, Avatar } from '@mui/material';
import { TrendingUp, School, Quiz, Star, Refresh, People, EmojiEvents, MenuBook, Alarm } from '@mui/icons-material';
import apiClient from '../shared/services/apiClient';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <Card sx={{ background: gradient, color: 'white' }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p:1, borderRadius: 2 }}>
          <Icon />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>{label}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [globals, setGlobals] = React.useState(null);
  const [trend, setTrend] = React.useState([]);
  const [breakdown, setBreakdown] = React.useState([]);
  const [mine, setMine] = React.useState(null);
  const [recent, setRecent] = React.useState([]);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  const fetchData = React.useCallback(async (mountedRef) => {
    try {
      setLoading(true);
      const pub = await apiClient.get('/analytics/public');
      const me = await apiClient.get('/analytics/me').catch(()=>({ data: { data: null }}));
      if (mountedRef.current === false) return;
      setGlobals(pub.data?.data?.globals || null);
      setTrend(pub.data?.data?.trend || []);
      setBreakdown(pub.data?.data?.breakdown || []);
      setMine(me.data?.data?.mine || null);
      setRecent(me.data?.data?.recent || []);
      setLastUpdated(new Date());
    } catch (e) {
      if (mountedRef.current !== false) setError(e.message || 'Lỗi tải thống kê');
    } finally {
      if (mountedRef.current !== false) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const mountedRef = { current: true };
    fetchData(mountedRef);
    const id = setInterval(() => fetchData(mountedRef), 60000); // auto refresh every 60s
    return () => { mountedRef.current = false; clearInterval(id); };
  }, [fetchData]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py:4 }}>
        <Paper sx={{ p:3 }}>
          <Typography>Đang tải thống kê...</Typography>
          <LinearProgress sx={{ mt:2 }} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py:4 }}>
        <Paper sx={{ p:3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  const cards = globals ? [
    globals.total_lessons != null && { icon: School, label: 'Tổng bài học', value: globals.total_lessons, gradient: 'linear-gradient(135deg,#1976d2,#42a5f5)' },
    globals.total_study_sessions != null && { icon: People, label: 'Tổng lượt học', value: globals.total_study_sessions, gradient: 'linear-gradient(135deg,#4caf50,#81c784)' },
    globals.total_quizzes != null && { icon: Quiz, label: 'Tổng quiz', value: globals.total_quizzes, gradient: 'linear-gradient(135deg,#f57c00,#ffb74d)' },
    globals.total_attempts != null && { icon: TrendingUp, label: 'Lượt làm bài', value: globals.total_attempts, gradient: 'linear-gradient(135deg,#7b1fa2,#ba68c8)' },
    { icon: Star, label: 'Điểm đánh giá TB', value: Number(globals?.avg_rating || 0).toFixed(1), gradient: 'linear-gradient(135deg,#9c27b0,#e91e63)' }
  ].filter(Boolean) : [];

  const personalCards = mine ? [
    { icon: MenuBook, label: 'Bài học đã bắt đầu', value: mine.lessons_started, gradient: 'linear-gradient(135deg,#42a5f5,#478ed1)' },
    { icon: Alarm, label: 'Bài học đang học', value: mine.lessons_in_progress, gradient: 'linear-gradient(135deg,#66bb6a,#43a047)' },
    { icon: EmojiEvents, label: 'Bài học hoàn thành', value: mine.lessons_completed, gradient: 'linear-gradient(135deg,#ffb74d,#ef6c00)' },
    { icon: Quiz, label: 'Lượt làm quiz', value: mine.attempts, gradient: 'linear-gradient(135deg,#ab47bc,#8e24aa)' },
    { icon: TrendingUp, label: 'Quiz khác nhau', value: mine.unique_quizzes, gradient: 'linear-gradient(135deg,#26a69a,#00796b)' },
    { icon: Star, label: 'Điểm trung bình', value: `${mine.avg_score}%`, gradient: 'linear-gradient(135deg,#f06292,#ec407a)' },
    { icon: EmojiEvents, label: 'Điểm cao nhất', value: `${mine.best_score}%`, gradient: 'linear-gradient(135deg,#ff8f00,#f4511e)' },
    { icon: TrendingUp, label: 'Lượt đạt ≥70%', value: mine.passed_quizzes, gradient: 'linear-gradient(135deg,#4db6ac,#00897b)' }
  ] : [];

  const teacherCards = mine && mine.quizzes_created > 0 ? [
    { icon: Quiz, label: 'Quiz tôi đã tạo', value: mine.quizzes_created, gradient: 'linear-gradient(135deg,#5c6bc0,#3949ab)' },
    { icon: People, label: 'Lượt làm bài trên quiz', value: mine.attempts_on_my_quizzes, gradient: 'linear-gradient(135deg,#8bc34a,#558b2f)' },
    { icon: School, label: 'Học sinh tham gia', value: mine.unique_learners_on_my_quizzes, gradient: 'linear-gradient(135deg,#26c6da,#0097a7)' },
    { icon: Star, label: 'Điểm TB quiz của tôi', value: `${mine.avg_score_on_my_quizzes}%`, gradient: 'linear-gradient(135deg,#ba68c8,#8e24aa)' }
  ] : [];

  const formatAttemptDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString('vi-VN'); } catch { return iso; }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
        <Typography variant="h4" fontWeight="bold">Thống kê</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}</Typography>
          )}
          <Tooltip title="Tải lại">
            <span>
              <Button variant="outlined" size="small" onClick={() => fetchData({ current: true })} startIcon={<Refresh />}>Refresh</Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt:1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Xu hướng làm bài (14 ngày)</Typography>
            <Box sx={{ display:'flex', gap:1, alignItems:'flex-end', height: 160 }}>
              {trend.map((t, idx) => (
                <Box key={idx} sx={{ flex:1 }}>
                  <Box sx={{ height: `${Math.min(100, Number(t.attempts||0)*10)}px`, bgcolor: 'primary.main', borderRadius: 1 }} />
                  <Typography variant="caption" sx={{ display:'block', mt:0.5, textAlign:'center' }}>{(t.day||'').slice(5)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Bài học theo độ khó</Typography>
            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
              {breakdown.map((b, idx) => (
                <Chip key={idx} label={`${b.difficulty || 'Khác'}: ${b.total}`} color={idx%2? 'primary':'secondary'} />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {mine && (
        <Grid container spacing={3} sx={{ mt:1 }}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight:'bold', mb:2 }}>Thống kê của tôi</Typography>
          </Grid>
          {personalCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={`mine-${idx}`}>
              <Card sx={{ background: card.gradient, color: 'white', height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <card.icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">{card.value}</Typography>
                      <Typography variant="body2" sx={{ opacity:0.85 }}>{card.label}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {teacherCards.length > 0 && (
            <>
              <Grid item xs={12} sx={{ mt:2 }}>
                <Typography variant="h6" fontWeight="bold">Hoạt động giảng dạy</Typography>
              </Grid>
              {teacherCards.map((card, idx) => (
                <Grid item xs={12} sm={6} md={3} key={`teach-${idx}`}>
                  <Card sx={{ background: card.gradient, color: 'white', height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <card.icon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight="bold">{card.value}</Typography>
                          <Typography variant="body2" sx={{ opacity:0.85 }}>{card.label}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </>
          )}

          <Grid item xs={12} md={6} sx={{ mt:2 }}>
            <Paper sx={{ p:3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Lần làm gần đây</Typography>
              {recent.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Chưa có dữ liệu</Typography>
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                  {recent.map((r) => (
                    <Box key={r.attempt_id} sx={{ border:'1px solid', borderColor:'divider', borderRadius:2, p:2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {r.quiz_title || `Quiz #${r.quiz_id}`}
                        {r.lesson_title && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml:0.5 }}>
                            ({r.lesson_title})
                          </Typography>
                        )}
                      </Typography>
                      <Box sx={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:0.5, mt:0.5 }}>
                        <Typography variant="body2">Điểm: <b>{r.score}%</b></Typography>
                        {typeof r.duration_seconds === 'number' && r.duration_seconds > 0 && (
                          <Typography variant="body2" color="text.secondary">Thời gian: {Math.ceil(r.duration_seconds/60)} phút</Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">{formatAttemptDate(r.created_at)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} sx={{ mt:2 }}>
            <Paper sx={{ p:3, height:'100%' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Tổng kết</Typography>
              <Typography variant="body2" sx={{ mb:1 }}>Tiến độ trung bình: <b>{mine.avg_progress}%</b></Typography>
              <Typography variant="body2" sx={{ mb:1 }}>Tổng điểm tích luỹ: <b>{mine.total_score}</b></Typography>
              {mine.last_active_at && (
                <Typography variant="caption" color="text.secondary">Hoạt động gần nhất: {formatAttemptDate(mine.last_active_at)}</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Analytics;
