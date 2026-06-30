import { Router } from 'express';
import * as repairController from '../controllers/repair.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { mongoIdSchema } from '../validators/common.validator';

const router = Router();

router.get('/issues/:id/repair', authenticate, validate(mongoIdSchema, 'params'), repairController.getRepairPlan);
router.put(
  '/repairs/:id/progress',
  authenticate,
  authorize('officer', 'admin'),
  validate(mongoIdSchema, 'params'),
  repairController.updateProgress
);

export default router;
