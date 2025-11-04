import {
  createQuizWithQuestions,
  getQuizById,
  listQuizzes,
  getQuizWithQuestions,
  deleteQuizAndQuestions,
  updateQuizMetadata,
  updateQuizWithQuestions
} from '../repositories/quizManagementRepo.js';
import { publishNewQuizNotification } from '../../notifications/services/notificationsService.js';

function ensureCanEdit(user) {
  if (!user) throw new Error('Unauthorized');
  const role = (user.roleName || user.role || '').toLowerCase();
  if (!['admin', 'teacher'].includes(role)) throw new Error('Forbidden');
}

const DEFAULT_ASSESSMENT_TYPES = new Set(['quiz', 'multi_choice', 'fill_blank']);
export const SCHEMA_OUTDATED_ERROR = 'DB_SCHEMA_OUTDATED';

function normalizeQuestions(rawQuestions, { requireAtLeastOne = true, assessmentType = 'quiz' } = {}) {
  if (!Array.isArray(rawQuestions)) {
    if (requireAtLeastOne) throw new Error('Invalid quiz questions');
    return null;
  }
  const quizType = DEFAULT_ASSESSMENT_TYPES.has(assessmentType) ? assessmentType : 'quiz';
  const questions = [];

  for (const q of rawQuestions) {
    const questionText = String(q.questionText || q.text || '').trim();
    if (!questionText) {
      continue;
    }

    const points = Number.isFinite(Number(q.points)) && Number(q.points) > 0 ? Number(q.points) : 1;
    const explanation = q.explanation || null;

    if (quizType === 'fill_blank' || (q.questionType === 'fill_blank')) {
      const rawAccepted = Array.isArray(q.acceptedAnswers)
        ? q.acceptedAnswers
        : Array.isArray(q.answers)
          ? q.answers.map(a => a.answerText || a.text)
          : [];
      const acceptedAnswers = rawAccepted
        .map(ans => String(ans || '').trim())
        .filter(Boolean);
      if (!acceptedAnswers.length) {
        continue;
      }
      questions.push({
        questionText,
        questionType: 'fill_blank',
        options: null,
        correctIndex: null,
        answerSchema: { acceptedAnswers },
        explanation,
        points
      });
      continue;
    }

    // Determine answers/options for multiple-choice variants
    let answers = [];
    if (Array.isArray(q.answers) && q.answers.length) {
      answers = q.answers
        .map(ans => ({
          text: String(ans?.answerText ?? ans?.text ?? '').trim(),
          isCorrect: Boolean(ans?.isCorrect || ans?.correct)
        }))
        .filter(ans => ans.text);
    }

    if (!answers.length && Array.isArray(q.options) && q.options.length) {
      answers = q.options
        .map((opt, idx) => ({
          text: String(opt ?? '').trim(),
          isCorrect: Array.isArray(q.correctIndexes)
            ? q.correctIndexes.includes(idx)
            : idx === q.correctIndex
        }))
        .filter(ans => ans.text);
    }

    if (answers.length < 2) {
      continue;
    }

    if (quizType === 'multi_choice' || q.questionType === 'multi_select') {
      const correctIndexes = answers
        .map((ans, idx) => (ans.isCorrect ? idx : null))
        .filter(idx => idx !== null);
      const safeCorrectIndexes = correctIndexes.length ? correctIndexes : [0];
      questions.push({
        questionText,
        questionType: 'multi_select',
        options: answers.map(ans => ans.text),
        correctIndex: null,
        answerSchema: { correctIndexes: safeCorrectIndexes },
        explanation,
        points
      });
      continue;
    }

    // default single-choice quiz question
    let correctIndex = answers.findIndex(ans => ans.isCorrect);
    if (correctIndex < 0) {
      correctIndex = 0;
      answers[0] = { ...answers[0], isCorrect: true };
    }

    questions.push({
      questionText,
      questionType: 'single_choice',
      options: answers.map(ans => ans.text),
      correctIndex,
      answerSchema: null,
      explanation,
      points
    });
  }

  if (!questions.length) {
    if (requireAtLeastOne) throw new Error('Invalid quiz questions');
    return null;
  }

  return questions;
}

export async function createQuizSvc({ title, description, lessonId, questions, timeLimit, difficulty, assessmentType = 'quiz' }, user) {
  ensureCanEdit(user);
  const safeAssessment = DEFAULT_ASSESSMENT_TYPES.has(assessmentType) ? assessmentType : 'quiz';
  const normQuestions = normalizeQuestions(questions, { assessmentType: safeAssessment });
  let result;
  try {
    result = await createQuizWithQuestions({
      title,
      description,
      lessonId: lessonId || null,
      createdBy: user.id,
      timeLimit,
      difficulty,
      assessmentType: safeAssessment,
      questions: normQuestions
    });
  } catch (error) {
    if (error?.code === '42703') {
      const schemaErr = new Error(SCHEMA_OUTDATED_ERROR);
      schemaErr.code = SCHEMA_OUTDATED_ERROR;
      throw schemaErr;
    }
    throw error;
  }
  try { await publishNewQuizNotification({ ...result, quiz_id: result.quiz_id, lesson_id: result.lesson_id }); } catch {}
  return result;
}

export async function updateQuizSvc(quizId, { title, description, lessonId, timeLimit, difficulty, questions, assessmentType = 'quiz' }, user) {
  ensureCanEdit(user);
  
  const existing = await getQuizById(quizId);
  if (!existing) throw new Error('Not found');
  
  const createdBy = existing.created_by;
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && createdBy !== user.id) throw new Error('Forbidden');

  const safeAssessment = DEFAULT_ASSESSMENT_TYPES.has(assessmentType) ? assessmentType : (existing.assessment_type || 'quiz');
  const payload = { title, description, lessonId: lessonId || null, difficulty, timeLimit, assessmentType: safeAssessment };

  try {
    if (questions === undefined) {
      await updateQuizMetadata(quizId, payload);
    } else {
      const normalizedQuestions = normalizeQuestions(questions, { requireAtLeastOne: true, assessmentType: safeAssessment });
      await updateQuizWithQuestions(quizId, payload, normalizedQuestions);
    }
  } catch (error) {
    if (error?.code === '42703') {
      const schemaErr = new Error(SCHEMA_OUTDATED_ERROR);
      schemaErr.code = SCHEMA_OUTDATED_ERROR;
      throw schemaErr;
    }
    throw error;
  }

  return { success: true, quizId };
}

export async function deleteQuizSvc(quizId, user) {
  ensureCanEdit(user);
  
  const existing = await getQuizById(quizId);
  if (!existing) throw new Error('Not found');
  
  const createdBy = existing.created_by;
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && createdBy !== user.id) throw new Error('Forbidden');
  
  await deleteQuizAndQuestions(quizId);
  return { success: true };
}

export async function listQuizzesSvc(params, user) {
  // Admin sees all, Teacher sees own quizzes
  const filters = { ...params };
  
  if (user && (user.role || '').toLowerCase() === 'teacher') {
    filters.createdBy = user.id;
  }
  
  return listQuizzes(filters);
}

export async function getQuizDetailSvc(quizId, user) {
  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) throw new Error('Not found');
  
  // Admin and creator can see, students can see if published lesson or standalone
  if (user && ((user.role || '').toLowerCase() === 'admin' || quiz.created_by === user.id)) {
    return quiz;
  }
  
  // For students, could add check if quiz is in published lesson
  return quiz;
}
