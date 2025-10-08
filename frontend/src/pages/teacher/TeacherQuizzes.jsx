import React from 'react';
import { quizService } from '../../shared/services/quizService';
import { useAuth } from '@features/auth/hooks/useAuth';
import { 
  Box, Container, Typography, Paper, Grid, Card, CardContent, TextField, Button, 
  Select, MenuItem, InputLabel, FormControl, Divider, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import { Add, Edit, Delete, Quiz } from '@mui/icons-material';

const empty = { title:'', description:'', difficulty:'Cơ bản', timeLimit:15, questions:[] };
const emptyQuestion = { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };

const TeacherQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = React.useState([]);
  const [form, setForm] = React.useState(empty);
  const [questionDialog, setQuestionDialog] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState(emptyQuestion);
  const [editingQuestionIndex, setEditingQuestionIndex] = React.useState(-1);

  const load = () => setQuizzes(quizService.getQuizzes());
  React.useEffect(load, []);

  const save = () => {
    if (!form.title || form.questions.length === 0) {
      alert('Vui lòng nhập tiêu đề và thêm ít nhất 1 câu hỏi');
      return;
    }
    quizService.createQuiz({ ...form, createdBy: user?.id, createdByRole: 'teacher' });
    setForm(empty);
    load();
  };

  const addQuestion = () => {
    setCurrentQuestion(emptyQuestion);
    setEditingQuestionIndex(-1);
    setQuestionDialog(true);
  };

  const editQuestion = (index) => {
    setCurrentQuestion(form.questions[index]);
    setEditingQuestionIndex(index);
    setQuestionDialog(true);
  };

  const saveQuestion = () => {
    if (!currentQuestion.text || currentQuestion.options.some(opt => !opt.trim())) {
      alert('Vui lòng điền đầy đủ câu hỏi và tất cả đáp án');
      return;
    }
    
    const newQuestions = [...form.questions];
    if (editingQuestionIndex >= 0) {
      newQuestions[editingQuestionIndex] = { ...currentQuestion, id: Date.now() };
    } else {
      newQuestions.push({ ...currentQuestion, id: Date.now() });
    }
    setForm(f => ({ ...f, questions: newQuestions }));
    setQuestionDialog(false);
    setCurrentQuestion(emptyQuestion);
  };

  const removeQuestion = (index) => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== index) }));
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
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Câu hỏi ({form.questions.length})</Typography>
              <Button variant="outlined" size="small" startIcon={<Add />} onClick={addQuestion}>
                Thêm câu hỏi
              </Button>
            </Box>
            
            {form.questions.map((q, index) => (
              <Paper key={index} elevation={1} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  Câu {index + 1}: {q.text.substring(0, 50)}...
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => editQuestion(index)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => removeQuestion(index)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
            
            <Button variant="contained" fullWidth onClick={save} disabled={!form.title || form.questions.length === 0}>
              Lưu Quiz
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Danh sách Quiz đã tạo</Typography>
          <Grid container spacing={2}>
            {quizzes.map(q => (
              <Grid key={q.id} item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">{q.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {q.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={q.difficulty} size="small" />
                          <Chip label={`${q.timeLimit} phút`} size="small" />
                          <Chip label={`${q.questions?.length || 0} câu hỏi`} size="small" />
                        </Box>
                      </Box>
                      <Quiz color="action" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Question Dialog */}
      <Dialog open={questionDialog} onClose={() => setQuestionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestionIndex >= 0 ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Câu hỏi"
            multiline
            rows={2}
            sx={{ mb: 2 }}
            value={currentQuestion.text}
            onChange={e => setCurrentQuestion(q => ({ ...q, text: e.target.value }))}
          />
          
          {currentQuestion.options.map((option, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 20 }}>
                {String.fromCharCode(65 + index)}.
              </Typography>
              <TextField
                fullWidth
                label={`Đáp án ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={e => {
                  const newOptions = [...currentQuestion.options];
                  newOptions[index] = e.target.value;
                  setCurrentQuestion(q => ({ ...q, options: newOptions }));
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: currentQuestion.correctIndex === index ? 'success.light' : 'inherit'
                  }
                }}
              />
              <Button
                size="small"
                variant={currentQuestion.correctIndex === index ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setCurrentQuestion(q => ({ ...q, correctIndex: index }))}
              >
                Đúng
              </Button>
            </Box>
          ))}
          
          <TextField
            fullWidth
            label="Giải thích (tùy chọn)"
            multiline
            rows={2}
            sx={{ mt: 2 }}
            value={currentQuestion.explanation}
            onChange={e => setCurrentQuestion(q => ({ ...q, explanation: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialog(false)}>Hủy</Button>
          <Button onClick={saveQuestion} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherQuizzes;
