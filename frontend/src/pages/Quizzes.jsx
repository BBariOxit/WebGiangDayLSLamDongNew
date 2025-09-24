import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  IconButton,
  Avatar,
  Pagination,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Quiz as QuizIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  HelpOutline as HelpIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const Quizzes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const quizzes = [
    {
      id: 1,
      title: 'Quiz: Lịch sử hình thành Lâm Đồng',
      description: 'Kiểm tra kiến thức về quá trình hình thành và phát triển của tỉnh Lâm Đồng.',
      questions: 15,
      timeLimit: 20,
      difficulty: 'Cơ bản',
      category: 'Lịch sử địa phương',
      attempts: 234,
      bestScore: 85,
      averageScore: 72,
      status: 'Đã làm',
      lastAttempt: '2 ngày trước',
      tags: ['Lịch sử', 'Lâm Đồng']
    },
    {
      id: 2,
      title: 'Quiz: Địa lý và khí hậu Đà Lạt',
      description: 'Đánh giá hiểu biết về đặc điểm địa lý và khí hậu của thành phố Đà Lạt.',
      questions: 20,
      timeLimit: 25,
      difficulty: 'Trung bình',
      category: 'Địa lý',
      attempts: 189,
      bestScore: 0,
      averageScore: 68,
      status: 'Chưa làm',
      lastAttempt: null,
      tags: ['Địa lý', 'Khí hậu']
    },
    {
      id: 3,
      title: 'Quiz: Văn hóa dân tộc thiểu số',
      description: 'Tìm hiểu về văn hóa đặc sắc của các dân tộc thiểu số tại Lâm Đồng.',
      questions: 18,
      timeLimit: 22,
      difficulty: 'Nâng cao',
      category: 'Văn hóa',
      attempts: 156,
      bestScore: 92,
      averageScore: 75,
      status: 'Đã làm',
      lastAttempt: '1 tuần trước',
      tags: ['Văn hóa', 'Dân tộc']
    },
    {
      id: 4,
      title: 'Quiz: Kinh tế Lâm Đồng',
      description: 'Đánh giá kiến thức về sự phát triển kinh tế của Lâm Đồng qua các thời kỳ.',
      questions: 16,
      timeLimit: 18,
      difficulty: 'Trung bình',
      category: 'Kinh tế',
      attempts: 198,
      bestScore: 0,
      averageScore: 71,
      status: 'Chưa làm',
      lastAttempt: null,
      tags: ['Kinh tế', 'Phát triển']
    },
    {
      id: 5,
      title: 'Quiz: Du lịch và di sản',
      description: 'Kiểm tra hiểu biết về các điểm du lịch và di sản văn hóa của Lâm Đồng.',
      questions: 12,
      timeLimit: 15,
      difficulty: 'Cơ bản',
      category: 'Du lịch',
      attempts: 267,
      bestScore: 100,
      averageScore: 88,
      status: 'Hoàn hảo',
      lastAttempt: '3 ngày trước',
      tags: ['Du lịch', 'Di sản']
    },
    {
      id: 6,
      title: 'Quiz: Lịch sử kháng chiến',
      description: 'Đánh giá kiến thức về lịch sử kháng chiến chống thực dân và đế quốc tại Lâm Đồng.',
      questions: 25,
      timeLimit: 30,
      difficulty: 'Nâng cao',
      category: 'Lịch sử chiến tranh',
      attempts: 143,
      bestScore: 0,
      averageScore: 65,
      status: 'Chưa làm',
      lastAttempt: null,
      tags: ['Kháng chiến', 'Lịch sử']
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Cơ bản':
        return '#4caf50';
      case 'Trung bình':
        return '#ff9800';
      case 'Nâng cao':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn hảo':
        return '#4caf50';
      case 'Đã làm':
        return '#2196f3';
      case 'Chưa làm':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !filterDifficulty || quiz.difficulty === filterDifficulty;
    const matchesStatus = !filterStatus || quiz.status === filterStatus;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // Stats calculations
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter(q => q.status !== 'Chưa làm').length;
  const averageScore = Math.round(
    quizzes.filter(q => q.bestScore > 0).reduce((sum, q) => sum + q.bestScore, 0) / 
    quizzes.filter(q => q.bestScore > 0).length
  ) || 0;
  const perfectScores = quizzes.filter(q => q.status === 'Hoàn hảo').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quiz & Bài tập
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kiểm tra và củng cố kiến thức thông qua các bài quiz tương tác
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <QuizIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#1976d2">
                {totalQuizzes}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Tổng số Quiz
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrophyIcon sx={{ color: '#2e7d32', mr: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                {completedQuizzes}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Đã hoàn thành
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingIcon sx={{ color: '#ed6c02', mr: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                {averageScore}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Điểm trung bình
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrophyIcon sx={{ color: '#9c27b0', mr: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                {perfectScores}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Điểm hoàn hảo
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Độ khó</InputLabel>
              <Select
                value={filterDifficulty}
                label="Độ khó"
                onChange={(e) => setFilterDifficulty(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                <MenuItem value="Trung bình">Trung bình</MenuItem>
                <MenuItem value="Nâng cao">Nâng cao</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Chưa làm">Chưa làm</MenuItem>
                <MenuItem value="Đã làm">Đã làm</MenuItem>
                <MenuItem value="Hoàn hảo">Hoàn hảo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Quizzes Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredQuizzes.map((quiz) => (
          <Grid item xs={12} sm={6} lg={4} key={quiz.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 100,
                  position: 'relative'
                }}
              >
                <QuizIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.8 }} />
                
                <Chip
                  label={quiz.difficulty}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: getDifficultyColor(quiz.difficulty),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {quiz.title}
                </Typography>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, height: 40, overflow: 'hidden' }}
                >
                  {quiz.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HelpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {quiz.questions} câu hỏi
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {quiz.timeLimit} phút
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {quiz.attempts} lượt thử
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrophyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        TB: {quiz.averageScore}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {quiz.bestScore > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Điểm cao nhất
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {quiz.bestScore}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={quiz.bestScore}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: quiz.bestScore === 100 ? '#4caf50' : '#2196f3'
                        }
                      }}
                    />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                  {quiz.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={quiz.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(quiz.status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                  
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {quiz.status === 'Chưa làm' ? 'Bắt đầu' : 'Làm lại'}
                  </Button>
                </Box>
                
                {quiz.lastAttempt && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Lần cuối: {quiz.lastAttempt}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={2} color="primary" size="large" />
      </Box>
    </Box>
  );
};

export default Quizzes;