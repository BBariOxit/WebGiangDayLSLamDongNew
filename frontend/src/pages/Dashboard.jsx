import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  People as PeopleIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  AccessTime as TimeIcon,
  Star as StarIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const statsCards = [
    {
      title: 'Tổng bài học',
      value: '24',
      change: '+3 tuần này',
      icon: <SchoolIcon />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Quiz đã hoàn thành',
      value: '18',
      change: '+5 tuần này',
      icon: <QuizIcon />,
      color: '#2e7d32',
      bgColor: '#e8f5e8'
    },
    {
      title: 'Học viên hoạt động',
      value: '156',
      change: '+12 tuần này',
      icon: <PeopleIcon />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Điểm trung bình',
      value: '8.5',
      change: '+0.3 từ tháng trước',
      icon: <TrendingUpIcon />,
      color: '#9c27b0',
      bgColor: '#f3e5f5'
    }
  ];

  const recentLessons = [
    {
      id: 1,
      title: 'Lịch sử hình thành Lâm Đồng',
      description: 'Tìm hiểu về quá trình hình thành và phát triển của tỉnh Lâm Đồng từ thời kỳ đầu.',
      image: '/api/placeholder/300/200',
      progress: 75,
      duration: '45 phút',
      difficulty: 'Cơ bản',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Địa lý và khí hậu Đà Lạt',
      description: 'Khám phá đặc điểm địa lý, khí hậu độc đáo của thành phố Đà Lạt và ảnh hưởng đến lịch sử.',
      image: '/api/placeholder/300/200',
      progress: 45,
      duration: '35 phút',
      difficulty: 'Trung bình',
      rating: 4.9
    },
    {
      id: 3,
      title: 'Văn hóa các dân tộc',
      description: 'Tìm hiểu về văn hóa đa dạng của các dân tộc thiểu số tại Lâm Đồng.',
      image: '/api/placeholder/300/200',
      progress: 0,
      duration: '50 phút',
      difficulty: 'Nâng cao',
      rating: 4.7
    }
  ];

  const featuredQuizzes = [
    {
      id: 1,
      title: 'Quiz: Lịch sử Lâm Đồng cơ bản',
      questions: 15,
      timeLimit: '20 phút',
      attempts: 234,
      difficulty: 'Dễ'
    },
    {
      id: 2,
      title: 'Quiz: Địa danh nổi tiếng',
      questions: 20,
      timeLimit: '25 phút',
      attempts: 189,
      difficulty: 'Trung bình'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Cơ bản':
      case 'Dễ':
        return '#4caf50';
      case 'Trung bình':
        return '#ff9800';
      case 'Nâng cao':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Chào mừng đến với Lịch sử Lâm Đồng! 👋
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Khám phá và học hỏi về lịch sử phong phú của tỉnh Lâm Đồng
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ 
            mt: 3, 
            bgcolor: 'white', 
            color: '#1976d2',
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
          startIcon={<PlayIcon />}
        >
          Bắt đầu học ngay
        </Button>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardContent sx={{ p: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      width: 48,
                      height: 48,
                      mr: 2
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight="bold" color={card.color}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main">
                  {card.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Lessons */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Bài học gần đây
                </Typography>
                <Button size="small">Xem tất cả</Button>
              </Box>
              
              <Grid container spacing={2}>
                {recentLessons.map((lesson) => (
                  <Grid item xs={12} key={lesson.id}>
                    <Card
                      sx={{
                        display: 'flex',
                        p: 2,
                        border: '1px solid #f0f0f0',
                        borderRadius: 2,
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 80,
                          bgcolor: '#f5f5f5',
                          borderRadius: 2,
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {lesson.title}
                          </Typography>
                          <IconButton size="small">
                            <BookmarkIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {lesson.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip
                            label={lesson.difficulty}
                            size="small"
                            sx={{
                              bgcolor: getDifficultyColor(lesson.difficulty),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {lesson.duration}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 16, color: '#ffb400' }} />
                            <Typography variant="caption" color="text.secondary">
                              {lesson.rating}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {lesson.progress > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={lesson.progress}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {lesson.progress}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Featured Quizzes */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Quiz nổi bật
              </Typography>
              
              {featuredQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid #f0f0f0',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    {quiz.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={`${quiz.questions} câu`} size="small" variant="outlined" />
                    <Chip label={quiz.timeLimit} size="small" variant="outlined" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {quiz.attempts} lượt thử
                    </Typography>
                    <Chip
                      label={quiz.difficulty}
                      size="small"
                      sx={{
                        bgcolor: getDifficultyColor(quiz.difficulty),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Card>
              ))}
              
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Xem thêm Quiz
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Thao tác nhanh
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ p: 2, borderRadius: 2, flexDirection: 'column', minHeight: 80 }}
                  >
                    <SchoolIcon sx={{ mb: 1 }} />
                    <Typography variant="caption">Bài học mới</Typography>
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, flexDirection: 'column', minHeight: 80 }}
                  >
                    <QuizIcon sx={{ mb: 1 }} />
                    <Typography variant="caption">Làm Quiz</Typography>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;