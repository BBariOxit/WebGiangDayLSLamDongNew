import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Chip, Paper, LinearProgress, Button, Tooltip } from '@mui/material';
import { TrendingUp, School, Quiz, Star, Refresh } from '@mui/icons-material';
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
    // Removed total students card as requested
    globals.total_quizzes != null && { icon: Quiz, label: 'Tổng quiz', value: globals.total_quizzes, gradient: 'linear-gradient(135deg,#f57c00,#ffb74d)' },
    globals.total_attempts != null && { icon: TrendingUp, label: 'Lượt làm bài', value: globals.total_attempts, gradient: 'linear-gradient(135deg,#7b1fa2,#ba68c8)' },
    { icon: Star, label: 'Điểm đánh giá TB', value: Number(globals?.avg_rating || 0).toFixed(1), gradient: 'linear-gradient(135deg,#9c27b0,#e91e63)' }
  ].filter(Boolean) : [];

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
          <Grid item xs={12} md={6}>
            <Paper sx={{ p:3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb:1 }}>Thống kê của tôi</Typography>
              <Typography variant="body2">Bài học đã bắt đầu: <b>{mine.lessons_started}</b></Typography>
              <Typography variant="body2">Bài học đã hoàn thành: <b>{mine.lessons_completed}</b></Typography>
              <Typography variant="body2">Số lần làm quiz: <b>{mine.attempts}</b></Typography>
              <Typography variant="body2">Điểm trung bình: <b>{mine.avg_score}%</b></Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p:3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Lần làm gần đây</Typography>
              {recent.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Chưa có dữ liệu</Typography>
              ) : recent.map((r) => (
                <Box key={r.attempt_id} sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                  <Typography variant="body2">Quiz #{r.quiz_id}</Typography>
                  <Typography variant="body2">{r.score}%</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(r.created_at).toLocaleString('vi-VN')}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Analytics;
