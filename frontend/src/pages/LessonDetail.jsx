import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Chip,
  Avatar,
  Button,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Rating,
  Divider,
  Alert,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  School,
  Schedule,
  TrendingUp,
  Star,
  People,
  ArrowBack,
  BookmarkBorder,
  Bookmark,
  Share,
  Print,
  Quiz,
  CheckCircle,
  NavigateNext,
  Home,
  KeyboardArrowUp
} from '@mui/icons-material';
import axios from 'axios';
import quizService from '../shared/services/quizService';
import { resolveAssetUrl } from '../shared/utils/url';
import { quizApi } from '../api/quizApi';
import { useAuth } from '@features/auth/hooks/useAuth';
import CommentSection from '../shared/components/CommentSection';
import { fetchRatingSummary } from '../api/lessonEngagementApi.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const LessonDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, updateProgress } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quizDialog, setQuizDialog] = useState(false);
  const [lessonQuiz, setLessonQuiz] = useState(null);
  const [quizzesForLesson, setQuizzesForLesson] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ avg_rating: 0, rating_count: 0 });

  useEffect(() => {
    // Fetch lesson from API by slug
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/lessons/slug/${slug}`);
        console.log('Lesson raw response:', response.data);
        const lessonData = response.data && response.data.data ? response.data.data : response.data;
        if (!lessonData || !lessonData.lesson_id) {
          console.warn('Lesson payload invalid:', lessonData);
          setLesson(null);
          return;
        }
        
        // Parse images safely and normalize to [{ url, caption }]
        let parsedImages = [];
        if (lessonData.images) {
          if (Array.isArray(lessonData.images)) {
            parsedImages = lessonData.images;
          } else if (typeof lessonData.images === 'string') {
            try {
              parsedImages = JSON.parse(lessonData.images);
            } catch (e) {
              console.warn('Failed to parse images', e);
            }
          } else if (typeof lessonData.images === 'object') {
            parsedImages = lessonData.images;
          }
        }
        if (Array.isArray(parsedImages)) {
          parsedImages = parsedImages.map(img => (typeof img === 'string' ? { url: img, caption: '' } : img));
        }
        
        const mappedLesson = {
          id: lessonData.lesson_id,
          title: lessonData.title,
          slug: lessonData.slug,
          summary: lessonData.summary || '',
          description: lessonData.content_html || '',
          instructor: lessonData.instructor || 'Nhóm biên soạn địa phương',
          duration: lessonData.duration || '25 phút',
          difficulty: lessonData.difficulty || 'Cơ bản',
          rating: parseFloat(lessonData.rating) || 0,
          students: lessonData.students_count || 0,
          progress: 0,
          category: lessonData.category || 'Lịch sử địa phương',
          tags: Array.isArray(lessonData.tags) ? lessonData.tags : ['Lịch sử'],
          status: lessonData.status || 'Chưa học',
          images: parsedImages,
          sections: Array.isArray(lessonData.sections) ? lessonData.sections : []
        };
        
        setLesson(mappedLesson);
        setIsBookmarked(Math.random() > 0.5);
        setCompleted(mappedLesson.progress === 100);
        
        // Load quizzes for this lesson (list)
        try {
          const list = await quizApi.listPublicQuizzes({ lessonId: mappedLesson.id });
          setQuizzesForLesson(list);
          if (list && list.length > 0) {
            setSelectedQuizId(String(list[0].quiz_id));
            // also fetch the first quiz's question count via by-id endpoint for dialog info
            try {
              const bundle = await quizApi.getQuizQuestionsByQuizId(list[0].quiz_id);
              setLessonQuiz({ id: list[0].quiz_id, questions: bundle?.questions || [], timeLimit: list[0].time_limit, title: list[0].title });
            } catch {}
          } else {
            // Fallback legacy single-quiz-by-lesson
            const q = await quizService.getQuizByLessonId(mappedLesson.id);
            setLessonQuiz(q || null);
            if (q?.id) setSelectedQuizId(String(q.id));
          }
        } catch (e) {
          console.warn('Load quizzes list failed', e);
          const q = await quizService.getQuizByLessonId(mappedLesson.id);
          setLessonQuiz(q || null);
          if (q?.id) setSelectedQuizId(String(q.id));
        }

        try {
          const rs = await fetchRatingSummary(mappedLesson.id);
          setRatingSummary(rs);
        } catch (e) { console.warn('Rating summary load failed', e); }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setLesson(null);
        setLessonQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [slug]);

  useEffect(() => {
    // Theo dõi scroll để cập nhật progress
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      setReadingProgress(Math.min(scrolled, 100));
      setShowScrollTop(winScroll > 300);
      
      // Auto save progress
      if (scrolled > 50 && !completed && lesson) {
        const newProgress = Math.min(Math.round(scrolled), 100);
        updateProgress(lesson?.id, newProgress);
        if (newProgress === 100) {
          setCompleted(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson, completed, updateProgress]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson.title,
          text: lesson.summary,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizStart = () => {
    setQuizDialog(true);
  };

  const handleQuizClose = () => {
    setQuizDialog(false);
  };

  const handleQuizNavigate = () => {
    if (!selectedQuizId) {
      alert('Bài học này chưa có quiz.');
      setQuizDialog(false);
      return;
    }
    // Navigate to standardized take quiz route
    navigate(`/quizzes/take/${selectedQuizId}`);
    setQuizDialog(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Đang tải bài học...</Typography>
        </Box>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy bài học. <Link href="/" underline="hover">Quay về trang chủ</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={readingProgress}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #2196f3, #21cbf3)'
          }
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4, mt: 1 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Home sx={{ mr: 0.5, fontSize: 20 }} />
            Trang chủ
          </Link>
          <Link color="inherit" href="/lessons" sx={{ textDecoration: 'none' }}>
            Bài học
          </Link>
          <Typography color="text.primary">{lesson.title}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ mb: 2 }}
            >
              Quay lại
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu"}>
                <IconButton onClick={handleBookmark} color={isBookmarked ? "primary" : "default"}>
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Chia sẻ">
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title="In bài học">
                <IconButton onClick={handlePrint}>
                  <Print />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1976d2, #2196f3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            {lesson.title}
          </Typography>

          <Typography variant="h6" color="text.secondary" paragraph>
            {lesson.summary}
          </Typography>

          {/* Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {lesson.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>

          {/* Lesson Meta */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <School fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">Giảng viên</Typography>
                <Typography variant="body1" fontWeight="medium">{lesson.instructor}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                <Schedule fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">Thời lượng</Typography>
                <Typography variant="body1" fontWeight="medium">{lesson.duration}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                <TrendingUp fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">Độ khó</Typography>
                <Typography variant="body1" fontWeight="medium">{lesson.difficulty}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                <People fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">Học viên</Typography>
                <Typography variant="body1" fontWeight="medium">{lesson.students}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Rating & Progress */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Default to 5.0 when no one has rated yet */}
              <Rating value={(Number(ratingSummary.rating_count||0) === 0) ? 5 : (ratingSummary.avg_rating ? Number(ratingSummary.avg_rating) : 0)} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({(Number(ratingSummary.rating_count||0) === 0 ? 5 : (ratingSummary.avg_rating || 0))}/5.0 · {ratingSummary.rating_count || 0} đánh giá)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {completed && (
                <Chip 
                  icon={<CheckCircle />} 
                  label="Đã hoàn thành" 
                  color="success" 
                  variant="filled"
                />
              )}
              {(quizzesForLesson?.length > 0 || lessonQuiz) ? (
                <Button
                  variant="contained"
                  startIcon={<Quiz />}
                  onClick={handleQuizStart}
                  sx={{
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ee5a52, #e04848)'
                    }
                  }}
                >
                  Làm bài quiz
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Quiz />}
                  disabled
                  sx={{ opacity: 0.6 }}
                >
                  Chưa có quiz
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Lesson Content */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          {/* Render structured sections if present; fallback to legacy contentHtml */}
          {lesson.sections && lesson.sections.length > 0 ? (
            <Box>
              {lesson.sections.map((s, idx) => (
                <Box key={idx} sx={{ mb:3 }}>
                  {s.type === 'heading' && (
                    <Typography variant="h4" sx={{ fontWeight:'bold', color:'primary.main', mt:2 }}>
                      {s.title}
                    </Typography>
                  )}
                  {s.type === 'text' && (
                    <Box dangerouslySetInnerHTML={{ __html: s.content_html || s.contentHtml || '' }} />
                  )}
                  {s.type === 'image_gallery' && Array.isArray(s.data?.images) && s.data.images.length > 0 && (
                    <Grid container spacing={2}>
                      {s.data.images.map((img, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                          <Card>
                            <Box component="img" src={resolveAssetUrl(img.url)} alt={img.caption||''} sx={{ width:'100%', height:240, objectFit:'cover' }} />
                            {img.caption && (<CardContent><Typography variant="body2">{img.caption}</Typography></CardContent>)}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  {s.type === 'video' && s.data?.url && (
                    <Box sx={{ position:'relative', paddingTop:'56.25%' }}>
                      <Box component="iframe" src={s.data.url} title={s.title||`video-${idx}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen sx={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0 }} />
                    </Box>
                  )}
                  {s.type === 'divider' && (<Divider sx={{ my:2 }} />)}
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              dangerouslySetInnerHTML={{ __html: lesson.description || '' }}
              sx={{
              '& .lesson-content': {
                '& h1, & h2, & h3, & h4': {
                  color: 'primary.main',
                  fontWeight: 'bold',
                  mt: 3,
                  mb: 2
                },
                '& h1': { fontSize: '2.5rem' },
                '& h2': { fontSize: '2rem' },
                '& h3': { fontSize: '1.5rem' },
                '& h4': { fontSize: '1.25rem' },
                '& p': {
                  lineHeight: 1.8,
                  mb: 2,
                  fontSize: '1.1rem'
                },
                '& ul, & ol': {
                  pl: 3,
                  mb: 2,
                  '& li': {
                    mb: 1,
                    lineHeight: 1.7
                  }
                },
                '& .intro-section, & .history-section, & .merger-section, & .benefits-section, & .new-structure-section, & .conclusion-section, & .regions-section, & .climate-diversity-section, & .natural-resources-section, & .challenges-section, & .opportunities-section, & .ethnic-groups-section, & .cultural-fusion-section, & .languages-section, & .cultural-heritage-section, & .cultural-preservation-section, & .future-vision-section': {
                  mb: 4,
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(33, 203, 243, 0.05))',
                  border: '1px solid rgba(33, 150, 243, 0.1)'
                },
                '& .highlight-box': {
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 235, 59, 0.1))',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  '& h3': {
                    color: 'warning.main',
                    mt: 0
                  }
                },
                '& .timeline': {
                  position: 'relative',
                  pl: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'linear-gradient(to bottom, #2196f3, #21cbf3)'
                  }
                },
                '& .timeline-item': {
                  position: 'relative',
                  mb: 3,
                  pl: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -8,
                    top: 8,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#2196f3'
                  },
                  '& h4': {
                    color: 'primary.main',
                    mb: 1,
                    mt: 0
                  }
                },
                '& .benefits-grid, & .stats-grid, & .resources-grid, & .climate-zones, & .policy-grid, & .heritage-grid': {
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mt: 2
                },
                '& .benefit-item, & .stat-item, & .resource-category, & .zone, & .policy-item, & .heritage-item': {
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '& h4': {
                    color: 'primary.main',
                    mb: 1,
                    mt: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                },
                '& .quote-box': {
                  p: 3,
                  mt: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                  borderLeft: '4px solid #4caf50',
                  fontStyle: 'italic',
                  '& cite': {
                    display: 'block',
                    textAlign: 'right',
                    mt: 2,
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }
                },
                '& .quiz-section': {
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 82, 0.1))',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  '& h2': {
                    color: '#ff6b6b',
                    mt: 0
                  },
                  '& ol': {
                    '& li': {
                      fontWeight: 'medium',
                      color: 'text.primary'
                    }
                  }
                },
                '& .key-points, & .key-messages': {
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }
              }
            }}
            />
          )}
        </Paper>

        {/* Image Gallery */}
        {lesson.images && lesson.images.length > 0 && (
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mt: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1976d2, #2196f3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}>
              📸 Thư viện hình ảnh
            </Typography>
            
            <Grid container spacing={3}>
              {lesson.images.map((image, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        height: 250,
                        backgroundImage: `url(${resolveAssetUrl(image.url)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          right: 16,
                          color: 'white',
                          zIndex: 2
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {image.caption}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {image.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Comment Section */}
        <CommentSection
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          onAfterSubmit={async (payload) => {
            // If the new comment included a rating, refresh summary
            try {
              if (payload?.rating) {
                const rs = await fetchRatingSummary(lesson.id);
                setRatingSummary(rs);
              }
            } catch (e) {
              // ignore
            }
          }}
          onAfterDelete={async () => {
            try {
              const rs = await fetchRatingSummary(lesson.id);
              setRatingSummary(rs);
            } catch {}
          }}
        />

        {/* Navigation to Next Lesson */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/lessons')}
            startIcon={<ArrowBack />}
          >
            Tất cả bài học
          </Button>
          
          <Button
            variant="outlined"
            endIcon={<NavigateNext />}
            disabled
            title="Chức năng chuyển bài tiếp theo sẽ được cập nhật khi danh sách bài học đã nạp vào context"
          >
            Bài học tiếp theo
          </Button>
        </Box>
      </Container>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976d2, #1e88e5)'
            }
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}

      {/* Quiz Dialog */}
      <Dialog open={quizDialog} onClose={handleQuizClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Quiz sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5">Bắt đầu bài quiz</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 0 }}>
          <Typography variant="body1" paragraph>
            Bạn có muốn làm bài quiz để kiểm tra kiến thức đã học không?
          </Typography>
          {quizzesForLesson && quizzesForLesson.length > 1 ? (
            <Box sx={{ textAlign:'left' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb:1 }}>
                Chọn một quiz để bắt đầu:
              </Typography>
              <Box>
                {quizzesForLesson.map(q => (
                  <Button key={q.quiz_id} variant={String(selectedQuizId)===String(q.quiz_id)?'contained':'outlined'} sx={{ mr:1, mb:1 }} onClick={()=> setSelectedQuizId(String(q.quiz_id))}>
                    {q.title}
                  </Button>
                ))}
              </Box>
            </Box>
          ) : lessonQuiz ? (
            <Typography variant="body2" color="text.secondary">
              Bài quiz gồm {lessonQuiz.questions?.length || 0} câu hỏi{lessonQuiz.timeLimit && ` với thời gian ${lessonQuiz.timeLimit} phút`}.
            </Typography>
          ) : (
            <Typography variant="body2" color="error.main">
              Bài học hiện chưa được gán quiz.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleQuizClose} variant="outlined">
            Để sau
          </Button>
          {selectedQuizId && (
            <Button onClick={handleQuizNavigate} variant="contained" autoFocus>
              Bắt đầu ngay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonDetail;