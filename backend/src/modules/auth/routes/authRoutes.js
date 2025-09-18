import { Router } from 'express';
import { register, login, google, refresh, logout } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
