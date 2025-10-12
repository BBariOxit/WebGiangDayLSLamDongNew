import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { getPublic, getMine } from '../controllers/analyticsController.js';

const router = Router();

router.get('/public', getPublic);
router.get('/me', verifyAccess, getMine);

export default router;
