import { useEffect, useState, useCallback, useMemo } from 'react';
import {
	Dialog, DialogTitle, DialogContent, DialogActions,
	Button, Typography, Box, LinearProgress, Chip, Stack, RadioGroup,
	FormControlLabel, Radio, Divider, Alert
} from '@mui/material';
import quizService from '../services/quizService';

// Props: lessonId (number), open (bool), onClose(), onCompleted(summary)
export default function LessonQuiz({ lessonId, open, onClose, onCompleted }) {
	const [quiz, setQuiz] = useState(null);
	const [started, setStarted] = useState(false);
	const [current, setCurrent] = useState(0);
	const [answers, setAnswers] = useState({}); // questionId -> optionIndex
	const [submitted, setSubmitted] = useState(false);
	const [timeLeft, setTimeLeft] = useState(null); // seconds
	const [warning, setWarning] = useState(null);

	// Load quiz for lesson
	useEffect(() => {
		if (open && lessonId) {
			const q = quizService.getQuizByLessonId(lessonId);
			setQuiz(q || null);
			setStarted(false);
			setCurrent(0);
			setAnswers({});
			setSubmitted(false);
			setWarning(null);
			if (q?.timeLimit) setTimeLeft(q.timeLimit * 60);
		}
	}, [open, lessonId]);

	// Timer effect
	useEffect(() => {
		if (!started || submitted) return;
		if (timeLeft === 0) {
			handleSubmit();
			return;
		}
		const id = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
		return () => clearInterval(id);
	}, [started, submitted, timeLeft]);

	const total = quiz?.questions?.length || 0;
	const currentQuestion = quiz?.questions?.[current];

	const progressPct = useMemo(() => {
		if (!total) return 0;
		return Math.round(((current + (submitted ? 1 : 0)) / total) * 100);
	}, [current, submitted, total]);

	const handleStart = () => {
		if (!quiz) return;
		setStarted(true);
		setWarning(null);
	};

	const handleSelect = (qid, idx) => {
		if (submitted) return;
		setAnswers(a => ({ ...a, [qid]: idx }));
	};

	const handleNext = () => {
		if (current < total - 1) setCurrent(c => c + 1);
	};

	const handlePrev = () => {
		if (current > 0) setCurrent(c => c - 1);
	};

	const computeScore = useCallback(() => {
		if (!quiz) return 0;
		let correct = 0;
		quiz.questions.forEach(q => {
			if (answers[q.id] === q.correctIndex) correct += 1;
		});
		return Math.round((correct / quiz.questions.length) * 100);
	}, [quiz, answers]);

	const handleSubmit = () => {
		if (!quiz) return;
		if (!submitted) {
			const unanswered = quiz.questions.filter(q => answers[q.id] == null).length;
			if (unanswered > 0) {
				setWarning(`Còn ${unanswered} câu chưa trả lời. Bạn chắc chắn nộp bài?`);
				if (!warning) {
					// require second click to confirm
					setWarning(prev => prev || '');
					return;
				}
			}
			setSubmitted(true);
			const score = computeScore();
			const durationSeconds = quiz.timeLimit ? quiz.timeLimit * 60 - timeLeft : null;
			quizService.saveAttempt({
				userId: 'guest', // placeholder, integrate auth later
				quizId: quiz.id,
				score,
				durationSeconds,
				answers
			});
			if (onCompleted) {
				onCompleted({ score, answers, quiz });
			}
		} else {
			onClose?.();
		}
	};

	const handleClose = () => {
		if (!submitted && started) {
			if (!window.confirm('Thoát và mất tiến trình?')) return;
		}
		onClose?.();
	};

	const formatTime = s => {
		if (s == null) return '--:--';
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
			{!quiz && (
				<Box p={4}>
					<Typography variant="h6" gutterBottom>Không tìm thấy quiz cho bài học này.</Typography>
					<Button onClick={handleClose}>Đóng</Button>
				</Box>
			)}
			{quiz && !started && (
				<>
					<DialogTitle>Bắt đầu bài quiz</DialogTitle>
					<DialogContent dividers>
						<Typography gutterBottom>{quiz.description}</Typography>
						<Typography variant="body2" color="text.secondary" gutterBottom>
							Bài quiz gồm {quiz.questions.length} câu hỏi{quiz.timeLimit && ` với thời gian ${quiz.timeLimit} phút`}.
						</Typography>
						<Stack direction="row" spacing={1} mt={2}>
							<Chip label={quiz.category} size="small" />
							<Chip label={`Độ khó: ${quiz.difficulty}`} size="small" />
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Để sau</Button>
						<Button variant="contained" onClick={handleStart}>Bắt đầu ngay</Button>
					</DialogActions>
				</>
			)}
			{quiz && started && (
				<>
					<DialogTitle>
						{quiz.title}
						{submitted ? ' - Kết quả' : ''}
					</DialogTitle>
					<DialogContent dividers sx={{ bgcolor: submitted ? 'background.default' : 'inherit' }}>
						<Stack spacing={2}>
							<Box>
								<LinearProgress variant="determinate" value={progressPct} />
								<Stack direction="row" justifyContent="space-between" mt={0.5}>
									<Typography variant="caption">Câu {current + 1}/{total}</Typography>
									{quiz.timeLimit && (
										<Typography variant="caption" color={timeLeft < 60 ? 'error.main':'text.secondary'}>
											⏰ {formatTime(timeLeft)}
										</Typography>
									)}
								</Stack>
							</Box>

							{!submitted && currentQuestion && (
								<Box>
									<Typography variant="subtitle1" fontWeight={600} gutterBottom>
										{currentQuestion.text}
									</Typography>
									<RadioGroup
										value={answers[currentQuestion.id] ?? ''}
										onChange={e => handleSelect(currentQuestion.id, Number(e.target.value))}
									>
										{currentQuestion.options.map((opt, idx) => (
											<FormControlLabel
												key={idx}
												value={idx}
												control={<Radio />}
												label={opt}
											/>
										))}
									</RadioGroup>
								</Box>
							)}

							{submitted && (
								<Box>
									<Alert severity={computeScore() >= 70 ? 'success':'info'} sx={{ mb:2 }}>
										Điểm: {computeScore()}%. {computeScore() >= 70 ? 'Bạn đã vượt qua!' : 'Hãy ôn lại bài học và thử lại.'}
									</Alert>
									<Stack spacing={3}>
										{quiz.questions.map(q => {
											const userAns = answers[q.id];
											const correct = userAns === q.correctIndex;
											return (
												<Box key={q.id} p={2} border={1} borderColor={correct ? 'success.light':'divider'} borderRadius={2} bgcolor={correct ? 'success.50':'background.paper'}>
													<Typography fontWeight={600} mb={1}>{q.text}</Typography>
													<Stack spacing={0.5}>
														{q.options.map((opt, idx) => {
															const isUser = idx === userAns;
															const isCorrect = idx === q.correctIndex;
															return (
																<Box key={idx} px={1} py={0.5} borderRadius={1}
																	sx={{
																		fontSize: 14,
																		border: '1px solid',
																		borderColor: isCorrect ? 'success.main' : (isUser ? 'error.main' : 'divider'),
																		bgcolor: isCorrect ? 'success.50' : (isUser && !isCorrect ? 'error.50' : 'transparent')
																	}}>
																	{opt}
																	{isCorrect && ' ✓'}
																	{isUser && !isCorrect && ' ✗'}
																</Box>
															);
														})}
													</Stack>
													{q.explanation && (
														<Typography mt={1} variant="body2" color="text.secondary">
															Giải thích: {q.explanation}
														</Typography>
													)}
												</Box>
											);
										})}
									</Stack>
								</Box>
							)}

							{warning && !submitted && (
								<Alert severity="warning" onClose={() => setWarning(null)}>{warning || 'Bạn chắc chứ?'}</Alert>
							)}
						</Stack>
					</DialogContent>
					<DialogActions>
						{!submitted && (
							<>
								<Button onClick={handlePrev} disabled={current === 0}>Trước</Button>
								<Button onClick={handleNext} disabled={current === total - 1}>Tiếp</Button>
								<Box flexGrow={1} />
								<Button color="error" onClick={handleClose}>Hủy</Button>
								<Button variant="contained" onClick={handleSubmit}>Nộp bài</Button>
							</>
						)}
						{submitted && (
							<Button variant="contained" onClick={handleSubmit}>Đóng</Button>
						)}
					</DialogActions>
				</>
			)}
		</Dialog>
	);
}

