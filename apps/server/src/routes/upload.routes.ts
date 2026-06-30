import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadImages, uploadVideo, uploadVoice } from '../middleware/upload.middleware';

const router = Router();

router.post('/images', authenticate, uploadImages, uploadController.uploadImages);
router.post('/video', authenticate, uploadVideo, uploadController.uploadVideo);
router.post('/voice', authenticate, uploadVoice, uploadController.uploadVoice);

export default router;
