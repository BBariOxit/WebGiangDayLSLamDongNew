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

function normalizeQuestions(rawQuestions, { requireAtLeastOne = true } = {}) {
  if (!Array.isArray(rawQuestions)) {
    if (requireAtLeastOne) throw new Error('Invalid quiz questions');
    return null;
  }
  const questions = [];

  for (const q of rawQuestions) {
    const questionText = String(q.questionText || q.text || '').trim();
    if (!questionText) {
      continue;
    }

    let answers = [];
    if (Array.isArray(q.answers) && q.answers.length) {
      answers = q.answers
        .map((ans, idx) => ({
          text: String(ans?.answerText ?? ans?.text ?? '').trim(),
          isCorrect: Boolean(ans?.isCorrect || ans?.correct)
        }))
        .filter(ans => ans.text);
    }

    if (!answers.length && Array.isArray(q.options) && q.options.length) {
      answers = q.options
        .map((opt, idx) => ({
          text: String(opt ?? '').trim(),
          isCorrect: idx === q.correctIndex
        }))
        .filter(ans => ans.text);
    }

    if (answers.length < 2) {
      continue;
    }

    let correctIndex = answers.findIndex(ans => ans.isCorrect);
    if (correctIndex < 0) {
      correctIndex = 0;
      answers[0] = { ...answers[0], isCorrect: true };
    }

    questions.push({
      questionText,
      options: answers.map(ans => ans.text),
      correctIndex,
      explanation: q.explanation || null,
      points: Number.isFinite(Number(q.points)) && Number(q.points) > 0 ? Number(q.points) : 1
    });
  }

  if (!questions.length) {
    if (requireAtLeastOne) throw new Error('Invalid quiz questions');
    return null;
  }

  return questions;
}

export async function createQuizSvc({ title, description, lessonId, questions, timeLimit, difficulty }, user) {
  ensureCanEdit(user);
  const normQuestions = normalizeQuestions(questions);
  const result = await createQuizWithQuestions({
    title,
    description,
    lessonId: lessonId || null,
    createdBy: user.id,
    timeLimit,
    difficulty,
    questions: normQuestions
  });
  try { await publishNewQuizNotification({ ...result, quiz_id: result.quiz_id, lesson_id: result.lesson_id }); } catch {}
  return result;
}

export async function updateQuizSvc(quizId, { title, description, lessonId, timeLimit, difficulty, questions }, user) {
  ensureCanEdit(user);
  
  const existing = await getQuizById(quizId);
  if (!existing) throw new Error('Not found');
  
  const createdBy = existing.created_by;
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && createdBy !== user.id) throw new Error('Forbidden');

  const payload = { title, description, lessonId: lessonId || null, difficulty, timeLimit };

  if (questions === undefined) {
    await updateQuizMetadata(quizId, payload);
  } else {
    const normalizedQuestions = normalizeQuestions(questions, { requireAtLeastOne: true });
    await updateQuizWithQuestions(quizId, payload, normalizedQuestions);
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
