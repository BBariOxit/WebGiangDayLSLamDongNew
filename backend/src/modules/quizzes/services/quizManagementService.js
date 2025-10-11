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
  if (!['Admin', 'Teacher'].includes(user.roleName || user.role)) throw new Error('Forbidden');
}

export async function createQuizSvc({ title, description, lessonId, questions, timeLimit, difficulty }, user) {
  ensureCanEdit(user);
  const normQuestions = (questions || []).map(q => ({
    questionText: q.questionText || q.text,
    options: q.options || (q.answers ? q.answers.map(a => a.answerText) : q.options),
    correctIndex: q.correctIndex !== undefined ? q.correctIndex : (q.answers ? q.answers.findIndex(a=>a.isCorrect) : q.correctIndex),
    explanation: q.explanation || null,
    points: q.points || 1
  }));
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
  if (user.role !== 'Admin' && createdBy !== user.id) throw new Error('Forbidden');
  
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
  if (user.role !== 'Admin' && createdBy !== user.id) throw new Error('Forbidden');
  
  await deleteQuizAndQuestions(quizId);
  return { success: true };
}

export async function listQuizzesSvc(params, user) {
  // Admin sees all, Teacher sees own quizzes
  const filters = { ...params };
  
  if (user && user.role === 'Teacher') {
    filters.createdBy = user.id;
  }
  
  return listQuizzes(filters);
}

export async function getQuizDetailSvc(quizId, user) {
  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) throw new Error('Not found');
  
  // Admin and creator can see, students can see if published lesson or standalone
  if (user && (user.role === 'Admin' || quiz.created_by === user.id)) {
    return quiz;
  }
  
  // For students, could add check if quiz is in published lesson
  return quiz;
}
