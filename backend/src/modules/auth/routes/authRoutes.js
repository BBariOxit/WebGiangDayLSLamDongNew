import { Router } from 'express';
import { register, login, google, refresh, logout, me } from '../controllers/authController.js';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyAccess, me);

export default router;
