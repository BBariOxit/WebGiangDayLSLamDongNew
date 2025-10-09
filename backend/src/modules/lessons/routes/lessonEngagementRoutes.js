import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { listCommentsCtrl, createCommentCtrl, deleteCommentCtrl, saveProgressCtrl, getProgressCtrl, ratingSummaryCtrl, quizBundleCtrl, submitQuizAttemptCtrl, listAttemptsCtrl } from '../controllers/lessonEngagementController.js';

const router = Router();

// Comments
router.get('/:lessonId/comments', listCommentsCtrl);
router.post('/:lessonId/comments', verifyAccess, createCommentCtrl);
router.delete('/:lessonId/comments/:commentId', verifyAccess, deleteCommentCtrl);

// Progress
router.get('/:lessonId/progress', verifyAccess, getProgressCtrl);
router.post('/:lessonId/progress', verifyAccess, saveProgressCtrl);

// Rating summary
router.get('/:lessonId/rating-summary', ratingSummaryCtrl);

// Quiz bundle (quiz + questions)
router.get('/:lessonId/quiz', quizBundleCtrl);

// Quiz attempts
router.get('/quiz/:quizId/attempts', verifyAccess, listAttemptsCtrl);
router.post('/quiz/:quizId/attempts', verifyAccess, submitQuizAttemptCtrl);

export default router;
