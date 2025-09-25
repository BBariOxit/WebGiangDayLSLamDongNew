import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Paper, InputAdornment, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Quiz as QuizIcon, Search as SearchIcon, Timer as TimerIcon, Help as HelpIcon } from '@mui/icons-material';

const QuizzesIndex = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [difficulty, setDifficulty] = React.useState('');

  const getDifficultyTheme = (level) => {
    // Subtle palette with a soft tint background per difficulty
    switch (level) {
      case 'Cơ bản':
        return { color: '#2e7d32', border: '#c8e6c9', tintBg: '#f1f8f4' };
      case 'Trung bình':
        return { color: '#ed6c02', border: '#ffe0b2', tintBg: '#fff7e6' };
      case 'Nâng cao':
        return { color: '#c62828', border: '#ffcdd2', tintBg: '#fff1f1' };
      default:
        return { color: '#1976d2', border: '#bbdefb', tintBg: '#f3f8ff' };
    }
  };

  const quizzes = useMemo(() => quizService.getQuizzes(), []);
  const filtered = useMemo(() => {
    return quizzes.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase());
      const matchesDiff = !difficulty || q.difficulty === difficulty;
      return matchesSearch && matchesDiff;
    });
  }, [quizzes, search, difficulty]);

  const stats = quizService.getGlobalStats();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Quiz & Bài tập</Typography>
        <Typography variant="body2" color="text.secondary">Chọn một bài quiz để bắt đầu.</Typography>
      </Box>

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
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filtered.map(q => {
          const s = quizService.getQuizStats(q.id);
          const theme = getDifficultyTheme(q.difficulty);
          return (
            <Grid key={q.id} item xs={12} sm={6} lg={4}>
              <Card
                sx={{
                  height:'100%',
                  display:'flex',
                  flexDirection:'column',
                  borderRadius: 3,
                  border: `1px solid ${theme.border}`,
                  borderTop: `4px solid ${theme.color}`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  transition: 'all .25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.10)'
                  }
                }}
              >
                <Box sx={{ p:3, display:'flex', alignItems:'center', gap:1, bgcolor: theme.tintBg, borderBottom: `1px solid ${theme.border}`, transition: 'background-color .25s ease' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', bgcolor: '#ffffff', border: `1px solid ${theme.border}` }}>
                    <QuizIcon sx={{ color: theme.color, fontSize: 18 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">{q.title}</Typography>
                </Box>
                <CardContent sx={{ flexGrow:1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>{q.description}</Typography>
                  <Box sx={{ display:'flex', gap:1, mb:2, flexWrap: 'wrap' }}>
                    <Chip size="small" icon={<HelpIcon/>} label={`${q.questions?.length||0} câu hỏi`} sx={{ bgcolor: '#eaf3ff', color: '#1976d2', fontWeight: 600 }} />
                    <Chip size="small" icon={<TimerIcon/>} label={`${q.timeLimit} phút`} sx={{ bgcolor: '#fff4e5', color: '#ed6c02', fontWeight: 600 }} />
                    <Chip size="small" label={q.difficulty} sx={{ bgcolor: theme.tintBg, color: theme.color, border: `1px solid ${theme.border}`, fontWeight: 700 }} />
                  </Box>
                  <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                    <Chip size="small" label={`Lượt làm: ${s.totalAttempts}`} sx={{ bgcolor: '#f6f7f9', color: 'text.secondary' }} />
                    <Chip size="small" label={`TB: ${s.averageScore}%`} sx={{ bgcolor: '#f9f5e7', color: '#8d6e63' }} />
                    <Chip size="small" label={`Đạt: ${s.passRate}%`} sx={{ bgcolor: '#eef7f0', color: '#2e7d32' }} />
                  </Box>
                </CardContent>
                <Box sx={{ p:2, display:'flex', justifyContent:'flex-end' }}>
                  <Button variant="contained" onClick={()=>navigate(`/quizzes/take/${q.id}`)}>
                    Bắt đầu
                  </Button>
                </Box>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  );
};

export default QuizzesIndex;
