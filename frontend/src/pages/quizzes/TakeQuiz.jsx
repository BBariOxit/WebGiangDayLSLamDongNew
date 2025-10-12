import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { quizApi } from '../../api/quizApi';
import { Box, Container, Paper, Typography, LinearProgress, RadioGroup, FormControlLabel, Radio, Button, Chip } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = React.useState(null);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Load quiz meta (public)
        const meta = await quizApi.getPublicQuizById(id);
        if (!meta) throw new Error('Không tìm thấy quiz');
        // Load questions by quizId directly
        const bundle = await quizApi.getQuizQuestionsByQuizId(id);
        const q = {
          id: meta.quiz_id,
          title: meta.title,
          description: meta.description,
          timeLimit: meta.time_limit || 10,
          lessonId: meta.lesson_id,
          questions: (bundle?.questions || []).map(b => ({
            id: b.questionId || b.question_id,
            text: b.questionText || b.question_text,
            options: b.options || []
          }))
        };
        if (mounted) {
          setQuiz(q);
          setTimeLeft(q.timeLimit * 60);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Lỗi tải quiz');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p:3 }}>
          <Typography>Đang tải quiz...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!quiz || error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p:3 }}>
          <Typography>{error || 'Không tìm thấy quiz.'}</Typography>
        </Paper>
      </Container>
    );
  }

  const q = quiz.questions[index];
  const progress = ((index + 1) / quiz.questions.length) * 100;

  const submit = async () => {
    // Build answers payload: [{ questionId, selectedAnswers: [index] }]
    const payloadAnswers = quiz.questions.map(qq => ({
      questionId: Number(qq.id),
      selectedAnswers: (answers[qq.id] !== undefined) ? [Number(answers[qq.id])] : []
    }));
    try {
      const result = await quizApi.submitAttemptByQuizId(quiz.id, payloadAnswers);
      navigate(`/quizzes/results/${quiz.id}` , { state: { result, quiz } });
    } catch (e) {
      setError(e.message || 'Nộp bài thất bại');
    }
  };

  const format = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p:3, mb:3 }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">{quiz.title}</Typography>
            <Typography variant="body2" color="text.secondary">Câu {index+1}/{quiz.questions.length}</Typography>
          </Box>
          <Chip icon={<TimerIcon/>} label={format(timeLeft)} color={timeLeft < 60 ? 'error' : 'primary'} />
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Paper>

      <Paper sx={{ p:3, mb:3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb:2 }}>{q.text}</Typography>
        <RadioGroup value={answers[q.id] ?? ''} onChange={(e)=> setAnswers(a => ({...a, [q.id]: Number(e.target.value)}))}>
          {q.options.map((opt, i) => (
            <FormControlLabel key={i} value={i} control={<Radio/>} label={opt} sx={{ mb:1 }} />
          ))}
        </RadioGroup>
      </Paper>

      <Box sx={{ display:'flex', justifyContent:'space-between' }}>
        <Button variant="outlined" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Câu trước</Button>
        {index === quiz.questions.length - 1 ? (
          <Button variant="contained" onClick={submit}>Nộp bài</Button>
        ) : (
          <Button variant="contained" onClick={()=>setIndex(i=>i+1)}>Câu tiếp theo</Button>
        )}
      </Box>
    </Container>
  );
};

export default TakeQuiz;
