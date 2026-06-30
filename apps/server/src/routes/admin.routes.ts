import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { mongoIdSchema } from '../validators/common.validator';

const router = Router();

// Secure all routes in this file to Admin role
router.use(authenticate, authorize('admin'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/role', validate(mongoIdSchema, 'params'), adminController.changeUserRole);
router.put('/users/:id/status', validate(mongoIdSchema, 'params'), adminController.toggleUserStatus);

export default router;
