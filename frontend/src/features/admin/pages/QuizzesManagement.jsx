import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  RemoveCircle as RemoveIcon
} from '@mui/icons-material';
import Radio from '@mui/material/Radio';
import { quizManagementService, lessonService } from '../../../shared/services/managementService';

const ASSESSMENT_TYPES = [
  {
    value: 'quiz',
    label: 'Quiz trắc nghiệm (1 đáp án)',
    description: 'Câu hỏi trắc nghiệm với một đáp án đúng duy nhất.',
    accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    value: 'multi_choice',
    label: 'Trắc nghiệm nhiều đáp án',
    description: 'Cho phép chọn nhiều đáp án đúng bằng ô vuông.',
    accent: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
  },
  {
    value: 'fill_blank',
    label: 'Điền vào chỗ trống',
    description: 'Học sinh nhập câu trả lời, hỗ trợ nhiều đáp án đúng.',
    accent: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
  }
];

const createEmptyQuestion = (type) => {
  if (type === 'fill_blank') {
    return {
      questionText: '',
      questionType: 'fill_blank',
      points: 1,
      acceptedAnswers: [''],
      explanation: ''
    };
  }

  const defaultAnswers = [
    { answerText: '', isCorrect: type === 'quiz' },
    { answerText: '', isCorrect: false }
  ];

  return {
    questionText: '',
    questionType: type === 'multi_choice' ? 'multi_select' : 'single_choice',
    points: 1,
    answers: defaultAnswers,
    explanation: ''
  };
};

