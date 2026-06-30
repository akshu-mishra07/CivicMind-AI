import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { aiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/analyze-image', authenticate, aiLimiter, aiController.analyzeImage);
router.post('/chat', authenticate, aiLimiter, aiController.chat);
router.get('/predictions', authenticate, authorize('officer', 'admin'), aiLimiter, aiController.getPredictions);

export default router;
