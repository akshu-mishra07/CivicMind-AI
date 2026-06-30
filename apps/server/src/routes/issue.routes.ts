import { Router } from 'express';
import * as issueController from '../controllers/issue.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createIssueSchema, updateStatusSchema } from '../validators/issue.validator';
import { mongoIdSchema } from '../validators/common.validator';

const router = Router();

router.post('/', authenticate, validate(createIssueSchema), issueController.reportIssue);
router.get('/', authenticate, issueController.listIssues);
router.get('/:id', authenticate, validate(mongoIdSchema, 'params'), issueController.getIssue);
router.post('/:id/vote', authenticate, validate(mongoIdSchema, 'params'), issueController.upvote);
router.delete('/:id/vote', authenticate, validate(mongoIdSchema, 'params'), issueController.removeVote);
router.post('/:id/verify', authenticate, validate(mongoIdSchema, 'params'), issueController.verifyIssue);
router.delete('/:id/verify', authenticate, validate(mongoIdSchema, 'params'), issueController.removeVerification);
router.put(
  '/:id/status',
  authenticate,
  authorize('officer', 'admin'),
  validate(mongoIdSchema, 'params'),
  validate(updateStatusSchema),
  issueController.updateStatus
);

export default router;
