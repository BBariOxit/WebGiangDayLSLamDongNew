import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { createLesson, listLessons, getLesson, getLessonBySlug, updateLesson, deleteLesson } from '../controllers/lessonController.js';

const router = Router();

router.get('/', listLessons); // public list (optionally filter published)
router.get('/slug/:slug', getLessonBySlug); // slug-based fetch
router.get('/:id', getLesson); // numeric id
router.post('/', verifyAccess, createLesson);
router.put('/:id', verifyAccess, updateLesson);
router.delete('/:id', verifyAccess, deleteLesson);

export default router;