import {
  createQuizWithQuestions,
  getQuizById,
  listQuizzes,
  getQuizWithQuestions,
  deleteQuizAndQuestions,
  updateQuizMetadata
} from '../repositories/quizManagementRepo.js';

function ensureCanEdit(user) {
  if (!user) throw new Error('Unauthorized');
  const role = (user.roleName || user.role || '').toLowerCase();
  if (!['admin', 'teacher'].includes(role)) throw new Error('Forbidden');
}

export async function createQuizSvc({ title, description, lessonId, questions, timeLimit, difficulty }, user) {
  ensureCanEdit(user);
  const normQuestions = (questions || []).map(q => {
    // accept questionType but ignore (for now only MC supported)
    const optsRaw = q.options || (q.answers ? q.answers.map(a => a.answerText) : []);
    const opts = (optsRaw || []).map(o => String(o || '').trim()).filter(Boolean);
    let correctIndex = q.correctIndex;
    if ((correctIndex === undefined || correctIndex === null) && Array.isArray(q.answers)) {
      correctIndex = q.answers.findIndex(a => a && a.isCorrect);
    }
    if (correctIndex == null || correctIndex < 0 || correctIndex >= opts.length) {
      correctIndex = 0; // fallback to first option
    }
    return {
      questionText: q.questionText || q.text || 'Câu hỏi',
      options: opts,
      correctIndex,
      explanation: q.explanation || null,
      points: Number.isFinite(q.points) ? q.points : 1
    };
  });
  const result = await createQuizWithQuestions({
    title,
    description,
    lessonId: lessonId || null,
    createdBy: user.id,
    timeLimit,
    difficulty,
    questions: normQuestions
  });
  return result;
}

export async function updateQuizSvc(quizId, { title, description, lessonId, timeLimit, difficulty }, user) {
  ensureCanEdit(user);
  
  const existing = await getQuizById(quizId);
  if (!existing) throw new Error('Not found');
  
  const createdBy = existing.created_by;
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && createdBy !== user.id) throw new Error('Forbidden');
  
  await updateQuizMetadata(quizId, { title, description, lessonId: lessonId || null, difficulty, timeLimit });
  
  // Could add full update: delete old questions, create new ones
  // But for simplicity, metadata update is sufficient
  
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
