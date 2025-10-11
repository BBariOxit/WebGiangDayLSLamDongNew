import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const QuizResults = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result || null;
  const quiz = location.state?.quiz || null;

  if (!result || !quiz) {
    return (
      <Container maxWidth="sm" sx={{ py:6 }}>
        <Paper sx={{ p:3 }}>
          <Typography>Không tìm thấy kết quả.</Typography>
        </Paper>
      </Container>
    );
  }

  const passed = (result.score || 0) >= 70;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p:3, mb:3, textAlign:'center' }}>
        {passed ? <CheckCircle color="success" sx={{ fontSize: 64 }} /> : <Cancel color="error" sx={{ fontSize: 64 }} />}
        <Typography variant="h4" fontWeight="bold" sx={{ mt:1 }}>{result.score}/100</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>Kết quả đã lưu</Typography>
        <Box sx={{ mt:2 }}>
          <Chip label={passed ? 'Đạt' : 'Chưa đạt'} color={passed ? 'success' : 'error'} />
        </Box>
      </Paper>

      <Paper sx={{ p:3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>{quiz.title}</Typography>
        {quiz.questions.map((q) => {
          const res = (result.results || []).find(r => String(r.questionId) === String(q.id));
          const userAnswerIndex = res ? (res.selectedAnswers?.[0]) : undefined;
          const isCorrect = !!res?.isCorrect;
          return (
            <Paper key={q.id} sx={{ p:2, mb:1, borderLeft: `4px solid ${isCorrect ? '#2e7d32' : '#d32f2f'}` }}>
              <Typography variant="subtitle1" fontWeight="bold">{q.text}</Typography>
              <Typography variant="body2" color="text.secondary">Của bạn: {userAnswerIndex !== undefined ? q.options[userAnswerIndex] : 'Chưa trả lời'}</Typography>
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
