import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { 
  getQuiz, 
  submitQuizAttempt, 
  getUserAttempts 
 } from '../controllers/quizController.js';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  listQuizzes,
  getQuizDetail
 } from '../controllers/quizManagementController.js';
import { listQuizzes as listQuizzesRepo, getQuizWithQuestions } from '../repositories/quizManagementRepo.js';

const router = Router();

// Management routes (CRUD) - must be before :lessonId param routes
router.get('/manage/list', verifyAccess, listQuizzes); // List all quizzes (admin/teacher)
router.get('/manage/:id', verifyAccess, getQuizDetail); // Get quiz detail for editing
router.post('/manage', verifyAccess, createQuiz); // Create new quiz
router.put('/manage/:id', verifyAccess, updateQuiz); // Update quiz
router.delete('/manage/:id', verifyAccess, deleteQuiz); // Delete quiz

// Public routes for students
router.get('/public/list', async (req, res) => {
  try {
    const params = {
      lessonId: req.query.lessonId ? parseInt(req.query.lessonId, 10) : undefined
    };
    const rows = await listQuizzesRepo(params);
    // Shape: hide nothing sensitive at list level
    const data = rows.map(r => ({
      quiz_id: r.quiz_id,
      title: r.title,
      description: r.description,
      lesson_id: r.lesson_id,
      difficulty: r.difficulty,
      time_limit: r.time_limit,
      created_at: r.created_at,
      creator_name: r.creator_name,
      lesson_title: r.lesson_title
    }));
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});
router.get('/public/:id', async (req, res) => {
  try {
    const quizId = parseInt(req.params.id, 10);
    const quiz = await getQuizWithQuestions(quizId);
    if (!quiz) return res.status(404).json({ success: false, error: 'Not found' });
    // Omit correct_index
    const safe = {
      quiz_id: quiz.quiz_id,
      title: quiz.title,
      description: quiz.description,
      lesson_id: quiz.lesson_id,
      difficulty: quiz.difficulty,
      time_limit: quiz.time_limit,
      created_at: quiz.created_at,
      questions: (quiz.questions || []).map(q => ({
        question_id: q.question_id,
        question_text: q.question_text,
        options: q.options || [],
        explanation: q.explanation || null,
        position: q.position
      }))
    };
    res.json({ success: true, data: safe });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Public/student routes (existing)
router.get('/:lessonId', getQuiz); // Get quiz questions (for a lesson)
router.post('/:lessonId/submit', verifyAccess, submitQuizAttempt); // Submit quiz attempt
router.get('/:lessonId/attempts', verifyAccess, getUserAttempts); // Get user's quiz attempts

export default router;
