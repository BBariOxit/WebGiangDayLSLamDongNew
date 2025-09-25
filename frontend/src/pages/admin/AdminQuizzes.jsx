import React from 'react';
import { quizService } from '../../services/quizService';
import { lessonsData } from '../../data/lessonsData';
import { Box, Container, Typography, Grid, Paper, Chip, TextField, Button, Select, MenuItem, FormControl, InputLabel, Divider, IconButton } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';

const empty = { title:'', description:'', difficulty:'Cơ bản', timeLimit:15, lessonId:'', questions:[] };
const emptyQuestion = { text:'', options:['','','',''], correctIndex:0, explanation:'' };

const AdminQuizzes = () => {
  const [stats, setStats] = React.useState(quizService.getGlobalStats());
  const [quizzes, setQuizzes] = React.useState(quizService.getQuizzes());
  const [form, setForm] = React.useState(empty);
  const [questionEditingIndex, setQuestionEditingIndex] = React.useState(-1);
  const [questionDraft, setQuestionDraft] = React.useState(emptyQuestion);

  const reload = () => {
    setQuizzes(quizService.getQuizzes());
    setStats(quizService.getGlobalStats());
  };

  const resetQuestion = () => { setQuestionDraft(emptyQuestion); setQuestionEditingIndex(-1); };

  const addQuestion = () => { resetQuestion(); setQuestionEditingIndex(form.questions.length); };
  const editQuestion = (idx) => { setQuestionEditingIndex(idx); setQuestionDraft(form.questions[idx]); };
  const removeQuestion = (idx) => { setForm(f => ({ ...f, questions: f.questions.filter((_,i)=>i!==idx) })); if (questionEditingIndex===idx) resetQuestion(); };
  const saveQuestion = () => {
    if (!questionDraft.text || questionDraft.options.some(o=>!o.trim())) { alert('Điền đầy đủ câu hỏi & đáp án'); return; }
    setForm(f => {
      const qs = [...f.questions];
      if (questionEditingIndex >= 0 && questionEditingIndex < qs.length) {
        qs[questionEditingIndex] = { ...questionDraft, id: qs[questionEditingIndex].id || Date.now() };
      } else {
        qs.push({ ...questionDraft, id: Date.now() });
      }
      return { ...f, questions: qs };
    });
    resetQuestion();
  };

  const saveQuiz = () => {
    if (!form.title || form.questions.length === 0) { alert('Thiếu tiêu đề hoặc câu hỏi'); return; }
    const payload = { ...form, lessonId: form.lessonId ? Number(form.lessonId) : undefined };
    quizService.createQuiz(payload);
    setForm(empty);
    reload();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Quản trị Quiz (Admin)</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:3, textAlign:'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.totalQuizzes}</Typography>
            <Typography>Tổng Quiz</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:3, textAlign:'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">{stats.totalAttempts}</Typography>
            <Typography>Tổng lượt làm</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:3, textAlign:'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">{stats.averageScore}%</Typography>
            <Typography>Điểm trung bình</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p:3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Tạo / Chỉnh sửa Quiz</Typography>
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
            <TextField fullWidth type="number" label="Thời gian (phút)" sx={{ mb:2 }} value={form.timeLimit} onChange={e=>setForm(f=>({...f, timeLimit:Number(e.target.value)||0}))} />
            <FormControl fullWidth sx={{ mb:2 }}>
              <InputLabel>Bài học (tuỳ chọn)</InputLabel>
              <Select value={form.lessonId} label="Bài học (tuỳ chọn)" onChange={e=>setForm(f=>({...f, lessonId:e.target.value}))}>
                <MenuItem value="">Không gắn bài học</MenuItem>
                {lessonsData.map(l => <MenuItem key={l.id} value={l.id}>{l.title}</MenuItem>)}
              </Select>
            </FormControl>
            <Divider sx={{ my:2 }} />
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
              <Typography variant="subtitle1" fontWeight="bold">Câu hỏi ({form.questions.length})</Typography>
              <Button size="small" variant="outlined" startIcon={<Add/>} onClick={addQuestion}>Thêm</Button>
            </Box>
            {form.questions.map((q,i)=>(
              <Paper key={q.id||i} sx={{ p:1, mb:1, bgcolor:'grey.50', display:'flex', alignItems:'center', gap:1 }}>
                <Typography variant="body2" sx={{ flex:1 }}>{i+1}. {q.text.slice(0,50)}{q.text.length>50?'...':''}</Typography>
                <IconButton size="small" onClick={()=>editQuestion(i)}><Edit fontSize="small"/></IconButton>
                <IconButton size="small" color="error" onClick={()=>removeQuestion(i)}><Delete fontSize="small"/></IconButton>
              </Paper>
            ))}
            {questionEditingIndex !== -1 && (
              <Box sx={{ mt:2, p:2, border:'1px solid #ddd', borderRadius:2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb:1 }}>{questionEditingIndex < form.questions.length ? 'Sửa câu hỏi' : 'Câu hỏi mới'}</Typography>
                <TextField fullWidth label="Câu hỏi" multiline rows={2} sx={{ mb:2 }} value={questionDraft.text} onChange={e=>setQuestionDraft(q=>({...q,text:e.target.value}))} />
                {questionDraft.options.map((opt,idx)=>(
                  <Box key={idx} sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                    <TextField fullWidth label={`Đáp án ${String.fromCharCode(65+idx)}`} value={opt} onChange={e=>{
                      const arr=[...questionDraft.options]; arr[idx]=e.target.value; setQuestionDraft(q=>({...q, options:arr}));
                    }} sx={{ '& .MuiInputBase-root': { bgcolor: questionDraft.correctIndex===idx?'success.light':'inherit' } }} />
                    <Button size="small" variant={questionDraft.correctIndex===idx?'contained':'outlined'} color="success" onClick={()=>setQuestionDraft(q=>({...q, correctIndex:idx}))}>Đúng</Button>
                  </Box>
                ))}
                <TextField fullWidth label="Giải thích" multiline rows={2} sx={{ mt:1, mb:2 }} value={questionDraft.explanation} onChange={e=>setQuestionDraft(q=>({...q, explanation:e.target.value}))} />
                <Box sx={{ display:'flex', gap:1 }}>
                  <Button variant="outlined" size="small" onClick={resetQuestion}>Hủy</Button>
                  <Button variant="contained" size="small" onClick={saveQuestion}>Lưu câu hỏi</Button>
                </Box>
              </Box>
            )}
            <Button variant="contained" fullWidth sx={{ mt:2 }} disabled={!form.title||form.questions.length===0} onClick={saveQuiz}>Lưu Quiz</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>Danh sách Quiz</Typography>
          <Grid container spacing={2}>
            {quizzes.map(q => (
              <Grid item xs={12} key={q.id}>
                <Paper sx={{ p:2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{q.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{q.description}</Typography>
                  </Box>
                  <Box sx={{ display:'flex', gap:1 }}>
                    <Chip label={q.difficulty} />
                    <Chip label={`${q.questions?.length||0} câu`} />
                    <Chip label={`${q.timeLimit} phút`} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminQuizzes;
