import { Router } from 'express';
import * as departmentController from '../controllers/department.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { mongoIdSchema } from '../validators/common.validator';

const router = Router();

router.get('/', authenticate, departmentController.listDepartments);
router.post('/', authenticate, authorize('admin'), departmentController.createDepartment);
router.get(
  '/:id/stats',
  authenticate,
  authorize('officer', 'admin'),
  validate(mongoIdSchema, 'params'),
  departmentController.getDepartmentStats
);

export default router;
