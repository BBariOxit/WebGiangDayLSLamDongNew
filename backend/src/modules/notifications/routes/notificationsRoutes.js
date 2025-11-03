import { Router } from 'express';
import { verifyAccess } from '../../../middlewares/authMiddleware.js';
import { getMyNotifications, markReadCtrl, markAllReadCtrl } from '../controllers/notificationsController.js';

const router = Router();

router.get('/', verifyAccess, getMyNotifications);
router.post('/:id/read', verifyAccess, markReadCtrl);
router.post('/read-all', verifyAccess, markAllReadCtrl);

export default router;
