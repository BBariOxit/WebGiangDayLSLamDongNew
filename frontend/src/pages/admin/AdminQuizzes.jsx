import React from 'react';
import { quizService } from '../../shared/services/quizService';
import { Container, Typography, Paper, Grid } from '@mui/material';

const AdminQuizzes = () => {
  const [stats, setStats] = React.useState(quizService.getGlobalStats());

  // Refresh stats periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(quizService.getGlobalStats());
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Thống kê Quiz (Admin)
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              {stats.totalQuizzes}
            </Typography>
            <Typography variant="h6">
              Tổng số Quiz
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              {stats.totalAttempts}
            </Typography>
            <Typography variant="h6">
              Tổng lượt làm
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              {stats.averageScore}%
            </Typography>
            <Typography variant="h6">
              Điểm trung bình
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
              {stats.totalQuizzes > 0 ? Math.round(stats.totalAttempts / stats.totalQuizzes) : 0}
            </Typography>
            <Typography variant="h6">
              Trung bình lượt/Quiz
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Thông tin chi tiết
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Tổng số quiz:</strong> {stats.totalQuizzes} quiz
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Tổng lượt làm bài:</strong> {stats.totalAttempts} lượt
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Điểm trung bình:</strong> {stats.averageScore}%
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Cập nhật lần cuối:</strong> {new Date().toLocaleString('vi-VN')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminQuizzes;