const normalizeAssessmentType = (value) => {
  const lower = String(value || '').toLowerCase();
  return ASSESSMENT_TYPES.some(t => t.value === lower) ? lower : 'quiz';
};

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
    assessmentType: 'quiz',
    questions: [createEmptyQuestion('quiz')]
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
      const details = e.response?.data?.error || e.message;
      console.error('Không thể tải danh sách bài kiểm tra', e);
      setError('Không thể tải dữ liệu: ' + details);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (type = 'quiz') => ({
    title: '',
    description: '',
    lessonId: null,
    assessmentType: normalizeAssessmentType(type),
    questions: [createEmptyQuestion(type)]
  });

  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setFormData(resetForm('quiz'));
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingQuiz(null);
  };

  const handleAssessmentTypeChange = (nextType) => {
    setFormData(prev => ({
      ...resetForm(nextType),
      title: prev.title,
      description: prev.description,
      lessonId: prev.lessonId
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(prev.assessmentType)]
    }));
  };

  const removeQuestion = (idx) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const updateQuestionField = (idx, field, value) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      clone[idx] = { ...clone[idx], [field]: value };
      return { ...prev, questions: clone };
    });
  };

  const updateAnswerField = (qIdx, aIdx, field, value) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const answers = [...(clone[qIdx].answers || [])];
      answers[aIdx] = { ...answers[aIdx], [field]: value };
      clone[qIdx] = { ...clone[qIdx], answers };
      return { ...prev, questions: clone };
    });
  };

  const addChoiceAnswer = (qIdx) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const answers = [...(clone[qIdx].answers || [])];
      answers.push({ answerText: '', isCorrect: false });
      clone[qIdx] = { ...clone[qIdx], answers };
      return { ...prev, questions: clone };
    });
  };

  const removeChoiceAnswer = (qIdx, aIdx) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const answers = [...(clone[qIdx].answers || [])].filter((_, i) => i !== aIdx);
      clone[qIdx] = { ...clone[qIdx], answers };
      return { ...prev, questions: clone };
    });
  };

  const toggleCorrectAnswer = (qIdx, aIdx, checked) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const question = { ...clone[qIdx] };
      const isMulti = question.questionType === 'multi_select';
      const answers = [...(question.answers || [])].map((ans, idx) => {
        if (isMulti) {
          return idx === aIdx ? { ...ans, isCorrect: checked } : ans;
        }
        return { ...ans, isCorrect: idx === aIdx };
      });
      clone[qIdx] = { ...question, answers };
      return { ...prev, questions: clone };
    });
  };

  const addAcceptedAnswer = (qIdx) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const accepted = [...(clone[qIdx].acceptedAnswers || [])];
      accepted.push('');
      clone[qIdx] = { ...clone[qIdx], acceptedAnswers: accepted };
      return { ...prev, questions: clone };
    });
  };

  const removeAcceptedAnswer = (qIdx, aIdx) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const accepted = [...(clone[qIdx].acceptedAnswers || [])].filter((_, i) => i !== aIdx);
      clone[qIdx] = { ...clone[qIdx], acceptedAnswers: accepted.length ? accepted : [''] };
      return { ...prev, questions: clone };
    });
  };

  const updateAcceptedAnswer = (qIdx, aIdx, value) => {
    setFormData(prev => {
      const clone = [...prev.questions];
      const accepted = [...(clone[qIdx].acceptedAnswers || [])];
      accepted[aIdx] = value;
      clone[qIdx] = { ...clone[qIdx], acceptedAnswers: accepted };
      return { ...prev, questions: clone };
    });
  };

  const preparedQuestions = useMemo(() => formData.questions.map(q => ({ ...q })), [formData.questions]);

  const handleSave = async () => {
    try {
      setError('');
      const trimmedTitle = formData.title.trim();
      if (!trimmedTitle) {
        setError('Vui lòng nhập tiêu đề bài kiểm tra');
        return;
      }

      if (!formData.questions.length) {
        setError('Cần có ít nhất 1 câu hỏi');
        return;
      }

      const assessmentType = normalizeAssessmentType(formData.assessmentType);
      const normalizedQuestions = preparedQuestions.map((q, idx) => {
        const questionText = String(q.questionText || '').trim();
        if (!questionText) {
          throw new Error(`Câu hỏi #${idx + 1} chưa có nội dung`);
        }

        const points = Number.isFinite(Number(q.points)) && Number(q.points) > 0 ? Number(q.points) : 1;

        if (assessmentType === 'fill_blank') {
          const acceptedAnswers = (q.acceptedAnswers || [])
            .map(ans => String(ans || '').trim())
            .filter(Boolean);
          if (!acceptedAnswers.length) {
            throw new Error(`Câu hỏi #${idx + 1} cần ít nhất 1 đáp án đúng`);
          }
          return {
            questionText,
            questionType: 'fill_blank',
            acceptedAnswers,
            points,
            explanation: q.explanation || ''
          };
        }

        const answers = (q.answers || [])
          .map(ans => ({
            answerText: String(ans.answerText || '').trim(),
            isCorrect: Boolean(ans.isCorrect)
          }))
          .filter(ans => ans.answerText);

        if (answers.length < 2) {
          throw new Error(`Câu hỏi #${idx + 1} cần ít nhất 2 đáp án`);
        }

        if (assessmentType === 'quiz') {
          if (!answers.some(ans => ans.isCorrect)) {
            answers[0] = { ...answers[0], isCorrect: true };
          }
          const correctIndex = answers.findIndex(ans => ans.isCorrect);
          return {
            questionText,
            questionType: 'single_choice',
            answers,
            correctIndex,
            points,
            explanation: q.explanation || ''
          };
        }

        if (!answers.some(ans => ans.isCorrect)) {
          answers[0] = { ...answers[0], isCorrect: true };
        }
        const correctIndexes = answers
          .map((ans, i) => (ans.isCorrect ? i : null))
          .filter(i => i !== null);
        return {
          questionText,
          questionType: 'multi_select',
          answers,
          correctIndexes,
          points,
          explanation: q.explanation || ''
        };
      });

      const payload = {
        title: trimmedTitle,
        description: formData.description,
        lessonId: formData.lessonId || null,
        assessmentType,
        questions: normalizedQuestions
      };

      if (editingQuiz) {
        await quizManagementService.update(editingQuiz.quiz_id, payload);
        setSuccess('Cập nhật bài kiểm tra thành công!');
      } else {
        await quizManagementService.create(payload);
        setSuccess('Tạo bài kiểm tra thành công!');
      }

      handleClose();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài kiểm tra này?')) return;
    try {
      await quizManagementService.delete(quizId);
      setSuccess('Đã xóa bài kiểm tra');
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
          Quản lý Bài kiểm tra
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} size="large">
          Tạo bài kiểm tra
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bài học</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Người tạo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Chưa có bài kiểm tra nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => {
                const assessment = normalizeAssessmentType(quiz.assessment_type);
                const typeMeta = ASSESSMENT_TYPES.find(t => t.value === assessment);
                return (
                  <TableRow key={quiz.quiz_id} hover>
                    <TableCell>{quiz.quiz_id}</TableCell>
                    <TableCell><strong>{quiz.title}</strong></TableCell>
                    <TableCell>
                      <Chip
                        label={typeMeta?.label || 'Quiz'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                        color={assessment === 'quiz' ? 'primary' : assessment === 'multi_choice' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      {quiz.lesson_id ? (
                        <Chip label={quiz.lesson_title || `Lesson #${quiz.lesson_id}`} size="small" />
                      ) : (
                        <Chip label="Bài kiểm tra độc lập" color="info" size="small" />
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingQuiz ? 'Chỉnh sửa bài kiểm tra' : 'Tạo bài kiểm tra mới'}
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#fafbff' }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề bài kiểm tra"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Gắn vào bài học (tùy chọn)</InputLabel>
              <Select
                value={formData.lessonId || ''}
                label="Gắn vào bài học (tùy chọn)"
                onChange={(e) => setFormData(prev => ({ ...prev, lessonId: e.target.value || null }))}
              >
                <MenuItem value="">— Bài kiểm tra độc lập —</MenuItem>
                {lessons.map(l => (
                  <MenuItem key={l.lesson_id} value={l.lesson_id}>{l.title}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />
            <Typography variant="h6" fontWeight="bold">Chọn loại bài kiểm tra</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {ASSESSMENT_TYPES.map(type => {
                const selected = formData.assessmentType === type.value;
                return (
                  <Card
                    key={type.value}
                    onClick={() => handleAssessmentTypeChange(type.value)}
                    sx={{
                      cursor: 'pointer',
                      flex: 1,
                      borderRadius: 3,
                      border: selected ? '2px solid transparent' : '1px solid rgba(0,0,0,0.08)',
                      background: selected ? type.accent : 'white',
                      color: selected ? 'white' : 'inherit',
                      boxShadow: selected ? '0 10px 30px rgba(0,0,0,0.12)' : 'none',
                      transition: 'all .2s ease',
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: selected ? 0.9 : 0.7 }}>
                        {type.description}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

            <Divider />
            <Typography variant="h6" fontWeight="bold">Câu hỏi</Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.assessmentType === 'fill_blank'
                ? 'Nhập câu hỏi và các đáp án hợp lệ mà hệ thống sẽ chấp nhận.'
                : formData.assessmentType === 'multi_choice'
                  ? 'Mỗi câu hỏi có thể có nhiều đáp án đúng, chọn bằng ô vuông.'
                  : 'Mỗi câu hỏi cần ít nhất 2 đáp án và chỉ một đáp án đúng.'}
            </Typography>

            {formData.questions.map((q, qIdx) => {
              const isFillBlank = formData.assessmentType === 'fill_blank';
              const isMulti = formData.assessmentType === 'multi_choice';
              return (
                <Card key={qIdx} variant="outlined" sx={{ borderRadius: 2, boxShadow: '0 6px 16px rgba(24,63,122,0.06)' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight="bold">
                          Câu hỏi {qIdx + 1}
                        </Typography>
                        {formData.questions.length > 1 && (
                          <Tooltip title="Xóa câu hỏi">
                            <IconButton size="small" color="error" onClick={() => removeQuestion(qIdx)}>
                              <RemoveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      <TextField
                        label="Nội dung câu hỏi"
                        fullWidth
                        multiline
                        rows={2}
                        value={q.questionText}
                        onChange={(e) => updateQuestionField(qIdx, 'questionText', e.target.value)}
                      />

                      <TextField
                        label="Điểm"
                        type="number"
                        sx={{ width: 140 }}
                        value={q.points}
                        onChange={(e) => updateQuestionField(qIdx, 'points', parseInt(e.target.value, 10) || 1)}
                      />

                      {isFillBlank ? (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" fontWeight="bold">Các đáp án chấp nhận</Typography>
                          {(q.acceptedAnswers || ['']).map((ans, idx) => (
                            <Stack direction="row" spacing={1} alignItems="center" key={idx}>
                              <TextField
                                placeholder={`Đáp án hợp lệ #${idx + 1}`}
                                fullWidth
                                value={ans}
                                onChange={(e) => updateAcceptedAnswer(qIdx, idx, e.target.value)}
                              />
                              {(q.acceptedAnswers || []).length > 1 && (
                                <IconButton size="small" onClick={() => removeAcceptedAnswer(qIdx, idx)}>
                                  <RemoveIcon />
                                </IconButton>
                              )}
                            </Stack>
                          ))}
                          <Button variant="outlined" size="small" onClick={() => addAcceptedAnswer(qIdx)}>
                            + Thêm đáp án chấp nhận
                          </Button>
                        </Stack>
                      ) : (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" fontWeight="bold">Danh sách đáp án</Typography>
                          {(q.answers || []).map((ans, aIdx) => (
                            <Stack key={aIdx} direction="row" spacing={1} alignItems="center">
                              {isMulti ? (
                                <Checkbox
                                  checked={Boolean(ans.isCorrect)}
                                  onChange={(e) => toggleCorrectAnswer(qIdx, aIdx, e.target.checked)}
                                />
                              ) : (
                                <Radio
                                  checked={Boolean(ans.isCorrect)}
                                  onChange={() => toggleCorrectAnswer(qIdx, aIdx, true)}
                                />
                              )}
                              <TextField
                                placeholder={`Đáp án ${aIdx + 1}`}
                                fullWidth
                                value={ans.answerText}
                                onChange={(e) => updateAnswerField(qIdx, aIdx, 'answerText', e.target.value)}
                              />
                              {(q.answers || []).length > 2 && (
                                <IconButton size="small" onClick={() => removeChoiceAnswer(qIdx, aIdx)}>
                                  <RemoveIcon />
                                </IconButton>
                              )}
                            </Stack>
                          ))}
                          <Button variant="outlined" size="small" onClick={() => addChoiceAnswer(qIdx)}>
                            + Thêm đáp án
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            <Button variant="contained" color="primary" onClick={addQuestion} sx={{ alignSelf: 'flex-start' }}>
              + Thêm câu hỏi
            </Button>
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
