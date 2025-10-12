import { 
  getQuizQuestions, 
  saveQuizAttempt, 
  getAttemptsByUser 
} from '../repositories/quizRepo.js';

export async function getQuizByLessonSvc(lessonId) {
  const rows = await getQuizQuestions(lessonId);
  if (!rows || rows.length === 0) {
    throw new Error('No quiz found for this lesson');
  }

  const quizId = rows[0].quiz_id; // provided by repo mapping
  // rows come from quiz_questions with options (TEXT[]) and correct_index, but we must not leak correct_index
  const questions = rows.map(r => ({
    questionId: r.question_id,
    questionText: r.question_text,
    options: Array.isArray(r.options) ? r.options : [],
    points: r.points || 1
  }));

  return { id: quizId, lessonId, questions };
}

export async function submitAttemptSvc(lessonId, userId, answers) {
  // Get correct answers from DB (do NOT send to client)
  const allQuestions = await getQuizQuestions(lessonId);
  const correctByQ = new Map();
  for (const row of allQuestions) {
    if (row.correct_index !== null && row.correct_index !== undefined) {
      correctByQ.set(row.question_id, [Number(row.correct_index)]);
    }
  }

  // Score
  let totalPoints = 0;
  let earnedPoints = 0;
  const results = [];

  for (const a of answers) {
    const questionId = a.questionId;
    const selected = (a.selectedAnswers || []).map(Number);
    const correct = correctByQ.get(questionId) || [];
    const qMeta = allQuestions.find(q => q.question_id === questionId);
    const points = qMeta?.points || 1;
    totalPoints += points;

    const isCorrect = selected.length === correct.length && selected.every(x => correct.includes(x));
    if (isCorrect) earnedPoints += points;

  results.push({ questionId, isCorrect, selectedAnswers: selected });
  }

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const attempt = await saveQuizAttempt({
    lessonId,
    userId,
    score: scorePercent,
    answers: JSON.stringify(answers)
  });

  return {
    attemptId: attempt.attempt_id,
    score: scorePercent,
    earnedPoints,
    totalPoints,
    results
  };
}

export async function getUserAttemptsSvc(lessonId, userId) {
  const attempts = await getAttemptsByUser(lessonId, userId);
  return attempts.map(a => ({
    attemptId: a.attempt_id,
    score: a.score,
    attemptedAt: a.created_at
  }));
}
