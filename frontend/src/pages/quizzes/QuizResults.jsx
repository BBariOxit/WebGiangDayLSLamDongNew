import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../shared/services/quizService';
import { Box, Container, Paper, Typography, Button, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const QuizResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const attempts = quizService.getAttempts();
  const attempt = attempts.find(a => String(a.id) === String(attemptId));
  const quiz = attempt ? quizService.getQuizById(attempt.quizId) : null;

  if (!attempt || !quiz) {
    return (
      <Container maxWidth="sm" sx={{ py:6 }}>
        <Paper sx={{ p:3 }}>
          <Typography>Không tìm thấy kết quả.</Typography>
        </Paper>
      </Container>
    );
  }

  const passed = attempt.score >= 70;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p:3, mb:3, textAlign:'center' }}>
        {passed ? <CheckCircle color="success" sx={{ fontSize: 64 }} /> : <Cancel color="error" sx={{ fontSize: 64 }} />}
        <Typography variant="h4" fontWeight="bold" sx={{ mt:1 }}>{attempt.score}/100</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>Thời gian: {Math.round(attempt.durationSeconds/60)} phút</Typography>
        <Box sx={{ mt:2 }}>
          <Chip label={passed ? 'Đạt' : 'Chưa đạt'} color={passed ? 'success' : 'error'} />
        </Box>
      </Paper>

      <Paper sx={{ p:3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>{quiz.title}</Typography>
        {quiz.questions.map((q) => {
          const userAnswer = attempt.answers[q.id];
          const isCorrect = userAnswer === q.correctIndex;
          return (
            <Paper key={q.id} sx={{ p:2, mb:1, borderLeft: `4px solid ${isCorrect ? '#2e7d32' : '#d32f2f'}` }}>
              <Typography variant="subtitle1" fontWeight="bold">{q.text}</Typography>
              <Typography variant="body2" color="text.secondary">Của bạn: {userAnswer !== undefined ? q.options[userAnswer] : 'Chưa trả lời'}</Typography>
              <Typography variant="body2" color="success.main">Đúng: {q.options[q.correctIndex]}</Typography>
            </Paper>
          );
        })}
      </Paper>

      <Box sx={{ display:'flex', gap:2, justifyContent:'center', mt:3 }}>
        <Button variant="outlined" onClick={()=>navigate('/quizzes')}>Về danh sách Quiz</Button>
        <Button variant="contained" onClick={()=>navigate(`/quizzes/take/${quiz.id}`)}>Làm lại</Button>
      </Box>
    </Container>
  );
};

export default QuizResults;
