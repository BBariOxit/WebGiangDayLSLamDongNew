import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { createLesson, listLessons, getLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';

const router = Router();

router.get('/', listLessons); // public list (optionally filter published)
router.get('/:id', getLesson); // public get (could restrict later)
router.post('/', verifyAccess, createLesson);
router.put('/:id', verifyAccess, updateLesson);
router.delete('/:id', verifyAccess, deleteLesson);

export default router;