import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { mongoIdSchema } from '../validators/common.validator';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.put('/:id/read', authenticate, validate(mongoIdSchema, 'params'), notificationController.markRead);

export default router;
