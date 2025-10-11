import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, Stack,
  Tooltip, Select, MenuItem, FormControl, InputLabel, Card, CardContent,
  Divider, Radio, RadioGroup, FormControlLabel, FormLabel
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Quiz as QuizIcon, RemoveCircle as RemoveIcon
} from '@mui/icons-material';
import { quizManagementService, lessonService } from '../../../shared/services/managementService';

const QuizzesManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessonId: null,
    questions: [
      {
        questionText: '',
        questionType: 'multiple_choice',
        points: 1,
        answers: [
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false }
        ]
      }
    ]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, lessonRes] = await Promise.all([
        quizManagementService.list(),
        lessonService.list()
      ]);
  setQuizzes(quizRes.data || []);
      setLessons(lessonRes.data || []);
    } catch (e) {
      setError('Không thể tải dữ liệu: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setFormData({
      title: '',
      description: '',
      lessonId: null,
      questions: [{
        questionText: '',
        questionType: 'multiple_choice',
        points: 1,
        answers: [
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false }
        ]
      }]
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingQuiz(null);
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          questionType: 'multiple_choice',
          points: 1,
          answers: [
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false }
          ]
        }
      ]
    });
  };

  const removeQuestion = (idx) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== idx)
    });
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...formData.questions];
    updated[idx][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const addAnswer = (qIdx) => {
    const updated = [...formData.questions];
    updated[qIdx].answers.push({ answerText: '', isCorrect: false });
    setFormData({ ...formData, questions: updated });
  };

  const removeAnswer = (qIdx, aIdx) => {
    const updated = [...formData.questions];
    updated[qIdx].answers = updated[qIdx].answers.filter((_, i) => i !== aIdx);
    setFormData({ ...formData, questions: updated });
  };

  const updateAnswer = (qIdx, aIdx, field, value) => {
    const updated = [...formData.questions];
    updated[qIdx].answers[aIdx][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleSave = async () => {
    try {
      setError('');
      if (!formData.title.trim()) {
        setError('Vui lòng nhập tiêu đề quiz');
        return;
      }

      if (formData.questions.length === 0) {
        setError('Cần có ít nhất 1 câu hỏi');
        return;
      }

      for (let q of formData.questions) {
        if (!q.questionText.trim()) {
          setError('Vui lòng nhập nội dung câu hỏi');
          return;
        }
        if (q.answers.length < 2) {
          setError('Mỗi câu hỏi cần ít nhất 2 đáp án');
          return;
        }
        if (!q.answers.some(a => a.isCorrect)) {
          setError('Mỗi câu hỏi cần có ít nhất 1 đáp án đúng');
          return;
        }
      }

      if (editingQuiz) {
        await quizManagementService.update(editingQuiz.question_id, formData);
        setSuccess('Cập nhật quiz thành công!');
      } else {
        await quizManagementService.create(formData);
        setSuccess('Tạo quiz thành công!');
      }

      handleClose();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Bạn có chắc muốn xóa quiz này?')) return;
    try {
      await quizManagementService.delete(quizId);
      setSuccess('Xóa quiz thành công!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Không thể xóa: ' + (e.response?.data?.error || e.message));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuizIcon fontSize="large" color="primary" />
          Quản lý Quiz
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} size="large">
          Tạo Quiz mới
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tiêu đề</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bài học</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người tạo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Chưa có quiz nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz.quiz_id} hover>
                  <TableCell>{quiz.quiz_id}</TableCell>
                  <TableCell><strong>{quiz.title}</strong></TableCell>
                  <TableCell>
                    {quiz.lesson_id ? (
                      <Chip label={quiz.lesson_title || `Lesson #${quiz.lesson_id}`} size="small" />
                    ) : (
                      <Chip label="Quiz độc lập" color="info" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{quiz.creator_name || '—'}</TableCell>
                  <TableCell>{new Date(quiz.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xóa">
                      <IconButton color="error" onClick={() => handleDelete(quiz.quiz_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingQuiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề Quiz"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Gắn vào Bài học (tùy chọn)</InputLabel>
              <Select
                value={formData.lessonId || ''}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value || null })}
                label="Gắn vào Bài học (tùy chọn)"
              >
                <MenuItem value="">-- Quiz độc lập --</MenuItem>
                {lessons.map(l => (
                  <MenuItem key={l.lesson_id} value={l.lesson_id}>{l.title}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />
            <Typography variant="h6">Câu hỏi</Typography>

            {formData.questions.map((q, qIdx) => (
              <Card key={qIdx} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Câu hỏi {qIdx + 1}
                      </Typography>
                      {formData.questions.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => removeQuestion(qIdx)}>
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Stack>
                    <TextField
                      label="Nội dung câu hỏi"
                      fullWidth
                      required
                      multiline
                      rows={2}
                      value={q.questionText}
                      onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                    />
                    <TextField
                      label="Điểm"
                      type="number"
                      value={q.points}
                      onChange={(e) => updateQuestion(qIdx, 'points', parseInt(e.target.value) || 1)}
                      sx={{ width: '120px' }}
                    />
                    <FormLabel>Đáp án</FormLabel>
                    {q.answers.map((ans, aIdx) => (
                      <Stack key={aIdx} direction="row" spacing={1} alignItems="center">
                        <FormControlLabel
                          control={
                            <Radio
                              checked={ans.isCorrect}
                              onChange={() => {
                                const updated = [...formData.questions];
                                updated[qIdx].answers.forEach((a, i) => a.isCorrect = i === aIdx);
                                setFormData({ ...formData, questions: updated });
                              }}
                            />
                          }
                          label=""
                        />
                        <TextField
                          placeholder={`Đáp án ${aIdx + 1}`}
                          fullWidth
                          value={ans.answerText}
                          onChange={(e) => updateAnswer(qIdx, aIdx, 'answerText', e.target.value)}
                        />
                        {q.answers.length > 2 && (
                          <IconButton size="small" onClick={() => removeAnswer(qIdx, aIdx)}>
                            <RemoveIcon />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    <Button size="small" onClick={() => addAnswer(qIdx)}>+ Thêm đáp án</Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Button variant="outlined" onClick={addQuestion}>+ Thêm câu hỏi</Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingQuiz ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizzesManagement;
