import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/overview', authenticate, authorize('officer', 'admin'), analyticsController.getOverview);
router.get('/heatmap', authenticate, analyticsController.getHeatmap);

export default router;
