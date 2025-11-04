import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { quizApi } from '../../api/quizApi';
import {
  Box,
  Button,
  Chip,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

const QUESTION_TYPE_LABEL = {
  single_choice: 'Trắc nghiệm 1 đáp án',
  multi_select: 'Chọn nhiều đáp án',
  fill_blank: 'Điền vào chỗ trống'
};

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useAuth(); // ensure auth hook runs for protected routes

  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const meta = await quizApi.getPublicQuizById(id);
        if (!meta) throw new Error('Không tìm thấy bài kiểm tra');
        const bundle = await quizApi.getQuizQuestionsByQuizId(id);

        const hydrated = {
          id: meta.quiz_id,
          title: meta.title,
          description: meta.description,
          timeLimit: typeof meta.time_limit === 'number' ? meta.time_limit : null,
          lessonId: meta.lesson_id,
          assessmentType: meta.assessment_type || 'quiz',
          questions: (bundle?.questions || []).map((b, idx) => ({
            id: b.questionId || b.question_id || idx,
            text: b.questionText || b.question_text || 'Câu hỏi',
            options: Array.isArray(b.options) ? b.options : [],
            questionType: (b.questionType || b.question_type || 'single_choice').toLowerCase()
          }))
        };

        if (mounted) {
          setQuiz(hydrated);
          setTimeLeft(hydrated.timeLimit ? hydrated.timeLimit * 60 : 0);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải bài kiểm tra');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!timeLeft) return undefined;
    if (timeLeft <= 0) return undefined;
    const timer = setTimeout(() => setTimeLeft((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const buildPayloadAnswers = useCallback(() => {
    if (!quiz) return [];
    return quiz.questions.map((qq) => {
      const questionType = (qq.questionType || '').toLowerCase();
      const rawValue = answers[qq.id];

      if (questionType === 'multi_select') {
        const selected = Array.isArray(rawValue) ? rawValue : [];
        return {
          questionId: Number(qq.id),
          selectedAnswers: selected.map(Number).filter(Number.isFinite)
        };
      }

      if (questionType === 'fill_blank') {
        return {
          questionId: Number(qq.id),
          writtenAnswer: typeof rawValue === 'string' ? rawValue : ''
        };
      }

      return {
        questionId: Number(qq.id),
        selectedAnswers: rawValue !== undefined ? [Number(rawValue)] : []
      };
    });
  }, [quiz, answers]);

  useEffect(() => {
    if (!quiz || submitting) return;
    if (timeLeft !== 0) return;
    (async () => {
      try {
        setSubmitting(true);
        const result = await quizApi.submitAttemptByQuizId(quiz.id, buildPayloadAnswers());
        navigate(`/quizzes/results/${quiz.id}`, { state: { result, quiz } });
      } catch (err) {
        setError(err.message || 'Nộp bài thất bại');
        setSubmitting(false);
      }
    })();
  }, [timeLeft, quiz, submitting, buildPayloadAnswers, navigate]);

  const currentQuestion = useMemo(() => {
    if (!quiz) return null;
    return quiz.questions[index] || null;
  }, [quiz, index]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography>Đang tải bài kiểm tra...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!quiz || error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Typography>{error || 'Không tìm thấy bài kiểm tra.'}</Typography>
        </Paper>
      </Container>
    );
  }

  const progress = ((index + 1) / quiz.questions.length) * 100;
  const questionType = (currentQuestion?.questionType || 'single_choice').toLowerCase();
  const questionTypeLabel = QUESTION_TYPE_LABEL[questionType] || 'Trắc nghiệm';

  const handleSelectSingle = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleToggleMulti = (questionId, optionIndex, checked) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      if (checked) {
        if (!current.includes(optionIndex)) current.push(optionIndex);
      } else {
        const idx = current.indexOf(optionIndex);
        if (idx >= 0) current.splice(idx, 1);
      }
      return { ...prev, [questionId]: current };
    });
  };

  const handleChangeFillBlank = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const renderAnswerInputs = () => {
    if (!currentQuestion) return null;

    if (questionType === 'multi_select') {
      const selected = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
      return (
        <FormGroup>
          {(currentQuestion.options || []).map((opt, idx) => (
            <FormControlLabel
              key={idx}
              control={
                <Checkbox
                  checked={selected.includes(idx)}
                  onChange={(event) => handleToggleMulti(currentQuestion.id, idx, event.target.checked)}
                />
              }
              label={opt}
              sx={{ mb: 1 }}
            />
          ))}
        </FormGroup>
      );
    }

    if (questionType === 'fill_blank') {
      return (
        <TextField
          fullWidth
          placeholder="Nhập câu trả lời của bạn"
          value={answers[currentQuestion.id] ?? ''}
          onChange={(event) => handleChangeFillBlank(currentQuestion.id, event.target.value)}
        />
      );
    }

    return (
      <RadioGroup
        value={answers[currentQuestion.id] ?? ''}
        onChange={(event) => handleSelectSingle(currentQuestion.id, Number(event.target.value))}
      >
        {(currentQuestion.options || []).map((opt, idx) => (
          <FormControlLabel key={idx} value={idx} control={<Radio />} label={opt} sx={{ mb: 1 }} />
        ))}
      </RadioGroup>
    );
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      const result = await quizApi.submitAttemptByQuizId(quiz.id, buildPayloadAnswers());
      navigate(`/quizzes/results/${quiz.id}`, { state: { result, quiz } });
    } catch (err) {
      setError(err.message || 'Nộp bài thất bại');
      setSubmitting(false);
    }
  };

  const formattedTime = (seconds) => {
    if (!seconds || seconds < 0) return '00:00';
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">{quiz.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Câu {index + 1}/{quiz.questions.length}
            </Typography>
          </Box>
          {quiz.timeLimit ? (
            <Chip
              icon={<TimerIcon />}
              label={formattedTime(timeLeft)}
              color={timeLeft <= 60 ? 'error' : 'primary'}
            />
          ) : null}
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Paper>

      {quiz.description && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{quiz.description}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip size="small" label={questionTypeLabel} color="secondary" />
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {currentQuestion?.text}
        </Typography>
        {renderAnswerInputs()}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" disabled={index === 0} onClick={() => setIndex((prev) => prev - 1)}>
          Câu trước
        </Button>
        {index === quiz.questions.length - 1 ? (
          <Button variant="contained" onClick={submit} disabled={submitting}>
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </Button>
        ) : (
          <Button variant="contained" onClick={() => setIndex((prev) => prev + 1)}>
            Câu tiếp theo
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default TakeQuiz;
