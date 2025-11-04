import { 
  getQuizQuestions, 
  saveQuizAttempt, 
  getAttemptsByUser,
  getQuizQuestionsByQuizId,
  saveQuizAttemptByQuizId,
  getLessonIdByQuiz
} from '../repositories/quizRepo.js';
import { markLessonCompleted } from '../../lessons/repositories/lessonEngagementRepo.js';

const PASSING_SCORE = 70;

const normalizeAnswerText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
};

function buildQuestionMeta(rows) {
  const meta = new Map();
  for (const row of rows) {
    const questionType = (row.question_type || '').toLowerCase() || 'single_choice';
    const answerSchema = row.answer_schema || {};
    const points = row.points || 1;
    const correctIndex = typeof row.correct_index === 'number' ? row.correct_index : null;
    meta.set(row.question_id, {
      questionId: row.question_id,
      questionText: row.question_text,
      questionType,
      answerSchema,
      correctIndex,
      options: Array.isArray(row.options) ? row.options : [],
      assessmentType: row.assessment_type || 'quiz',
      points
    });
  }
  return meta;
}

function gradeAnswers(questionMeta, rawAnswers) {
  let totalPoints = 0;
  let earnedPoints = 0;
  const detailedResults = [];

  const submissions = Array.isArray(rawAnswers) ? rawAnswers : [];
  const answersByQuestion = new Map(submissions.map(a => [Number(a.questionId), a]));

  for (const [questionId, meta] of questionMeta.entries()) {
    totalPoints += meta.points;
    const submission = answersByQuestion.get(Number(questionId)) || {};
    const type = meta.questionType;
    let isCorrect = false;
    let selectedAnswers = [];
    let submittedText = null;

    if (type === 'fill_blank') {
      const accepted = Array.isArray(meta.answerSchema?.acceptedAnswers)
        ? meta.answerSchema.acceptedAnswers.map(normalizeAnswerText)
        : [];
      submittedText = submission.writtenAnswer ?? submission.typedAnswer ?? submission.answerText ?? '';
      const normalized = normalizeAnswerText(submittedText);
      isCorrect = normalized.length > 0 && accepted.includes(normalized);
    } else if (type === 'multi_select') {
      const correctIndexes = Array.isArray(meta.answerSchema?.correctIndexes)
        ? meta.answerSchema.correctIndexes.map(Number).filter(Number.isFinite).sort((a,b)=>a-b)
        : [];
      selectedAnswers = Array.isArray(submission.selectedAnswers)
        ? submission.selectedAnswers.map(Number).filter(Number.isFinite).sort((a,b)=>a-b)
        : [];
      if (correctIndexes.length === 0) {
        // Fallback to single correct_index if schema missing
        const fallback = typeof meta.correctIndex === 'number' ? [meta.correctIndex] : [];
        isCorrect = selectedAnswers.length === fallback.length && selectedAnswers.every(idx => fallback.includes(idx));
      } else {
        isCorrect = selectedAnswers.length === correctIndexes.length && selectedAnswers.every((idx, i) => idx === correctIndexes[i]);
      }
    } else {
      const correct = typeof meta.correctIndex === 'number' ? meta.correctIndex : null;
      selectedAnswers = Array.isArray(submission.selectedAnswers)
        ? submission.selectedAnswers.map(Number).filter(Number.isFinite)
        : [];
      if (selectedAnswers.length > 1) {
        selectedAnswers = [selectedAnswers[0]];
      }
      const chosen = selectedAnswers[0];
      isCorrect = correct !== null && chosen === correct;
    }

    if (isCorrect) {
      earnedPoints += meta.points;
    }

    detailedResults.push({
      questionId,
      questionType: type,
      isCorrect,
      selectedAnswers,
      submittedText
    });
  }

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return { totalPoints, earnedPoints, scorePercent, results: detailedResults };
}

export async function getQuizByLessonSvc(lessonId) {
  const rows = await getQuizQuestions(lessonId);
  if (!rows || rows.length === 0) {
    throw new Error('No quiz found for this lesson');
  }

  const quizId = rows[0].quiz_id; // provided by repo mapping
  const assessmentType = rows[0].assessment_type || 'quiz';
  // rows come from quiz_questions with options (TEXT[]) and correct_index, but we must not leak correct_index
  const questions = rows.map(r => ({
    questionId: r.question_id,
    questionText: r.question_text,
    questionType: (r.question_type || '').toLowerCase() || 'single_choice',
    options: Array.isArray(r.options) ? r.options : [],
    points: r.points || 1
  }));

  return { id: quizId, lessonId, assessmentType, questions };
}

export async function getQuizByQuizIdSvc(quizId) {
  const rows = await getQuizQuestionsByQuizId(quizId);
  if (!rows || rows.length === 0) throw new Error('Not found');
  const questions = rows.map(r => ({
    questionId: r.question_id,
    questionText: r.question_text,
    questionType: (r.question_type || '').toLowerCase() || 'single_choice',
    options: Array.isArray(r.options) ? r.options : [],
    points: r.points || 1
  }));
  const assessmentType = rows[0].assessment_type || 'quiz';
  return { id: quizId, assessmentType, questions };
}

export async function submitAttemptSvc(lessonId, userId, answers) {
  // Get correct answers from DB (do NOT send to client)
  const allQuestions = await getQuizQuestions(lessonId);
  const meta = buildQuestionMeta(allQuestions);
  const { totalPoints, earnedPoints, scorePercent, results } = gradeAnswers(meta, answers);

  const attempt = await saveQuizAttempt({
    lessonId,
    userId,
    score: scorePercent,
    answers: JSON.stringify(answers)
  });

  if (scorePercent >= PASSING_SCORE) {
    try {
      await markLessonCompleted({ lessonId, userId, score: scorePercent });
    } catch (err) {
      console.warn('markLessonCompleted failed', err);
    }
  }

  return {
    attemptId: attempt.attempt_id,
    score: scorePercent,
    earnedPoints,
    totalPoints,
    results
  };
}

export async function submitAttemptByQuizIdSvc(quizId, userId, answers) {
  const allQuestions = await getQuizQuestionsByQuizId(quizId);
  const meta = buildQuestionMeta(allQuestions);
  const { totalPoints, earnedPoints, scorePercent, results } = gradeAnswers(meta, answers);
  const attempt = await saveQuizAttemptByQuizId({ quizId, userId, score: scorePercent, answers: JSON.stringify(answers) });
  if (scorePercent >= PASSING_SCORE) {
    try {
      const lessonId = await getLessonIdByQuiz(quizId);
      if (lessonId) await markLessonCompleted({ lessonId, userId, score: scorePercent });
    } catch (err) {
      console.warn('markLessonCompleted failed', err);
    }
  }
  return { attemptId: attempt.attempt_id, score: scorePercent, earnedPoints, totalPoints, results };
}

export async function getUserAttemptsSvc(lessonId, userId) {
  const attempts = await getAttemptsByUser(lessonId, userId);
  return attempts.map(a => ({
    attemptId: a.attempt_id,
    score: a.score,
    attemptedAt: a.created_at
  }));
}
