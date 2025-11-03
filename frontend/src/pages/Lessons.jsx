import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Rating,
  Tooltip,
  Fade,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  School,
  Schedule,
  Star,
  People,
  PlayArrow,
  BookmarkBorder,
  Bookmark,
  TrendingUp,
  CheckCircle,
  Lock,
  EmojiEvents
} from '@mui/icons-material';
import axios from 'axios';
import { resolveAssetUrl } from '../shared/utils/url';
import { useAuth } from '@features/auth/hooks/useAuth';
import { listMyBookmarks, addBookmarkApi, removeBookmarkApi, listMyProgress } from '../api/lessonEngagementApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Helpers for safe image rendering with graceful fallback
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/') || u.startsWith('data:');
};

const fallbackSvgDataUri = (text = 'Bài học') => {
  const label = encodeURIComponent(text);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#2196f3'/>
          <stop offset='100%' stop-color='#21cbf3'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Segoe UI, Arial, sans-serif' font-size='28' fill='white'>${label}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
};

const Lessons = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookmarkedLessons, setBookmarkedLessons] = useState(new Set());
  const [progressLookup, setProgressLookup] = useState(new Map());
  const [error, setError] = useState(null);

  // Fetch lessons from API
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching lessons from:', `${API_BASE_URL}/lessons?published=1`);
        const response = await axios.get(`${API_BASE_URL}/lessons?published=1`);
        console.log('API Raw Response:', response.data);
        const payload = response.data && typeof response.data === 'object'
          ? (Array.isArray(response.data) ? response.data : response.data.data)
          : [];

        if (!Array.isArray(payload)) {
          console.warn('Unexpected lessons payload type:', typeof payload, payload);
          setError('Dữ liệu trả về không đúng định dạng (expected array).');
          setLessons([]);
          setFilteredLessons([]);
          setProgressLookup(new Map());
          return;
        }

        let progressRows = [];
        const progressMap = new Map();
        if (user) {
          try {
            progressRows = await listMyProgress();
            progressRows.forEach(row => {
              const lessonId = Number(row.lesson_id);
              progressMap.set(lessonId, {
                progress: Number(row.progress ?? 0),
                isCompleted: !!row.is_completed,
                completedAt: row.completed_at || null,
                bestScore: Number(row.best_score ?? 0)
              });
            });
            setProgressLookup(new Map(progressMap));
          } catch (err) {
            console.warn('listMyProgress failed', err);
            setProgressLookup(new Map());
          }
        } else {
          setProgressLookup(new Map());
        }

        const lessonsFromAPI = payload.map(lesson => {
          console.log('Processing lesson:', lesson.lesson_id, lesson.title);

          // Parse images safely and normalize to [{ url, caption }]
          let parsedImages = [];
          if (lesson.images) {
            if (Array.isArray(lesson.images)) {
              parsedImages = lesson.images;
            } else if (typeof lesson.images === 'string') {
              try { parsedImages = JSON.parse(lesson.images); } catch (e) { console.warn('Failed to parse images for lesson', lesson.lesson_id, e); }
            } else if (typeof lesson.images === 'object') {
              parsedImages = lesson.images;
            }
          }
          if (Array.isArray(parsedImages)) {
            parsedImages = parsedImages.map(img => (typeof img === 'string' ? { url: img, caption: '' } : img));
          }

          const avg = parseFloat(lesson.avg_rating ?? lesson.rating ?? 0) || 0;
          const rcount = Number(lesson.rating_count ?? 0);
          const computedRating = rcount === 0 ? 5.0 : Math.round(avg * 10) / 10;
          const progressInfo = progressMap.get(Number(lesson.lesson_id)) || {};
          const isCompleted = !!progressInfo.isCompleted;
          const progressPercent = isCompleted ? 100 : Number(progressInfo.progress ?? 0);
          const bestScore = Number(progressInfo.bestScore ?? 0);
          return {
            id: lesson.lesson_id,
            title: lesson.title,
            slug: lesson.slug,
            summary: lesson.summary || '',
            description: lesson.content_html || '',
            instructor: lesson.instructor || 'Nhóm biên soạn địa phương',
            duration: lesson.duration || '25 phút',
            difficulty: lesson.difficulty || 'Cơ bản',
            rating: computedRating,
            studyCount: Number(lesson.study_sessions_count ?? lesson.students_count ?? 0),
            progress: progressPercent,
            isCompleted,
            completedAt: progressInfo.completedAt || null,
            bestScore,
            category: lesson.category || 'Lịch sử địa phương',
            tags: Array.isArray(lesson.tags) ? lesson.tags : ['Lịch sử'],
            status: lesson.status || 'Chưa học',
            images: parsedImages,
            createdAt: lesson.created_at || lesson.createdAt || new Date().toISOString(),
            ratingCount: rcount
          };
        });
        console.log('Mapped lessons:', lessonsFromAPI);
        setLessons(lessonsFromAPI);
        setFilteredLessons(lessonsFromAPI);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setError(error.message || 'Không thể tải bài học');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
    // Load bookmarks if logged in
    (async () => {
      try {
        if (!user) return;
        const items = await listMyBookmarks();
        const setIds = new Set(items.map(i => i.lesson_id));
        setBookmarkedLessons(setIds);
      } catch (e) {
        // ignore silently
      }
    })();
  }, [user]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...lessons];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lesson => lesson.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(lesson => lesson.difficulty === selectedDifficulty);
    }

    // Tab filter
    switch (tabValue) {
      case 1: // Đang học
        filtered = filtered.filter(lesson => lesson.progress > 0 && lesson.progress < 100);
        break;
      case 2: // Đã hoàn thành
        filtered = filtered.filter(lesson => lesson.isCompleted);
        break;
      case 3: // Đã lưu
        filtered = filtered.filter(lesson => bookmarkedLessons.has(lesson.id));
        break;
      default: // Tất cả
        break;
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
  filtered.sort((a, b) => (b.studyCount || 0) - (a.studyCount || 0));
        break;
      case 'duration':
        filtered.sort((a, b) => {
          const getDuration = (duration) => parseInt(duration.match(/\d+/)?.[0] || 0);
          return getDuration(a.duration) - getDuration(b.duration);
        });
        break;
      default:
        break;
    }

    setFilteredLessons(filtered);
  }, [lessons, searchTerm, selectedCategory, selectedDifficulty, sortBy, tabValue, bookmarkedLessons]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Cơ bản':
        return 'success';
      case 'Trung bình':
        return 'warning';
      case 'Nâng cao':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'default';
    if (progress < 100) return 'primary';
    return 'success';
  };

  const handleBookmark = async (lessonId, event) => {
    event.stopPropagation();
    const newBookmarked = new Set(bookmarkedLessons);
    const currently = newBookmarked.has(lessonId);
    // optimistic
    if (currently) newBookmarked.delete(lessonId); else newBookmarked.add(lessonId);
    setBookmarkedLessons(newBookmarked);
    try {
      if (!user) return; // guest: local only
      if (currently) await removeBookmarkApi(lessonId); else await addBookmarkApi(lessonId);
    } catch (e) {
      // revert on error
      if (currently) newBookmarked.add(lessonId); else newBookmarked.delete(lessonId);
      setBookmarkedLessons(newBookmarked);
      setError('Không thể cập nhật danh sách đã lưu');
    }
  };

  const handleLessonClick = (lesson) => {
    if (user || lesson.id <= 1) { // Allow first lesson for guests
      navigate(`/lesson/${lesson.slug}`);
    }
  };

  const categories = [...new Set(lessons.map(lesson => lesson.category))];
  const difficulties = ['Cơ bản', 'Trung bình', 'Nâng cao'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={60} />
          <Skeleton variant="text" width="60%" height={30} />
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #1976d2, #2196f3)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Bài học về Lâm Đồng
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Khám phá kiến thức về lịch sử, văn hóa và địa lý của tỉnh Lâm Đồng
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={selectedCategory}
                label="Danh mục"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Độ khó</InputLabel>
              <Select
                value={selectedDifficulty}
                label="Độ khó"
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {difficulties.map(difficulty => (
                  <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="oldest">Cũ nhất</MenuItem>
                <MenuItem value="rating">Đánh giá cao</MenuItem>
                <MenuItem value="popular">Phổ biến</MenuItem>
                <MenuItem value="duration">Thời lượng</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSortBy('newest');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 4, borderRadius: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'medium',
              fontSize: '1rem'
            }
          }}
        >
          <Tab label={`Tất cả (${lessons.length})`} />
          <Tab label={`Đang học (${lessons.filter(l => l.progress > 0 && l.progress < 100).length})`} />
          <Tab label={`Hoàn thành (${lessons.filter(l => l.isCompleted).length})`} />
          <Tab label={`Đã lưu (${bookmarkedLessons.size})`} />
        </Tabs>
      </Paper>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy bài học nào phù hợp
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setTabValue(0);
            }}
          >
            Xem tất cả bài học
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredLessons.map((lesson, index) => {
            const isLocked = !user && lesson.id > 1;
            const isBookmarked = bookmarkedLessons.has(lesson.id);

            return (
              <Grid item xs={12} md={6} lg={4} key={lesson.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      // Use a fixed, smaller radius for a cleaner look (was 3 -> 3 * theme.shape.borderRadius)
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      opacity: isLocked ? 0.7 : 1,
                      '&:hover': {
                        transform: isLocked ? 'none' : 'translateY(-8px)',
                        boxShadow: isLocked ? 'none' : '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    {/* Lock Overlay */}
                    {isLocked && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2
                        }}
                      >
                        <Box sx={{ textAlign: 'center', color: 'white' }}>
                          <Lock sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="h6" fontWeight="bold">
                            Cần đăng nhập
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Progress Indicator */}
                    {lesson.progress > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={lesson.progress}
                        color={getProgressColor(lesson.progress)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          zIndex: 1,
                          height: 4
                        }}
                      />
                    )}

                    {/* Image area */}
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      {(() => {
                        const raw = lesson?.images?.[0]?.url || '';
                        const resolved = resolveAssetUrl(raw);
                        const ok = isValidImageUrl(resolved);
                        return ok ? (
                          <Box
                            component="img"
                            src={resolved}
                            alt={lesson.title}
                            loading="lazy"
                            onError={(e) => {
                              // Avoid infinite loop in case fallback fails
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = fallbackSvgDataUri(lesson.category || 'Bài học');
                            }}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <Box sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${lesson.id % 3 === 0 ? '#ff6b6b, #ee5a52' : lesson.id % 3 === 1 ? '#4ecdc4, #44a08d' : '#45b7d1, #96c93d'})`
                          }}>
                            <Typography
                              variant="h5"
                              sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                px: 2
                              }}
                            >
                              {lesson.category}
                            </Typography>
                          </Box>
                        );
                      })()}

                      {/* Bookmark Button */}
                      <IconButton
                        onClick={(e) => handleBookmark(lesson.id, e)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        {isBookmarked ? (<Bookmark sx={{ color: 'primary.main' }} />) : (<BookmarkBorder />)}
                      </IconButton>

                      {/* Completion Badge */}
                      {lesson.isCompleted && (
                        <Tooltip title={`Điểm cao nhất: ${lesson.bestScore ?? 0}%`} placement="right">
                          <Chip
                            icon={<CheckCircle />}
                            label="Hoàn thành"
                            color="success"
                            sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                          />
                        </Tooltip>
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" component="h2" gutterBottom sx={{
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {lesson.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" paragraph sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {lesson.summary}
                      </Typography>

                      {/* Meta Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="caption">{lesson.duration}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People fontSize="small" color="action" />
                          <Typography variant="caption">{lesson.studyCount} lượt học</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star fontSize="small" sx={{ color: '#ffb400' }} />
                          <Typography variant="caption">{lesson.rating}</Typography>
                        </Box>
                        {lesson.isCompleted && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmojiEvents fontSize="small" color="success" />
                            <Typography variant="caption">{lesson.bestScore ?? 0}%</Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip
                          label={lesson.difficulty}
                          color={getDifficultyColor(lesson.difficulty)}
                          size="small"
                          variant="outlined"
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            <School fontSize="small" />
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {lesson.instructor.split(' ').slice(-2).join(' ')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Tags */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {lesson.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {lesson.tags.length > 3 && (
                          <Tooltip title={lesson.tags.slice(3).join(', ')}>
                            <Chip
                              label={`+${lesson.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Tooltip>
                        )}
                      </Box>

                      {/* Spacer pushes the button to the bottom while content above can grow */}
                      <Box sx={{ flexGrow: 1 }} />

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrow />}
                        disabled={isLocked}
                        sx={{
                          borderRadius: 2,
                          background: isLocked ? 'grey.400' : 'linear-gradient(135deg, #2196f3, #21cbf3)',
                          '&:hover': {
                            background: isLocked ? 'grey.400' : 'linear-gradient(135deg, #1976d2, #1e88e5)'
                          }
                        }}
                      >
                        {isLocked ? 'Cần đăng nhập' : 'Bắt đầu học'}
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Statistics */}
      <Paper elevation={2} sx={{ mt: 6, p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Thống kê bài học
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {lessons.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng bài học
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {
                  // Sum total minutes across lessons by parsing the duration strings
                  lessons.reduce((sum, lesson) => {
                    const match = String(lesson.duration).match(/\d+/);
                    const minutes = match ? parseInt(match[0], 10) : 0;
                    return sum + minutes;
                  }, 0)
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng thời lượng (phút)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {Math.round(lessons.reduce((sum, lesson, _, arr) => sum + lesson.rating, 0) / lessons.length * 10) / 10}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đánh giá trung bình
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {lessons.reduce((sum, lesson) => sum + (lesson.studyCount || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng lượt học
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Lessons;