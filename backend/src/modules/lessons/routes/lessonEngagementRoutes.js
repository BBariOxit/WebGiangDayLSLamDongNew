import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { listCommentsCtrl, createCommentCtrl, deleteCommentCtrl, saveProgressCtrl, getProgressCtrl, ratingSummaryCtrl, quizBundleCtrl, submitQuizAttemptCtrl, listAttemptsCtrl, addBookmarkCtrl, removeBookmarkCtrl, listBookmarksCtrl, recordStudySessionCtrl, listProgressCtrl } from '../controllers/lessonEngagementController.js';

const router = Router();

// User aggregates
router.get('/me/progress', verifyAccess, listProgressCtrl);
router.get('/me/bookmarks', verifyAccess, listBookmarksCtrl);

// Comments
router.get('/:lessonId/comments', listCommentsCtrl);
router.post('/:lessonId/comments', verifyAccess, createCommentCtrl);
router.delete('/:lessonId/comments/:commentId', verifyAccess, deleteCommentCtrl);

// Progress
router.get('/:lessonId/progress', verifyAccess, getProgressCtrl);
router.post('/:lessonId/progress', verifyAccess, saveProgressCtrl);

// Rating summary
router.get('/:lessonId/rating-summary', ratingSummaryCtrl);

// Study sessions (count views)
router.post('/:lessonId/study-sessions', recordStudySessionCtrl);

// Quiz bundle (quiz + questions)
router.get('/:lessonId/quiz', quizBundleCtrl);

// Quiz attempts
router.get('/quiz/:quizId/attempts', verifyAccess, listAttemptsCtrl);
router.post('/quiz/:quizId/attempts', verifyAccess, submitQuizAttemptCtrl);

// Bookmarks
router.post('/:lessonId/bookmark', verifyAccess, addBookmarkCtrl);
router.delete('/:lessonId/bookmark', verifyAccess, removeBookmarkCtrl);

export default router;
