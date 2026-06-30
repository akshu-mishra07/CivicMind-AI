import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { commentSchema } from '../validators/issue.validator';
import { mongoIdSchema } from '../validators/common.validator';

const router = Router();

// Routes nested or referenced on issue resources
router.post('/issues/:id/comments', authenticate, validate(mongoIdSchema, 'params'), validate(commentSchema), commentController.addComment);
router.get('/issues/:id/comments', authenticate, validate(mongoIdSchema, 'params'), commentController.getComments);

export default router;
