import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
  Container,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha
} from '@mui/material';
import { lessonsData } from '../data/lessonsData';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  People as PeopleIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Explore as ExploreIcon,
  LocalLibrary as LibraryIcon,
  Landscape as LandscapeIcon,
  Group as GroupIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Calculate real stats from lessons data
  const totalLessons = lessonsData.length;
  const totalStudents = lessonsData.reduce((sum, lesson) => sum + lesson.students, 0);
  const completedLessons = lessonsData.filter(lesson => lesson.progress === 100).length;
  const averageRating = Math.round(lessonsData.reduce((sum, lesson) => sum + lesson.rating, 0) / lessonsData.length * 10) / 10;

  const stats = [
    { 
      label: 'Tổng bài học', 
      value: totalLessons, 
      icon: SchoolIcon, 
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
    },
    { 
      label: 'Học viên', 
      value: totalStudents, 
      icon: PeopleIcon, 
      color: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)'
    },
    { 
      label: 'Hoàn thành', 
      value: completedLessons, 
      icon: TrendingUpIcon, 
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)'
    },
    { 
      label: 'Đánh giá TB', 
      value: averageRating, 
      icon: StarIcon, 
      color: '#e91e63',
      gradient: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % lessonsData.length);
    }, 4000);

    // Animate stats
    const timer = setTimeout(() => {
      stats.forEach((stat, index) => {
        const increment = stat.value / 30;
        let current = 0;
        const statInterval = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            current = stat.value;
            clearInterval(statInterval);
          }
          setAnimatedStats(prev => {
            const newStats = [...prev];
            newStats[index] = Math.round(current);
            return newStats;
          });
        }, 50);
      });
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleLessonClick = (lessonSlug) => {
    navigate(`/lesson/${lessonSlug}`);
  };

  const handleViewAllLessons = () => {
    navigate('/lessons');
  };

  const handleQuizClick = (lessonId) => {
    navigate(`/quiz/${lessonId}`);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % lessonsData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + lessonsData.length) % lessonsData.length);
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Vui lòng đăng nhập để truy cập Dashboard
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Fade in={isVisible} timeout={800}>
        <Box>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Chào mừng, {user.name}! 👋
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Hãy tiếp tục hành trình khám phá lịch sử Lâm Đồng của bạn
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in={isVisible} timeout={800 + index * 200}>
                  <Card
                    sx={{
                      background: stat.gradient,
                      color: 'white',
                      height: '100%',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                            {animatedStats[index] || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            width: 56,
                            height: 56
                          }}
                        >
                          <stat.icon sx={{ fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Hero Section */}
          <Paper
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
              color: 'white',
              p: 4,
              mb: 4,
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                🌄 Khám phá Lâm Đồng
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Hành trình tìm hiểu lịch sử, văn hóa và con người nơi đây
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleViewAllLessons}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    }
                  }}
                  startIcon={<ExploreIcon />}
                >
                  Khám phá bài học
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/lessons')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                  startIcon={<ArrowForwardIcon />}
                >
                  Xem tất cả
                </Button>
              </Box>
            </Box>
            
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                zIndex: 1
              }}
            />
          </Paper>

          {/* Lesson Carousel */}
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                📚 Bài học nổi bật
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={prevSlide}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton 
                  onClick={nextSlide}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
              <Slide direction="left" in={true} key={currentSlide}>
                <Box>
                  {lessonsData.map((lesson, index) => (
                    <Box
                      key={lesson.id}
                      sx={{
                        display: index === currentSlide ? 'block' : 'none',
                      }}
                    >
                      <Card
                        sx={{
                          display: 'flex',
                          minHeight: 300,
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                          }
                        }}
                        onClick={() => handleLessonClick(lesson.slug)}
                      >
                        <Box
                          sx={{
                            width: 300,
                            background: `linear-gradient(135deg, ${
                              lesson.id % 3 === 0 ? '#ff6b6b, #ee5a52' : 
                              lesson.id % 3 === 1 ? '#4ecdc4, #44a08d' : 
                              '#45b7d1, #96c93d'
                            })`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            position: 'relative'
                          }}
                        >
                          <Typography variant="h4" fontWeight="bold" textAlign="center">
                            {lesson.category}
                          </Typography>
                          
                          {lesson.progress > 0 && (
                            <LinearProgress
                              variant="determinate"
                              value={lesson.progress}
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 6,
                                '& .MuiLinearProgress-bar': {
                                  background: 'rgba(255,255,255,0.8)'
                                }
                              }}
                            />
                          )}
                        </Box>
                        
                        <CardContent sx={{ flex: 1, p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                              {lesson.title}
                            </Typography>
                            <Chip
                              label={lesson.difficulty}
                              color={
                                lesson.difficulty === 'Cơ bản' ? 'success' :
                                lesson.difficulty === 'Trung bình' ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body1" color="text.secondary" paragraph>
                            {lesson.summary}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {lesson.duration}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {lesson.students} học viên
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StarIcon fontSize="small" sx={{ color: '#ffb400' }} />
                              <Typography variant="caption">
                                {lesson.rating}/5
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              startIcon={<PlayIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLessonClick(lesson.slug);
                              }}
                              sx={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #1976d2, #2196f3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                                }
                              }}
                            >
                              {lesson.progress > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                            </Button>
                            
                            {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
                              <Button
                                variant="outlined"
                                startIcon={<QuizIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuizClick(lesson.id);
                                }}
                                sx={{ minWidth: 120 }}
                              >
                                Quiz
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Slide>
            </Box>
            
            {/* Carousel Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
              {lessonsData.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: index === currentSlide ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.2)'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Hoạt động gần đây
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {lessonsData.slice(0, 3).map((lesson) => (
                    <Box
                      key={lesson.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'grey.100'
                        }
                      }}
                      onClick={() => handleLessonClick(lesson.slug)}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="medium">
                          {lesson.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cập nhật {lesson.duration}
                        </Typography>
                      </Box>
                      <Chip
                        label={lesson.progress > 0 ? `${lesson.progress}%` : 'Chưa bắt đầu'}
                        size="small"
                        color={lesson.progress > 0 ? 'primary' : 'default'}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Thống kê của bạn
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {Math.round((completedLessons / totalLessons) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ hoàn thành
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={(completedLessons / totalLessons) * 100}
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                      }
                    }}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Bài học yêu thích
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['Lịch sử', 'Văn hóa', 'Địa lý'].map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default Dashboard;