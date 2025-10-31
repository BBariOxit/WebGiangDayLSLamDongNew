import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Paper, InputAdornment, TextField, Select, MenuItem, FormControl, InputLabel, Avatar, Skeleton
} from '@mui/material';
import { Quiz as QuizIcon, Search as SearchIcon, Timer as TimerIcon, Help as HelpIcon, School as SchoolIcon, EmojiEvents as EmojiEventsIcon, ErrorOutline as ErrorOutlineIcon, NavigateNext } from '@mui/icons-material';

const QuizzesIndex = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('');
  const [quizzes, setQuizzes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const getDifficultyTheme = (level) => {
    // Modern color palette with vibrant gradients
    switch (level) {
      case 'Cơ bản':
        return { 
          primary: '#10b981', 
          secondary: '#059669',
          light: '#d1fae5',
          border: '#6ee7b7',
          shadow: 'rgba(16, 185, 129, 0.2)'
        };
      case 'Trung bình':
        return { 
          primary: '#f59e0b', 
          secondary: '#d97706',
          light: '#fef3c7',
          border: '#fbbf24',
          shadow: 'rgba(245, 158, 11, 0.2)'
        };
      case 'Nâng cao':
        return { 
          primary: '#ef4444', 
          secondary: '#dc2626',
          light: '#fee2e2',
          border: '#fca5a5',
          shadow: 'rgba(239, 68, 68, 0.2)'
        };
      default:
        return { 
          primary: '#3b82f6', 
          secondary: '#2563eb',
          light: '#dbeafe',
          border: '#93c5fd',
          shadow: 'rgba(59, 130, 246, 0.2)'
        };
    }
  };

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await quizApi.listPublicQuizzes();
        if (mounted) setQuizzes(data);
      } catch (e) {
        if (mounted) setError(e.message || 'Không tải được danh sách quiz');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const filtered = useMemo(() => {
    return (quizzes || []).filter(q => {
      const title = (q.title || '').toLowerCase();
      const desc = (q.description || '').toLowerCase();
      const matchesSearch = title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
      const matchesDiff = !difficulty || q.difficulty === difficulty;
      return matchesSearch && matchesDiff;
    });
  }, [quizzes, search, difficulty]);

  // Optional: could fetch stats from backend later

  return (
    <Box>
      {/* Hero header */}
      <Paper elevation={0} sx={{
        mb: 3,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
        border: '1px solid #e3f2fd'
      }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2, flexWrap:'wrap' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <QuizIcon color="primary" />
          </Box>
          <Box sx={{ flex:1, minWidth: 220 }}>
            <Typography variant="h4" fontWeight="bold">Quiz & Bài tập</Typography>
            <Typography variant="body2" color="text.secondary">Chọn một bài quiz để bắt đầu luyện tập và kiểm tra kiến thức của bạn.</Typography>
          </Box>
          <Box sx={{ display:'flex', gap:1, alignItems:'center', flexWrap:'wrap' }}>
            <Chip icon={<EmojiEventsIcon/>} label={`${filtered.length} bài phù hợp`} sx={{ bgcolor:'#fff', border:'1px solid #e0e0e0' }} />
            <Chip icon={<SchoolIcon/>} label={`${quizzes.length} bài tổng`} sx={{ bgcolor:'#fff', border:'1px solid #e0e0e0' }} />
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth placeholder="Tìm kiếm quiz" value={search} onChange={(e)=>setSearch(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>) }} />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Độ khó</InputLabel>
            <Select value={difficulty} label="Độ khó" onChange={(e)=>setDifficulty(e.target.value)}>
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Cơ bản">Cơ bản</MenuItem>
              <MenuItem value="Trung bình">Trung bình</MenuItem>
              <MenuItem value="Nâng cao">Nâng cao</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3} sx={{ display:'flex', alignItems:'stretch' }}>
          {Boolean(search || difficulty) && (
            <Button fullWidth variant="outlined" color="inherit" onClick={()=>{ setSearch(''); setDifficulty(''); }}>
              Xóa bộ lọc
            </Button>
          )}
        </Grid>
      </Grid>

      {loading && (
        <Grid container spacing={3} sx={{ mb:4 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} item xs={12} sm={6} lg={4}>
              <Card sx={{ borderRadius:3, p:0 }}>
                <Box sx={{ p:3, borderBottom:'1px solid #eee', display:'flex', alignItems:'center', gap:1 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="text" width="60%" height={28} />
                </Box>
                <CardContent>
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="80%" />
                  <Box sx={{ display:'flex', gap:1, mt:2 }}>
                    <Skeleton variant="rounded" width={80} height={28} />
                    <Skeleton variant="rounded" width={80} height={28} />
                    <Skeleton variant="rounded" width={80} height={28} />
                  </Box>
                </CardContent>
                <Box sx={{ p:2, display:'flex', justifyContent:'flex-end' }}>
                  <Skeleton variant="rounded" width={96} height={36} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {error && (
        <Paper sx={{ p:2, mb:2, color:'error.main' }}>{error}</Paper>
      )}
      {!loading && !error && filtered.length === 0 && (
        <Paper sx={{ p:4, mb:4, display:'flex', gap:2, alignItems:'center', borderRadius:3 }}>
          <ErrorOutlineIcon color="action" />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Không có quiz nào phù hợp</Typography>
            <Typography variant="body2" color="text.secondary">Hãy điều chỉnh từ khóa tìm kiếm hoặc chọn "Tất cả" ở bộ lọc độ khó.</Typography>
          </Box>
        </Paper>
      )}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filtered.map(q => {
          const theme = getDifficultyTheme(q.difficulty);
          return (
            <Grid key={q.quiz_id} item xs={12} md={6} xl={4}>
              <Card
                onClick={()=>navigate(`/quizzes/take/${q.quiz_id}`)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${theme.shadow}, 0 0 0 1px ${theme.border}`,
                    '& .quiz-icon-wrapper': {
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: `0 12px 24px ${theme.shadow}`
                    },
                    '& .start-button': {
                      transform: 'translateX(4px)',
                      paddingRight: '24px'
                    }
                  }
                }}
              >
                {/* Top colored bar */}
                <Box sx={{ 
                  height: 5,
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, transparent, ${theme.primary}40, transparent)`,
                    animation: 'shimmer 2s infinite',
                  },
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }} />

                <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Header section */}
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 2 }}>
                      {/* Quiz icon */}
                      <Box 
                        className="quiz-icon-wrapper"
                        sx={{ 
                          width: 72,
                          height: 72,
                          borderRadius: 2.5,
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: `0 8px 16px ${theme.shadow}`,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
                            opacity: 0.8
                          }
                        }}
                      >
                        <QuizIcon sx={{ color: 'white', fontSize: 36, zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                      </Box>
                      
                      {/* Title and meta */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            color: '#1e293b',
                            mb: 1,
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            letterSpacing: '-0.02em'
                          }}
                        >
                          {q.title}
                        </Typography>
                        
                        {/* Lesson and creator info */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {q.lesson_title && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <SchoolIcon sx={{ fontSize: 14, color: '#64748b' }} />
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                                {q.lesson_title}
                              </Typography>
                            </Box>
                          )}
                          {q.creator_name && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: theme.primary }}>
                                  {q.creator_name.charAt(0).toUpperCase()}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                                {q.creator_name}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b',
                        lineHeight: 1.6,
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 2.5
                      }}
                    >
                      {q.description}
                    </Typography>
                    
                    {/* Tags row */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small" 
                        icon={<HelpIcon sx={{ fontSize: 15 }} />}
                        label="Quiz" 
                        sx={{ 
                          height: 26,
                          bgcolor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: '1.5px solid #bfdbfe',
                          '& .MuiChip-icon': { color: '#2563eb', marginLeft: '6px' }
                        }} 
                      />
                      <Chip 
                        size="small" 
                        icon={<TimerIcon sx={{ fontSize: 15 }} />}
                        label={`${q.time_limit || 0} phút`} 
                        sx={{ 
                          height: 26,
                          bgcolor: '#fff7ed',
                          color: '#ea580c',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: '1.5px solid #fed7aa',
                          '& .MuiChip-icon': { color: '#ea580c', marginLeft: '6px' }
                        }} 
                      />
                      <Chip 
                        size="small" 
                        label={q.difficulty} 
                        sx={{ 
                          height: 26,
                          bgcolor: theme.light,
                          color: theme.primary,
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          border: `1.5px solid ${theme.border}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }} 
                      />
                    </Box>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ px: 3, mt: 'auto' }}>
                    <Box sx={{ 
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${theme.border}60, transparent)`
                    }} />
                  </Box>

                  {/* Footer */}
                  <Box sx={{ p: 3, pt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Status indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: theme.primary,
                        boxShadow: `0 0 0 3px ${theme.light}`,
                        animation: 'pulse-dot 2s ease-in-out infinite',
                        '@keyframes pulse-dot': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 }
                        }
                      }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
                        Sẵn sàng
                      </Typography>
                    </Box>
                    
                    {/* Start button */}
                    <Button 
                      className="start-button"
                      variant="contained"
                      size="small"
                      endIcon={<NavigateNext />}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        boxShadow: `0 4px 12px ${theme.shadow}`,
                        borderRadius: 2,
                        px: 2.5,
                        py: 0.75,
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                          boxShadow: `0 6px 16px ${theme.shadow}`
                        }
                      }}
                    >
                      Bắt đầu
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  );
};

export default QuizzesIndex;
