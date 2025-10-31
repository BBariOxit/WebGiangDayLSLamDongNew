import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Chip, LinearProgress, Divider, Card, CardContent } from '@mui/material';
import { CheckCircle, Cancel, EmojiEvents, TrendingUp, Refresh, Home } from '@mui/icons-material';

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
  const score = result.score || 0;
  const correctCount = (result.results || []).filter(r => r.isCorrect).length;
  const totalCount = quiz.questions.length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Hero Result Card with gradient and animation */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 3, 
          textAlign: 'center',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: passed 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          boxShadow: passed 
            ? '0 12px 40px rgba(102, 126, 234, 0.4)' 
            : '0 12px 40px rgba(245, 87, 108, 0.4)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'pulse 3s ease-in-out infinite'
          },
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.1)', opacity: 0.3 }
          }
        }}
      >
        {passed ? (
          <Box>
            <EmojiEvents sx={{ fontSize: 80, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Xuất sắc!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Bạn đã vượt qua bài quiz
            </Typography>
          </Box>
        ) : (
          <Box>
            <TrendingUp sx={{ fontSize: 80, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
              Tiếp tục cố gắng!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Bạn có thể làm tốt hơn nữa
            </Typography>
          </Box>
        )}
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h1" fontWeight="bold" sx={{ fontSize: '4rem', mb: 2 }}>
            {score}<Typography component="span" variant="h3" sx={{ opacity: 0.8 }}>/100</Typography>
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<CheckCircle />} 
              label={`${correctCount}/${totalCount} câu đúng`} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 600,
                fontSize: 16,
                height: 36,
                backdropFilter: 'blur(10px)'
              }} 
            />
            <Chip 
              label={passed ? 'Đạt yêu cầu' : 'Chưa đạt'} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 700,
                fontSize: 16,
                height: 36,
                backdropFilter: 'blur(10px)'
              }} 
            />
          </Box>
        </Box>
      </Paper>

      {/* Score breakdown */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>📊 Phân tích kết quả</Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Tiến độ hoàn thành</Typography>
            <Typography variant="body2" fontWeight="bold">{Math.round((correctCount / totalCount) * 100)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(correctCount / totalCount) * 100} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                background: passed 
                  ? 'linear-gradient(90deg, #667eea, #764ba2)' 
                  : 'linear-gradient(90deg, #f093fb, #f5576c)',
                borderRadius: 5
              }
            }} 
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Card sx={{ bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">{correctCount}</Typography>
              <Typography variant="body2" color="text.secondary">Câu đúng</Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#ffebee', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">{totalCount - correctCount}</Typography>
              <Typography variant="body2" color="text.secondary">Câu sai</Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">{totalCount}</Typography>
              <Typography variant="body2" color="text.secondary">Tổng câu</Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Detailed answers */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>📝 Chi tiết câu trả lời</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {quiz.title}
        </Typography>

        {quiz.questions.map((q, idx) => {
          const res = (result.results || []).find(r => String(r.questionId) === String(q.id));
          const userAnswerIndex = res ? (res.selectedAnswers?.[0]) : undefined;
          const isCorrect = !!res?.isCorrect;
          return (
            <Paper 
              key={q.id} 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                borderLeft: `4px solid ${isCorrect ? '#2e7d32' : '#d32f2f'}`,
                bgcolor: isCorrect ? '#f1f8f4' : '#fff1f1',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ 
                  minWidth: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: isCorrect ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {idx + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{q.text}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {isCorrect ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                    <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'} fontWeight="600">
                      {isCorrect ? 'Chính xác' : 'Chưa chính xác'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Câu trả lời của bạn:</strong> {userAnswerIndex !== undefined ? q.options[userAnswerIndex] : 'Chưa trả lời'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          startIcon={<Home />}
          onClick={() => navigate('/quizzes')}
          sx={{ minWidth: 160 }}
        >
          Về danh sách
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Refresh />}
          onClick={() => navigate(`/quizzes/take/${quiz.id}`)}
          sx={{ 
            minWidth: 160,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3, #653a8b)'
            }
          }}
        >
          Làm lại
        </Button>
      </Box>
    </Container>
  );
};

export default QuizResults;
