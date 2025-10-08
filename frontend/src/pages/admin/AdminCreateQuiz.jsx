import React from 'react';
import { quizService } from '../../shared/services/quizService';
import { lessonsData } from '../../data/lessonsData';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, Grid, TextField, Button, 
  Select, MenuItem, InputLabel, FormControl, Divider, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack, Quiz } from '@mui/icons-material';

const empty = { title:'', description:'', difficulty:'Cơ bản', timeLimit:15, lessonId:'', questions:[] };
const emptyQuestion = { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };

const AdminCreateQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = React.useState(empty);
  const [questionDialog, setQuestionDialog] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState(emptyQuestion);
  const [editingQuestionIndex, setEditingQuestionIndex] = React.useState(-1);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [existingQuizzes, setExistingQuizzes] = React.useState([]);
  const [editingQuizId, setEditingQuizId] = React.useState(null);

  // Load existing quizzes on component mount
  React.useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    setExistingQuizzes(quizService.getQuizzes());
  };

  const save = () => {
    if (!form.title || form.questions.length === 0) {
      alert('Vui lòng nhập tiêu đề và thêm ít nhất 1 câu hỏi');
      return;
    }
    const payload = { 
      ...form, 
      lessonId: form.lessonId ? Number(form.lessonId) : undefined,
      createdBy: user?.id, 
      createdByRole: 'admin' 
    };
    
    if (editingQuizId) {
      // Update existing quiz
      quizService.updateQuiz(editingQuizId, payload);
      setSuccessMessage('Cập nhật quiz thành công!');
      setEditingQuizId(null);
    } else {
      // Create new quiz
      quizService.createQuiz(payload);
      setSuccessMessage('Tạo quiz thành công!');
    }
    
    setForm(empty);
    loadQuizzes();
    
    // Auto hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const editExistingQuiz = (quiz) => {
    setForm({
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      lessonId: quiz.lessonId || '',
      questions: quiz.questions || []
    });
    setEditingQuizId(quiz.id);
    setSuccessMessage('');
  };

  const deleteQuiz = (quizId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quiz này?')) {
      quizService.deleteQuiz(quizId);
      loadQuizzes();
      setSuccessMessage('Xóa quiz thành công!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  const cancelEdit = () => {
    setForm(empty);
    setEditingQuizId(null);
    setSuccessMessage('');
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/quizzes')}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Quiz (Admin)
        </Typography>
      </Box>

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side - Create Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                {editingQuizId ? 'Chỉnh sửa quiz' : 'Thông tin quiz mới'}
              </Typography>
              {editingQuizId && (
                <Button size="small" onClick={cancelEdit} color="secondary">
                  Hủy chỉnh sửa
                </Button>
              )}
            </Box>
            
            <TextField 
              fullWidth 
              label="Tiêu đề quiz" 
              placeholder="Nhập tiêu đề quiz..."
              sx={{ mb: 2 }} 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
            />
            
            <TextField 
              fullWidth 
              label="Mô tả" 
              placeholder="Mô tả ngắn về quiz..."
              multiline
              rows={3}
              sx={{ mb: 2 }} 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Độ khó</InputLabel>
              <Select value={form.difficulty} label="Độ khó" onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                <MenuItem value="Trung bình">Trung bình</MenuItem>
                <MenuItem value="Nâng cao">Nâng cao</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              fullWidth 
              type="number" 
              label="Thời gian (phút)" 
              sx={{ mb: 2 }} 
              value={form.timeLimit} 
              onChange={e => setForm(f => ({ ...f, timeLimit: Number(e.target.value) }))} 
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Bài học (tùy chọn)</InputLabel>
              <Select value={form.lessonId} label="Bài học (tùy chọn)" onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}>
                <MenuItem value="">-- Không gắn bài học --</MenuItem>
                {lessonsData.map(l => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.title.substring(0, 50)}{l.title.length > 50 ? '...' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Questions Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Câu hỏi ({form.questions.length})
              </Typography>
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
            
            <Button 
              variant="contained" 
              size="large"
              fullWidth 
              onClick={save} 
              disabled={!form.title || form.questions.length === 0}
              sx={{ mt: 2 }}
            >
              {editingQuizId ? 'Cập nhật Quiz' : 'Tạo Quiz Mới'}
            </Button>
          </Paper>
        </Grid>
        
        {/* Right Side - Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Xem trước quiz
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {form.title || 'Tiêu đề quiz...'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {form.description || 'Mô tả quiz...'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={form.difficulty} size="small" color="primary" />
                <Chip label={`${form.timeLimit} phút`} size="small" />
                <Chip label={`${form.questions.length} câu hỏi`} size="small" />
                {form.lessonId && (
                  <Chip 
                    label={`Bài học: ${lessonsData.find(l => l.id === Number(form.lessonId))?.title?.substring(0, 20)}...`} 
                    size="small" 
                    color="secondary" 
                  />
                )}
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Danh sách câu hỏi:
            </Typography>
            
            {form.questions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Chưa có câu hỏi nào...
              </Typography>
            ) : (
              form.questions.slice(0, 5).map((q, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Câu {index + 1}: {q.text}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Đáp án đúng: {String.fromCharCode(65 + q.correctIndex)} - {q.options[q.correctIndex]}
                  </Typography>
                </Box>
              ))
            )}
            
            {form.questions.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                ...và {form.questions.length - 5} câu hỏi khác
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Existing Quizzes List */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Danh sách Quiz đã tạo ({existingQuizzes.length})
        </Typography>
        
        {existingQuizzes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Chưa có quiz nào được tạo
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {existingQuizzes.map((quiz) => (
              <Grid key={quiz.id} item xs={12}>
                <Card 
                  elevation={editingQuizId === quiz.id ? 3 : 1}
                  sx={{ 
                    border: editingQuizId === quiz.id ? '2px solid' : 'none',
                    borderColor: editingQuizId === quiz.id ? 'primary.main' : 'transparent'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {quiz.title}
                          {editingQuizId === quiz.id && (
                            <Chip label="Đang chỉnh sửa" size="small" color="primary" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {quiz.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip label={quiz.difficulty} size="small" />
                          <Chip label={`${quiz.timeLimit} phút`} size="small" />
                          <Chip label={`${quiz.questions?.length || 0} câu hỏi`} size="small" />
                          {quiz.lessonId && (
                            <Chip 
                              label={`Bài học #${quiz.lessonId}`} 
                              size="small" 
                              color="secondary" 
                            />
                          )}
                          <Chip 
                            label={`Tạo: ${new Date(quiz.createdAt).toLocaleDateString('vi-VN')}`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => editExistingQuiz(quiz)}
                            disabled={editingQuizId === quiz.id}
                          >
                            {editingQuizId === quiz.id ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Delete />}
                            color="error"
                            onClick={() => deleteQuiz(quiz.id)}
                          >
                            Xóa
                          </Button>
                        </Box>
                      </Box>
                      <Quiz color="action" sx={{ ml: 2 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

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

export default AdminCreateQuiz;