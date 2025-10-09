import { 
  getQuizQuestions, 
  saveQuizAttempt, 
  getAttemptsByUser 
} from '../repositories/quizRepo.js';

export async function getQuizByLessonSvc(lessonId) {
  const questions = await getQuizQuestions(lessonId);
  if (!questions || questions.length === 0) {
    throw new Error('No quiz found for this lesson');
  }
  
  // Group answers by question
  const questionsMap = new Map();
  for (const row of questions) {
    const qid = row.question_id;
    if (!questionsMap.has(qid)) {
      questionsMap.set(qid, {
        questionId: qid,
        questionText: row.question_text,
        questionType: row.question_type,
        points: row.points,
        answers: []
      });
    }
    if (row.answer_id) {
      questionsMap.get(qid).answers.push({
        answerId: row.answer_id,
        answerText: row.answer_text
        // Don't send is_correct to client!
      });
    }
  }
  
  return {
    lessonId,
    questions: Array.from(questionsMap.values())
  };
}

export async function submitAttemptSvc(lessonId, userId, answers) {
  // Get correct answers from DB
  const allQuestions = await getQuizQuestions(lessonId);
  const correctMap = new Map();
  
  for (const row of allQuestions) {
    if (!correctMap.has(row.question_id)) {
      correctMap.set(row.question_id, []);
    }
    if (row.is_correct) {
      correctMap.get(row.question_id).push(row.answer_id);
    }
  }
  
  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;
  const results = [];
  
  for (const ans of answers) {
    const { questionId, selectedAnswers } = ans;
    const correctAnswers = correctMap.get(questionId) || [];
    const question = allQuestions.find(q => q.question_id === questionId);
    const points = question?.points || 1;
    totalPoints += points;
    
    // Check if correct (all selected answers match correct answers)
    const selectedSet = new Set(selectedAnswers);
    const correctSet = new Set(correctAnswers);
    const isCorrect = selectedSet.size === correctSet.size && 
                      [...selectedSet].every(a => correctSet.has(a));
    
    if (isCorrect) {
      earnedPoints += points;
    }
    
    results.push({
      questionId,
      isCorrect,
      selectedAnswers,
      correctAnswers: isCorrect ? [] : correctAnswers // Only show if wrong
    });
  }
  
  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  
  // Save attempt to DB
  const attempt = await saveQuizAttempt({
    lessonId,
    userId,
    score: scorePercent,
    answers: JSON.stringify(answers)
  });
  
  return {
    attemptId: attempt.quiz_attempt_id,
    score: scorePercent,
    earnedPoints,
    totalPoints,
    results
  };
}

export async function getUserAttemptsSvc(lessonId, userId) {
  const attempts = await getAttemptsByUser(lessonId, userId);
  return attempts.map(a => ({
    attemptId: a.quiz_attempt_id,
    score: a.score,
    attemptedAt: a.attempted_at
  }));
}
