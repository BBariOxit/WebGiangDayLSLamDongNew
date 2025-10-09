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

const router = Router();

// Management routes (CRUD) - must be before :lessonId param routes
router.get('/manage/list', verifyAccess, listQuizzes); // List all quizzes (admin/teacher)
router.get('/manage/:id', verifyAccess, getQuizDetail); // Get quiz detail for editing
router.post('/manage', verifyAccess, createQuiz); // Create new quiz
router.put('/manage/:id', verifyAccess, updateQuiz); // Update quiz
router.delete('/manage/:id', verifyAccess, deleteQuiz); // Delete quiz

// Public/student routes (existing)
router.get('/:lessonId', getQuiz); // Get quiz questions (for a lesson)
router.post('/:lessonId/submit', verifyAccess, submitQuizAttempt); // Submit quiz attempt
router.get('/:lessonId/attempts', verifyAccess, getUserAttempts); // Get user's quiz attempts

export default router;
