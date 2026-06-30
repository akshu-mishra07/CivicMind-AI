import { Router } from 'express';
import authRoutes from './auth.routes';
import issueRoutes from './issue.routes';
import commentRoutes from './comment.routes';
import notificationRoutes from './notification.routes';
import departmentRoutes from './department.routes';
import repairRoutes from './repair.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';
import aiRoutes from './ai.routes';
import uploadRoutes from './upload.routes';

const router = Router();

// Mount all API sub-routers
router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/notifications', notificationRoutes);
router.use('/departments', departmentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/upload', uploadRoutes);

// Root level routers for nested resources (e.g. /issues/:id/comments, /issues/:id/repair)
router.use('/', commentRoutes);
router.use('/', repairRoutes);

export default router;
