import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, updateProfileSchema } from '../validators/auth.validator';
import { authLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.get('/me', authenticate, authController.getMe);
router.get('/leaderboard', authenticate, authController.getLeaderboard);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

export default router;
