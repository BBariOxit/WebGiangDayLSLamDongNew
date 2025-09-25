import React from 'react';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const empty = { title:'', description:'', difficulty:'Cơ bản', timeLimit:15, questions:[] };

const TeacherQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = React.useState([]);
  const [form, setForm] = React.useState(empty);

  const load = () => setQuizzes(quizService.getQuizzes());
  React.useEffect(load, []);

  const save = () => {
    quizService.createQuiz({ ...form, createdBy: user?.id, createdByRole: 'teacher' });
    setForm(empty);
    load();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Quản lý Quiz (Giáo viên)</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p:3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Tạo quiz mới</Typography>
            <TextField fullWidth label="Tiêu đề" sx={{ mb:2 }} value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} />
            <TextField fullWidth label="Mô tả" sx={{ mb:2 }} value={form.description} onChange={e=>setForm(f=>({...f, description:e.target.value}))} />
            <FormControl fullWidth sx={{ mb:2 }}>
              <InputLabel>Độ khó</InputLabel>
              <Select value={form.difficulty} label="Độ khó" onChange={e=>setForm(f=>({...f, difficulty:e.target.value}))}>
                <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                <MenuItem value="Trung bình">Trung bình</MenuItem>
                <MenuItem value="Nâng cao">Nâng cao</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth type="number" label="Thời gian (phút)" sx={{ mb:2 }} value={form.timeLimit} onChange={e=>setForm(f=>({...f, timeLimit:Number(e.target.value)}))} />
            <Button variant="contained" onClick={save}>Lưu</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {quizzes.map(q => (
              <Grid key={q.id} item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">{q.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{q.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherQuizzes;
