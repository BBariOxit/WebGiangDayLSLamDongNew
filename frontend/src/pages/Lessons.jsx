import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Person as PersonIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

const Lessons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [bookmarkedLessons, setBookmarkedLessons] = useState([2, 5]);

  const lessons = [
    {
      id: 1,
      title: 'Lịch sử hình thành Lâm Đồng',
      description: 'Tìm hiểu về quá trình hình thành và phát triển của tỉnh Lâm Đồng từ thời kỳ đầu đến hiện tại.',
      image: '/api/placeholder/400/250',
      instructor: 'GS. Nguyễn Văn A',
      duration: '45 phút',
      difficulty: 'Cơ bản',
      rating: 4.8,
      students: 234,
      progress: 75,
      category: 'Lịch sử địa phương',
      tags: ['Lịch sử', 'Lâm Đồng', 'Hình thành'],
      status: 'Đang học'
    },
    {
      id: 2,
      title: 'Địa lý và khí hậu Đà Lạt',
      description: 'Khám phá đặc điểm địa lý, khí hậu độc đáo của thành phố Đà Lạt và ảnh hưởng của nó đến lịch sử phát triển.',
      image: '/api/placeholder/400/250',
      instructor: 'TS. Trần Thị B',
      duration: '35 phút',
      difficulty: 'Trung bình',
      rating: 4.9,
      students: 189,
      progress: 45,
      category: 'Địa lý',
      tags: ['Địa lý', 'Khí hậu', 'Đà Lạt'],
      status: 'Đang học'
    },
    {
      id: 3,
      title: 'Văn hóa các dân tộc thiểu số',
      description: 'Tìm hiểu về văn hóa đa dạng và phong phú của các dân tộc thiểu số sinh sống tại Lâm Đồng.',
      image: '/api/placeholder/400/250',
      instructor: 'PGS. Lê Văn C',
      duration: '50 phút',
      difficulty: 'Nâng cao',
      rating: 4.7,
      students: 156,
      progress: 0,
      category: 'Văn hóa',
      tags: ['Văn hóa', 'Dân tộc', 'Truyền thống'],
      status: 'Chưa học'
    },
    {
      id: 4,
      title: 'Kinh tế Lâm Đồng qua các thời kỳ',
      description: 'Phân tích sự phát triển kinh tế của Lâm Đồng từ thời thuộc địa đến hiện đại.',
      image: '/api/placeholder/400/250',
      instructor: 'TS. Phạm Văn D',
      duration: '40 phút',
      difficulty: 'Trung bình',
      rating: 4.6,
      students: 198,
      progress: 0,
      category: 'Kinh tế',
      tags: ['Kinh tế', 'Phát triển', 'Lịch sử'],
      status: 'Chưa học'
    },
    {
      id: 5,
      title: 'Du lịch và di sản văn hóa',
      description: 'Khám phá các di sản văn hóa và điểm du lịch nổi tiếng của Lâm Đồng.',
      image: '/api/placeholder/400/250',
      instructor: 'ThS. Hoàng Thị E',
      duration: '38 phút',
      difficulty: 'Cơ bản',
      rating: 4.8,
      students: 267,
      progress: 100,
      category: 'Du lịch',
      tags: ['Du lịch', 'Di sản', 'Văn hóa'],
      status: 'Hoàn thành'
    },
    {
      id: 6,
      title: 'Chiến tranh và kháng chiến',
      description: 'Lịch sử kháng chiến chống thực dân Pháp và đế quốc Mỹ tại Lâm Đồng.',
      image: '/api/placeholder/400/250',
      instructor: 'GS. Vũ Văn F',
      duration: '55 phút',
      difficulty: 'Nâng cao',
      rating: 4.9,
      students: 143,
      progress: 0,
      category: 'Lịch sử chiến tranh',
      tags: ['Kháng chiến', 'Chiến tranh', 'Lịch sử'],
      status: 'Chưa học'
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
      case 'Hoàn thành':
        return '#4caf50';
      case 'Đang học':
        return '#2196f3';
      case 'Chưa học':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  const toggleBookmark = (lessonId) => {
    setBookmarkedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !filterDifficulty || lesson.difficulty === filterDifficulty;
    const matchesStatus = !filterStatus || lesson.status === filterStatus;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bài học
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Khám phá các bài học về lịch sử Lâm Đồng được thiết kế chuyên nghiệp
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3 }}>
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
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                label="Trạng thái"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Chưa học">Chưa học</MenuItem>
                <MenuItem value="Đang học">Đang học</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              sx={{ height: 56, borderRadius: 2 }}
            >
              Lọc
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Lessons Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredLessons.map((lesson) => (
          <Grid item xs={12} sm={6} lg={4} key={lesson.id}>
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
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingIcon sx={{ fontSize: 64, color: '#1976d2', opacity: 0.7 }} />
                </Box>
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                  }}
                  onClick={() => toggleBookmark(lesson.id)}
                >
                  {bookmarkedLessons.includes(lesson.id) ? (
                    <BookmarkFilledIcon color="primary" />
                  ) : (
                    <BookmarkIcon />
                  )}
                </IconButton>
                
                <Chip
                  label={lesson.difficulty}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: getDifficultyColor(lesson.difficulty),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {lesson.title}
                </Typography>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, height: 40, overflow: 'hidden' }}
                >
                  {lesson.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#1976d2' }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" display="block">
                      {lesson.instructor}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lesson.students} học viên
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {lesson.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
                
                {lesson.progress > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tiến độ
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lesson.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={lesson.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={lesson.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(lesson.status),
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
                    {lesson.progress > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={3} color="primary" size="large" />
      </Box>
    </Box>
  );
};

export default Lessons;