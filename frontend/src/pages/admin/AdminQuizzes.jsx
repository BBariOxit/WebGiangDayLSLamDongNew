import React from 'react';
import { quizService } from '../../services/quizService';
import { Box, Container, Typography, Grid, Paper, Chip } from '@mui/material';

const AdminQuizzes = () => {
  const stats = quizService.getGlobalStats();
  const quizzes = quizService.getQuizzes();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Quản trị Quiz (Admin)</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p:3, textAlign:'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.totalQuizzes}</Typography>
            <Typography>Tổng Quiz</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p:3, textAlign:'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">{stats.totalAttempts}</Typography>
            <Typography>Tổng lượt làm</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p:3, textAlign:'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">{stats.averageScore}%</Typography>
            <Typography>Điểm trung bình</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {quizzes.map(q => (
          <Grid item xs={12} key={q.id}>
            <Paper sx={{ p:2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{q.title}</Typography>
                <Typography variant="body2" color="text.secondary">{q.description}</Typography>
              </Box>
              <Box sx={{ display:'flex', gap:1 }}>
                <Chip label={q.difficulty} />
                <Chip label={`${q.questions?.length||0} câu`}/>
                <Chip label={`${q.timeLimit} phút`}/>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminQuizzes;
