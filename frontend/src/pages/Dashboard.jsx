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
import { useAuth } from '@features/auth/hooks/useAuth';
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
  const totalVideoMinutes = lessonsData.reduce((sum, lesson) => sum + parseInt(lesson.duration), 0);
  const totalQuizzes = lessonsData.reduce((sum, lesson) => sum + (lesson.quizQuestions ? lesson.quizQuestions.length : 5), 0);
  const averageRating = Math.round(lessonsData.reduce((sum, lesson) => sum + lesson.rating, 0) / lessonsData.length * 10) / 10;

  const finalStats = [totalLessons, totalVideoMinutes, totalQuizzes, averageRating * 10];

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      finalStats.forEach((finalValue, index) => {
        let current = 0;
        const increment = finalValue / 50;
        const counter = setInterval(() => {
          current += increment;
          if (current >= finalValue) {
            current = finalValue;
            clearInterval(counter);
          }
          setAnimatedStats(prev => {
            const newStats = [...prev];
            newStats[index] = Math.floor(current);
            return newStats;
          });
        }, 30);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % lessonsData.length);
    }, 5000);

    return () => clearInterval(slideTimer);
  }, []);

  const statsCards = [
    {
      title: 'Tổng số bài học',
      value: animatedStats[0],
      icon: SchoolIcon,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
    },
    {
      title: 'Phút video học',
      value: `${animatedStats[1]} phút`,
      icon: TimeIcon,
      color: '#388e3c',
      bgColor: '#e8f5e8',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)'
    },
    {
      title: 'Câu hỏi Quiz',
      value: `${animatedStats[2]} câu`,
      icon: QuizIcon,
      color: '#f57c00',
      bgColor: '#fff3e0',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)'
    },
    {
      title: 'Đánh giá trung bình',
      value: `${(animatedStats[3]/10).toFixed(1)}/5⭐`,
      icon: StarIcon,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
      gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)'
    }
  ];

  const handleLessonClick = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % lessonsData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + lessonsData.length) % lessonsData.length);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Hero Section */}
      <Fade in={isVisible} timeout={1000}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1e88e5 50%, #42a5f5 100%)',
            color: 'white',
            p: 6,
            mb: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              animation: 'float 20s ease-in-out infinite'
            }
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}>
                  Chào mừng đến với
                </Typography>
                <Typography variant="h3" component="h2" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  color: '#ffeb3b',
                  mb: 3,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.5rem', md: '2.5rem' }
                }}>
                  Hệ thống Giảng dạy Lịch sử Lâm Đồng
                </Typography>
                <Typography variant="h5" sx={{ 
                  mb: 4,
                  opacity: 0.95,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  Khám phá lịch sử phong phú của tỉnh Lâm Đồng - nơi giao thoa văn hóa 
                  của ba vùng đất Lâm Đồng, Bình Thuận và Đắk Nông
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/lessons')}
                    sx={{
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                      color: 'white',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ee5a52, #e74c3c)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={<ExploreIcon />}
                  >
                    Khám phá ngay
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/quizzes')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 'bold',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: alpha('#ffffff', 0.1),
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={<QuizIcon />}
                  >
                    Bài kiểm tra
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <LandscapeIcon sx={{ 
                    fontSize: { xs: 200, md: 300 }, 
                    opacity: 0.3,
                    animation: 'pulse 2s ease-in-out infinite'
                  }} />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      </Fade>

      {/* Stats Cards */}
      <Grow in={isVisible} timeout={1500}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: stat.gradient,
                  color: 'white',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 12px 30px ${alpha(stat.color, 0.3)}`
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha('#ffffff', 0.2),
                        color: 'white',
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      <stat.icon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" component="div" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        fontSize: { xs: '1.5rem', md: '2rem' }
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        opacity: 0.9,
                        fontSize: '0.9rem'
                      }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grow>

      {/* Featured Lessons Carousel */}
      <Slide direction="up" in={isVisible} timeout={2000}>
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🌟 Bài học nổi bật
            </Typography>
            <Box>
              <IconButton onClick={prevSlide} sx={{ mr: 1 }}>
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton onClick={nextSlide}>
                <NavigateNextIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
            {lessonsData.map((lesson, index) => (
              <Fade key={lesson.id} in={index === currentSlide} timeout={1000}>
                <Card
                  sx={{
                    display: index === currentSlide ? 'block' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <Grid container>
                    <Grid item xs={12} md={8}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={lesson.category}
                            sx={{
                              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                              color: 'white',
                              fontWeight: 'bold',
                              mr: 2
                            }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ color: '#ffb400', mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {lesson.rating}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="h4" component="h3" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          color: '#1976d2',
                          mb: 2,
                          fontSize: { xs: '1.5rem', md: '2rem' }
                        }}>
                          {lesson.title}
                        </Typography>
                        
                        <Typography variant="body1" color="text.secondary" sx={{ 
                          mb: 3,
                          lineHeight: 1.7
                        }}>
                          {lesson.summary}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            <PersonIcon />
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            {lesson.instructor}
                          </Typography>
                          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            {lesson.duration}
                          </Typography>
                          <GroupIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {lesson.students} học sinh
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={lesson.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha('#1976d2', 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                              borderRadius: 4
                            },
                            mb: 2
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Tiến độ: {lesson.progress}%
                        </Typography>
                      </CardContent>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          height: '100%',
                          minHeight: 300,
                          background: `linear-gradient(135deg, ${alpha('#1976d2', 0.8)}, ${alpha('#42a5f5', 0.8)}), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="%23ffffff" fill-opacity="0.1" points="0,1000 1000,0 1000,1000"/></svg>')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                            animation: 'shimmer 3s ease-in-out infinite'
                          }
                        }}
                      >
                        <LibraryIcon sx={{ fontSize: 120, color: 'white', opacity: 0.8 }} />
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Fade>
            ))}
          </Box>
        </Paper>
      </Slide>

      {/* Quick Actions */}
      <Fade in={isVisible} timeout={2500}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
              onClick={() => navigate('/lessons')}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Tất cả bài học
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Khám phá toàn bộ kho tàng kiến thức lịch sử Lâm Đồng
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1)
                    }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Xem tất cả
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(240, 147, 251, 0.4)'
                }
              }}
              onClick={() => navigate('/quizzes')}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <QuizIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Bài kiểm tra
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Thử thách kiến thức với các bài kiểm tra đa dạng
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1)
                    }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Làm bài
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 25px rgba(79, 172, 254, 0.4)'
                }
              }}
              onClick={() => navigate('/analytics')}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Thống kê
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Theo dõi tiến độ học tập và thành tích cá nhân
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1)
                    }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Xem báo cáo
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Box>
  );
};

export default Dashboard;