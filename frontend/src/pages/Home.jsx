import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Fab
} from '@mui/material';
import {
  School,
  Quiz,
  TrendingUp,
  People,
  Star,
  PlayArrow,
  ArrowForward,
  Schedule,
  LocalLibrary,
  MenuBook,
  Analytics,
  EmojiEvents,
  Login,
  PersonAdd
} from '@mui/icons-material';
import apiClient from '../shared/services/apiClient';
import { resolveAssetUrl } from '../shared/utils/url';
import { useAuth } from '@features/auth/hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = React.useState([]);
  const [featuredLessons, setFeaturedLessons] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Fetch lessons from API and compute featured
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/lessons?published=1');
        const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const normalized = (payload || []).map((lesson) => {
          // Normalize images to [{url, caption}]
          let parsedImages = [];
          if (lesson.images) {
            if (Array.isArray(lesson.images)) parsedImages = lesson.images;
            else if (typeof lesson.images === 'string') {
              try { parsedImages = JSON.parse(lesson.images); } catch {}
            } else if (typeof lesson.images === 'object') parsedImages = lesson.images;
          }
          if (Array.isArray(parsedImages)) parsedImages = parsedImages.map(img => (typeof img === 'string' ? { url: img, caption: '' } : img));
          return {
            id: lesson.lesson_id,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary || '',
            duration: lesson.duration || '25 phút',
            rating: parseFloat(lesson.rating || lesson.avg_rating) || 0,
            students: lesson.students_count || 0,
            difficulty: lesson.difficulty || 'Cơ bản',
            category: lesson.category || 'Lịch sử địa phương',
            images: parsedImages,
            createdAt: lesson.created_at || lesson.createdAt || new Date().toISOString()
          };
        });
        if (!mounted) return;
        setLessons(normalized);
        // Choose featured: prioritize known landmarks if present, else by students desc then rating desc
        const prioritySlugs = ['lien-khuong', 'da-lat', 'djiring', 'di-linh', 'djiring-di-linh'];
        const withPriority = [...normalized].sort((a, b) => {
          const ap = prioritySlugs.some(s => (a.slug || '').includes(s)) ? 1 : 0;
          const bp = prioritySlugs.some(s => (b.slug || '').includes(s)) ? 1 : 0;
          if (ap !== bp) return bp - ap; // prioritized first
          if (b.students !== a.students) return (b.students || 0) - (a.students || 0);
          if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setFeaturedLessons(withPriority.slice(0, 3));
      } catch (e) {
        if (mounted) setError(e.message || 'Không thể tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Compute stats from DB data
  const totalMinutes = lessons.reduce((sum, l) => {
    const m = String(l.duration).match(/\d+/);
    return sum + (m ? parseInt(m[0], 10) : 0);
  }, 0);
  const totalStudents = lessons.reduce((sum, l) => sum + (l.students || 0), 0);
  const averageRating = lessons.length ? (lessons.reduce((s, l) => s + (l.rating || 0), 0) / lessons.length).toFixed(1) : '0.0';
  const stats = [
    { icon: MenuBook, label: 'Bài học', value: lessons.length, color: '#2196f3' },
    { icon: Quiz, label: 'Phút học', value: `${totalMinutes}+`, color: '#ff6b6b' },
    { icon: People, label: 'Lượt xem', value: `${Math.max(0, Math.round(totalStudents/10)*10)}+`, color: '#4caf50' },
    { icon: EmojiEvents, label: 'Đánh giá', value: `${averageRating}/5⭐`, color: '#ff9800' }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Khám phá Lâm Đồng
              </Typography>
              <Typography variant="h5" paragraph sx={{
                opacity: 0.9,
                lineHeight: 1.6
              }}>
                Hành trình tìm hiểu lịch sử, văn hóa và địa lý của tỉnh Lâm Đồng qua những bài học trực quan và sinh động.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<School />}
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                      color: 'white',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388e3c, #4caf50)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                      }
                    }}
                  >
                    Vào Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Login />}
                      onClick={() => navigate('/login')}
                      sx={{
                        background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1976d2, #2196f3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                        }
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PersonAdd />}
                      onClick={() => navigate('/register')}
                      sx={{
                        background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7b1fa2, #9c27b0)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)'
                        }
                      }}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/lessons')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white'
                    }
                  }}
                >
                  Xem bài học
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: 400,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <LocalLibrary sx={{ fontSize: 120, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <Avatar sx={{
                  bgcolor: stat.color,
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2
                }}>
                  <stat.icon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Lessons */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1976d2, #2196f3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Bài học nổi bật
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Khám phá những bài học hấp dẫn về Lâm Đồng
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {featuredLessons.map((lesson, index) => (
              <Grid item xs={12} md={4} key={lesson.id}>
                <Card sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    {lesson.images && lesson.images.length > 0 ? (
                      <Box component="img"
                        src={resolveAssetUrl(lesson.images[0].url)}
                        alt={lesson.title}
                        sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{
                        height: 200,
                        background: `linear-gradient(135deg, 
                          ${index % 3 === 0 ? '#ff6b6b, #ee5a52' : 
                            index % 3 === 1 ? '#4ecdc4, #44a08d' : 
                            '#45b7d1, #96c93d'})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                          {lesson.category}
                        </Typography>
                      </Box>
                    )}
                    <Fab 
                      color="primary" 
                      sx={{ 
                        position: 'absolute',
                        bottom: -28,
                        right: 20,
                        bgcolor: 'white',
                        color: 'primary.main',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                      onClick={() => navigate(`/lesson/${lesson.slug}`)}
                    >
                      <PlayArrow />
                    </Fab>
                  </Box>

                  <CardContent sx={{ p: 3, pt: 4 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {lesson.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {lesson.summary}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption">{lesson.duration}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People fontSize="small" color="action" />
                        <Typography variant="caption">{lesson.students}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star fontSize="small" sx={{ color: '#ffb400' }} />
                        <Typography variant="caption">{lesson.rating}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={lesson.difficulty}
                        size="small"
                        color={
                          lesson.difficulty === 'Cơ bản' ? 'success' :
                          lesson.difficulty === 'Trung bình' ? 'warning' : 'error'
                        }
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Lâm Đồng
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/lessons')}
              sx={{
                background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2, #1e88e5)'
                }
              }}
            >
              Xem tất cả bài học
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1976d2, #2196f3)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Tại sao chọn chúng tôi?
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: LocalLibrary,
              title: 'Nội dung chất lượng',
              description: 'Bài học được biên soạn bởi các chuyên gia với nội dung phong phú, chính xác',
              color: '#2196f3'
            },
            {
              icon: Quiz,
              title: 'Kiểm tra đa dạng',
              description: 'Hệ thống quiz tương tác giúp kiểm tra và củng cố kiến thức hiệu quả',
              color: '#ff6b6b'
            },
            {
              icon: Analytics,
              title: 'Theo dõi tiến độ',
              description: 'Hệ thống theo dõi học tập chi tiết, giúp bạn nắm bắt tiến độ học tập',
              color: '#4caf50'
            },
            {
              icon: People,
              title: 'Cộng đồng học tập',
              description: 'Kết nối với cộng đồng người học, chia sẻ kinh nghiệm và kiến thức',
              color: '#ff9800'
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <Avatar sx={{
                  bgcolor: feature.color,
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 3
                }}>
                  <feature.icon fontSize="large" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{
            fontWeight: 'bold'
          }}>
            Sẵn sàng bắt đầu hành trình học tập?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Tham gia cùng hàng trăm học viên đã khám phá vẻ đẹp của Lâm Đồng
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            {!user && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #9c27b0, #e91e63)',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 18px rgba(233, 30, 99, 0.35)',
                  transform: 'translateZ(0)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8e24aa, #d81b60)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(233, 30, 99, 0.45)'
                  }
                }}
              >
                Đăng ký miễn phí
              </Button>
            )}
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/lessons')}
              sx={{
                background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00, #ff9800)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)'
                }
              }}
            >
              Khám phá ngay
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;